const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const sessions = new Map();
let WA_VERSION = null;

// جلب نسخة واتساب مرة وحدة عند التشغيل (يسرّع 10 ثواني)
(async()=>{
  try{
    const { version } = await fetchLatestBaileysVersion();
    WA_VERSION = version;
    console.log(`WA Version cached: ${version.join('.')}`);
  }catch(e){ console.log('Version fetch failed, will use default'); }
})();

async function createPairingCode(phoneNumber){
  const clean = phoneNumber.replace(/[^0-9]/g,'').trim();
  console.log(`📱 طلب كود: ${clean}`);

  // لا تمسح كل المجلدات - امسح القديم لنفس الرقم فقط إذا أقدم من ساعة
  try{
    const files = fs.readdirSync('.');
    files.forEach(f=>{
      if(f.startsWith('auth_'+clean)){
        const stat = fs.statSync(f);
        if(Date.now() - stat.mtimeMs > 3600000){ // أقدم من ساعة
          try{ fs.rmSync(f, {recursive:true, force:true}); }catch(e){}
        }
      }
    });
  }catch(e){}

  const folder = `auth_${clean}`;
  const { state, saveCreds } = await useMultiFileAuthState(folder);

  const sock = makeWASocket({
    version: WA_VERSION || undefined,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})),
    },
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"], // مهم - هذا اللي يصلح تعذر ربط الجهاز
    connectTimeoutMs: 30000,
    defaultQueryTimeoutMs: 30000,
    markOnlineOnConnect: false,
  });

  sock.ev.on('creds.update', saveCreds);

  return new Promise(async (resolve, reject)=>{
    let resolved = false;
    const timeout = setTimeout(()=>{
      if(!resolved){
        resolved = true;
        try{ sock.end(); }catch(e){}
        reject(new Error('Timeout - اطلب كود جديد'));
      }
    }, 90000);

    try{
      // انتظر فقط 1.5 ثانية (كان 3 ثواني - قللنا)
      await delay(1500);
      if(!state.creds.registered){
        const code = await sock.requestPairingCode(clean);
        console.log(`🔑 كود ${clean}: ${code} (سريع)`);
        if(!resolved){
          resolved = true;
          clearTimeout(timeout);
          sessions.set(clean, {sock, code, folder, created: Date.now()});
          // خليه مفتوح 3 دقائق
          setTimeout(()=>{ try{sock.end();}catch(e){} }, 180000);
          resolve(code);
        }
      } else {
        resolved = true;
        clearTimeout(timeout);
        resolve('ALREADY_REGISTERED');
      }
    }catch(e){
      console.error(`Pair error:`, e.message);
      if(!resolved){
        resolved = true;
        clearTimeout(timeout);
        try{ sock.end(); }catch(err){}
        reject(e);
      }
    }
  });
}

app.post('/api/pair-whatsapp', async (req,res)=>{
  try{
    const num = (req.body.waNumber || req.body.phone || '').toString();
    if(!num) return res.status(400).json({success:false, error:'رقم ناقص'});
    const code = await createPairingCode(num);
    res.json({success:true, code, pairingCode: code, expiresIn: 60});
  }catch(e){
    res.status(500).json({success:false, error: e.message});
  }
});

app.get(['/api/pairing-code','/pairing-code','/api/code','/code'], async (req,res)=>{
  try{
    const phone = (req.query.phone||'').replace(/[^0-9]/g,'');
    const code = await createPairingCode(phone);
    res.json({success:true, code, pairingCode: code});
  }catch(e){
    res.status(500).json({error: e.message});
  }
});

app.get('/api/clear/:phone', (req,res)=>{
  const clean = req.params.phone.replace(/[^0-9]/g,'');
  try{
    const files = fs.readdirSync('.');
    files.forEach(f=>{ if(f.startsWith('auth_'+clean)) fs.rmSync(f, {recursive:true, force:true}); });
    sessions.delete(clean);
    res.json({success:true, cleared: clean});
  }catch(e){ res.json({error: e.message}); }
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log(`🚀 WsBot.me FAST v5 on ${PORT}`));
