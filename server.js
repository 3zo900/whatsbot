const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const sessions = new Map();

// دالة إنشاء كود 8 أرقام - مصلحة نهائياً
async function createPairingCode(phoneNumber){
  const clean = phoneNumber.replace(/[^0-9]/g,'').trim();
  console.log(`📱 طلب كود للرقم: ${clean}`);

  // امسح جلسات قديمة لنفس الرقم
  try{
    const files = fs.readdirSync('.');
    files.forEach(f=>{
      if(f.startsWith('auth_'+clean)){
        try{ fs.rmSync(f, {recursive:true, force:true}); }catch(e){}
      }
    });
  }catch(e){}

  const folder = `auth_${clean}_${Date.now()}`;
  const { state, saveCreds } = await useMultiFileAuthState(folder);
  const { version } = await fetchLatestBaileysVersion();
  console.log(`Using WA v${version.join('.')}`);

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})),
    },
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"], // <-- هذا اللي يصلح تعذر ربط الجهاز
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
  });

  sock.ev.on('creds.update', saveCreds);

  return new Promise(async (resolve, reject)=>{
    let resolved = false;
    const timeout = setTimeout(()=>{
      if(!resolved){
        resolved = true;
        try{ sock.end(); }catch(e){}
        reject(new Error('انتهى وقت الانتظار - اطلب كود جديد'));
      }
    }, 120000); // 120 ثانية بدل 25

    sock.ev.on('connection.update', async (update)=>{
      const { connection, lastDisconnect } = update;
      if(connection === 'close'){
        const statusCode = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.statusCode;
        console.log(`❌ Closed ${clean} code: ${statusCode}`);
        if(!resolved && statusCode === 515){
          console.log('🔄 Restart required 515 - reconnecting');
        }
      }
      if(connection === 'open'){
        console.log(`✅ متصل ${clean}`);
      }
    });

    try{
      await delay(3000); // انتظر 3 ثواني قبل طلب الكود - مهم
      if(!state.creds.registered){
        const code = await sock.requestPairingCode(clean);
        console.log(`🔑 كود ${clean}: ${code}`);
        if(!resolved){
          resolved = true;
          clearTimeout(timeout);
          sessions.set(clean, {sock, code, folder, created: Date.now()});
          // لا نغلق السوكت - نخليه مفتوح 2 دقيقة عشان تربط
          setTimeout(()=>{ try{sock.end();}catch(e){} }, 120000);
          resolve(code);
        }
      } else {
        if(!resolved){
          resolved = true;
          clearTimeout(timeout);
          resolve('ALREADY_REGISTERED');
        }
      }
    }catch(e){
      console.error(`Pair error ${clean}:`, e.message);
      if(!resolved){
        resolved = true;
        clearTimeout(timeout);
        try{ sock.end(); }catch(err){}
        reject(e);
      }
    }
  });
}

// API للوحة التحكم الجديدة (POST)
app.post('/api/pair-whatsapp', async (req,res)=>{
  try{
    const { waNumber, phone } = req.body;
    const num = (waNumber || phone || '').toString();
    if(!num || num.length < 9) return res.status(400).json({success:false, error:'رقم غير صحيح'});
    const code = await createPairingCode(num);
    res.json({success:true, code, pairingCode: code, pairing_code: code, expiresIn: 120});
  }catch(e){
    let msg = e.message;
    if(msg.includes('Connection Closed') || msg.includes('428')) msg = 'السيرفر يصحى، انتظر 10 ثواني وحاول';
    res.status(500).json({success:false, error: msg});
  }
});

// API للوحة التحكم القديمة (GET) - عشان dashboard.php يشتغل
app.get(['/api/pairing-code','/pairing-code','/api/code','/code'], async (req,res)=>{
  try{
    const phone = (req.query.phone||'').replace(/[^0-9]/g,'');
    if(!phone) return res.status(400).json({error:'phone required'});
    const code = await createPairingCode(phone);
    res.json({success:true, pairingCode: code, code: code});
  }catch(e){
    res.status(500).json({error: e.message});
  }
});

app.get('/api/whatsapp-status/:phone', (req,res)=>{
  const clean = req.params.phone.replace(/[^0-9]/g,'');
  const s = sessions.get(clean);
  if(!s) return res.json({status:'not_found'});
  res.json({status:'pending', code:s.code, age: (Date.now()-s.created)/1000});
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, ()=> console.log(`🚀 FIXED WhatsApp v4 (Ubuntu 20.04.04 fix) on ${PORT}`));
