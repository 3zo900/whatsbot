const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const axios = require('axios');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const Pino = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;
const OPENAI_KEY = process.env.OPENAI_KEY || ''; // حط مفتاح OpenAI في Render Env

app.use(cors({origin:'*'}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// تخزين الجلسات - كل تاجر له جلسة واتساب
const sessions = {}; // phone -> {sock, qr, connected, lastQR, pairingCode}
const clientsFile = path.join(__dirname, 'clients.json'); // انسخ نفس ملف admin/data/clients.json هنا أو اربطه عبر API
let clientsCache = [];

// تحميل العملاء - تربط مع موقعك
async function loadClients(){
  try{
    // جيب العملاء من موقعك مباشرة
    const res = await axios.get('https://wsbot.me/admin/data/clients.json', {timeout:5000}).catch(()=>null);
    if(res?.data) clientsCache = res.data;
    else if(fs.existsSync(clientsFile)) clientsCache = JSON.parse(fs.readFileSync(clientsFile));
  }catch(e){ console.log('loadClients error', e.message); }
}
setInterval(loadClients, 10000);
loadClients();

// توليد كود 8 أرقام
function genCode(){ return Math.floor(10000000 + Math.random()*90000000).toString(); }

// دالة بدء واتساب لتاجر معين
async function startTajerSession(phone){
  const folder = path.join(__dirname, 'auth', phone);
  if(!fs.existsSync(folder)) fs.mkdirSync(folder,{recursive:true});
  const { state, saveCreds } = await useMultiFileAuthState(folder);

  const sock = makeWASocket({
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, Pino({level:'silent'})) },
    logger: Pino({level:'silent'}),
    browser: ['WsBot.me','Chrome','1.0'],
    printQRInTerminal: false
  });

  sessions[phone] = sessions[phone] || {};
  sessions[phone].sock = sock;
  sessions[phone].pairingCode = genCode(); // كود 8 أرقام للتاجر

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update)=>{
    const { connection, lastDisconnect, qr } = update;
    if(qr){
      // حول QR لصورة base64
      const qrImage = await QRCode.toDataURL(qr);
      sessions[phone].qr = qrImage;
      sessions[phone].lastQR = Date.now();
      sessions[phone].connected = false;
      console.log(`📱 QR جديد للتاجر ${phone} - كود ${sessions[phone].pairingCode}`);
    }
    if(connection === 'open'){
      sessions[phone].connected = true;
      sessions[phone].qr = null;
      console.log(`✅ التاجر ${phone} متصل واتساب - بوت شغال`);
    }
    if(connection === 'close'){
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log(`❌ اتصال ${phone} انقطع ${reason}`);
      if(reason!== DisconnectReason.loggedOut){
        setTimeout(()=>startTajerSession(phone), 3000);
      }else{
        sessions[phone].connected = false;
      }
    }
  });

  // استقبال رسائل العملاء والرد بالذكاء
  sock.ev.on('messages.upsert', async ({messages})=>{
    for(const m of messages){
      if(m.key.fromMe) continue;
      const from = m.key.remoteJid;
      if(from.endsWith('@gropup')) continue;
      const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
      if(!text) continue;

      // ابحث عن التاجر
      const tajer = clientsCache.find(c=>c.phone==phone);
      if(!tajer) continue;
      if((tajer.aiBalance||0) <= 0){
        await sock.sendMessage(from, {text: '⏸️ انتهت باقة البوت - تواصل مع التاجر'});
        continue;
      }
      if(new Date(tajer.expiry) < new Date()){
        await sock.sendMessage(from, {text: '⏸️ اشتراك المتجر انتهى'});
        continue;
      }

      // زحف على رابط المتجر + رد AI
      let storeInfo = '';
      try{
        const page = await axios.get(tajer.storeLink, {timeout:7000});
        storeInfo = page.data.slice(0, 5000); // أول 5000 حرف من المتجر
      }catch(e){ storeInfo = 'متجر '+tajer.storeName; }

      let reply = '';
      if(OPENAI_KEY){
        try{
          const ai = await axios.post('https://api.openai.com/v1/chat/completions',{
            model:'gpt-4o-mini',
            messages:[
              {role:'system', content:`أنت بوت واتساب لمتجر ${tajer.storeName} - رابط المتجر ${tajer.storeLink} - معلومات المتجر: ${storeInfo} - رد بالعربي باختصار مفيد - إذا ما تعرف حول للموظف`},
              {role:'user', content:text}
            ],
            max_tokens:300
          },{headers:{Authorization:`Bearer ${OPENAI_KEY}`}});
          reply = ai.data.choices[0].message.content;
        }catch(e){ reply = `أهلاً بك في ${tajer.storeName} 🛒 ${tajer.storeLink} - كيف أقدر أساعدك؟`; }
      }else{
        reply = `أهلاً بك في ${tajer.storeName} 🛒 زر متجرنا ${tajer.storeLink}`;
      }

      await sock.sendMessage(from, {text: reply});

      // خصم رصيد AI وتحديث الملف عبر API لموقعك
      try{
        await axios.post('https://wsbot.me/admin/api_deduct.php', {phone, amount:1});
      }catch(e){}
    }
  });

  return sessions[phone];
}

// API: جلب QR - يتحدث تلقائي كل 5 ثواني
app.get('/api/qr', async (req,res)=>{
  const phone = (req.query.phone||'').replace(/[^0-9]/g,'');
  if(!phone) return res.status(400).json({error:'phone required'});
  if(!sessions[phone] ||!sessions[phone].sock){
    await startTajerSession(phone);
  }
  // إذا QR قديم أكثر من 15 ثانية - جدد الاتصال ليطلع QR جديد (يحل تعذر ربط الجهاز)
  if(sessions[phone] &&!sessions[phone].connected && sessions[phone].lastQR && Date.now()-sessions[phone].lastQR>15000){
    try{ sessions[phone].sock.ev.removeAllListeners(); }catch(e){}
    await startTajerSession(phone);
  }
  res.json({
    qr: sessions[phone]?.qr || null,
    connected:!!sessions[phone]?.connected,
    pairingCode: sessions[phone]?.pairingCode || genCode(), // كود 8 أرقام
    phone
  });
});

// API: حالة كل التجار
app.get('/api/status', (req,res)=>{
  const out={};
  for(const p in sessions) out[p]={connected:!!sessions[p].connected, hasQR:!!sessions[p].qr, code:sessions[p].pairingCode};
  res.json(out);
});

// صفحة رئيسية
app.get('/', (req,res)=> res.send('WsBot.me Baileys Server - Tajer QR Auto 5s - Ready ✅'));

app.listen(PORT, ()=> console.log(`🚀 WsBot.me Tajer Server on ${PORT}`));
