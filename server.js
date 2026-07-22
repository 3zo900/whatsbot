const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let WA_VERSION = null;
let sock = null;
let qrCodeData = null;
let isConnected = false;
let lastPairCode = null;
let connectionStatus = 'disconnected';

// Cache نسخة واتساب
(async()=>{
  try{ const { version } = await fetchLatestBaileysVersion(); WA_VERSION = version; console.log('WA',version.join('.')); }catch(e){}
})();

async function initSocket(folder='auth_main'){
  const { state, saveCreds } = await useMultiFileAuthState(folder);
  const socket = makeWASocket({
    version: WA_VERSION || undefined,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'})) },
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    connectTimeoutMs: 60000,
  });
  socket.ev.on('creds.update', saveCreds);
  socket.ev.on('connection.update', async (update)=>{
    const { connection, lastDisconnect, qr } = update;
    if(qr){ qrCodeData = await qrcode.toDataURL(qr); console.log('QR Generated'); }
    if(connection==='close'){
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log('Close',code);
      isConnected=false;
      connectionStatus='disconnected';
      if(code!== DisconnectReason.loggedOut) setTimeout(()=>initSocket(folder),3000);
    }
    if(connection==='open'){ isConnected=true; connectionStatus='connected'; qrCodeData=null; console.log('✅ Connected'); }
    if(connection==='connecting'){ connectionStatus='connecting'; }
  });
  return socket;
}

// بدء سوكت رئيسي للـ QR
initSocket().then(s=>sock=s);

// API: جلب QR Code (أسرع وأفضل من كود 8 أرقام - ما يطلع رسالة احتيال)
app.get('/api/qr', async (req,res)=>{
  try{
    if(!sock) sock = await initSocket();
    if(isConnected) return res.json({connected:true, message:'مربوط بالفعل'});
    if(qrCodeData) return res.json({qr: qrCodeData, status: connectionStatus});
    // إذا ما فيه QR انتظر 2 ثانية
    await delay(2000);
    res.json({qr: qrCodeData, status: connectionStatus});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// API: كود 8 أرقام - سريع جداً 3 ثواني
app.get(['/api/pairing-code','/pairing-code','/api/code','/code'], async (req,res)=>{
  const phone = (req.query.phone||'').replace(/[^0-9]/g,'');
  if(!phone) return res.status(400).json({error:'رقم ناقص'});
  try{
    const cleanFolder = `auth_${phone}`;
    const tempSock = await initSocket(cleanFolder);
    await delay(1500);
    const { state } = await useMultiFileAuthState(cleanFolder);
    if(state.creds.registered){ try{tempSock.end();}catch(e){}; return res.json({code:'ALREADY_REGISTERED', message:'مربوط'}); }
    const code = await tempSock.requestPairingCode(phone);
    lastPairCode = code;
    console.log(`🔑 ${phone}: ${code}`);
    setTimeout(()=>{ try{tempSock.end();}catch(e){} }, 180000);
    res.json({success:true, code, pairingCode: code, expiresIn: 60});
  }catch(e){ res.status(500).json({error: e.message}); }
});

app.post('/api/pair-whatsapp', async (req,res)=>{
  const num = (req.body.waNumber||req.body.phone||'').toString().replace(/[^0-9]/g,'');
  if(!num) return res.status(400).json({error:'رقم ناقص'});
  req.query.phone = num;
  return app._router.handle({method:'GET', url:`/api/pairing-code?phone=${num}`, query:{phone:num}}, res, ()=>{});
});

app.get('/api/status', (req,res)=> res.json({connected:isConnected, status:connectionStatus, hasQR:!!qrCodeData, lastCode: lastPairCode}));
app.get('/api/clear/:phone', (req,res)=>{
  const c = req.params.phone.replace(/[^0-9]/g,'');
  try{ fs.readdirSync('.').forEach(f=>{ if(f.startsWith('auth_'+c)) fs.rmSync(f,{recursive:true,force:true}); }); res.json({success:true}); }catch(e){ res.json({error:e.message}); }
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));
app.get('*', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT, ()=> console.log(`🚀 WsBot.me FAST QR+Pairing v6 on ${PORT}`));
