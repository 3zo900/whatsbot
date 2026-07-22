const express=require('express');const cors=require('cors');const qrcode=require('qrcode');
const {default:makeWASocket,useMultiFileAuthState,makeCacheableSignalKeyStore,fetchLatestBaileysVersion,delay}=require('@whiskeysockets/baileys');
const P=require('pino');
const app=express();app.use(cors());app.use(express.json());
let VER=null,sockets={},qrCache={},status={};
(async()=>{const {version}=await fetchLatestBaileysVersion();VER=version;})();
async function init(phone){
  const clean=phone.replace(/[^0-9]/g,'');
  const {state,saveCreds}=await useMultiFileAuthState('auth_'+clean);
  const sock=makeWASocket({version:VER,auth:{creds:state.creds,keys:makeCacheableSignalKeyStore(state.keys,P({level:'silent'}))},logger:P({level:'silent'}),browser:["Ubuntu","Chrome","20.0.04"],printQRInTerminal:false});
  sock.ev.on('creds.update',saveCreds);
  sock.ev.on('connection.update',async(u)=>{
    if(u.qr){qrCache[clean]=await qrcode.toDataURL(u.qr);status[clean]='qr';}
    if(u.connection==='open'){status[clean]='connected';qrCache[clean]=null;console.log('✅ Connected',clean);}
    if(u.connection==='close'){status[clean]='disconnected';setTimeout(()=>init(clean),3000);}
  });
  sockets[clean]=sock;return sock;
}
app.get('/api/qr',async(req,res)=>{
  const phone=(req.query.phone||'').replace(/[^0-9]/g,'');if(!phone)return res.status(400).json({error:'رقم ناقص'});
  if(!sockets[phone])await init(phone);await delay(1000);
  res.json({qr:qrCache[phone]||null,status:status[phone],connected:status[phone]==='connected'});
});
app.get('/',(req,res)=>res.send('WsBot.me AUTO-QR v8 - PHP Ready'));
app.listen(10000,()=>console.log('AUTO-QR v8 running'));
