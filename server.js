const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const sessions = new Map();

async function createWASession(phoneNumber){
 const clean = phoneNumber.replace(/[^0-9]/g,'');
 const sessionId = 'auth_' + clean + '_' + Date.now();
 const folder = './' + sessionId;
 
 // امسح المجلدات القديمة لنفس الرقم
 try{
  const files = fs.readdirSync('.');
  files.forEach(f=>{
   if(f.startsWith('auth_'+clean)) fs.rmSync(f, {recursive:true, force:true});
  });
 }catch(e){}

 const { state, saveCreds } = await useMultiFileAuthState(folder);
 const sock = makeWASocket({
  auth: state,
  logger: P({level:'silent'}),
  printQRInTerminal: false,
  browser: ["WhatsBot.sa","Chrome","110"]
 });
 sock.ev.on('creds.update', saveCreds);
 
 sock.ev.on('connection.update', (u)=>{
  if(u.connection==='open') console.log('✅ Connected:', clean);
  if(u.connection==='close') console.log('❌ Closed:', clean);
 });

 await delay(3000);
 
 if(!state.creds.registered){
  try{
   const code = await sock.requestPairingCode(clean);
   console.log(`🔑 CODE FOR ${clean}: ${code}`);
   sessions.set(clean, {sock, code, folder, created: Date.now()});
   return code;
  }catch(e){
   console.error('Pair error', e.message);
   throw e;
  }
 }
 return 'ALREADY_CONNECTED';
}

app.post('/api/pair-whatsapp', async (req,res)=>{
 try{
  const { waNumber, phone, clientId } = req.body;
  const num = waNumber || phone;
  if(!num) return res.status(400).json({success:false, error:'رقم مطلوب'});
  const code = await createWASession(num);
  res.json({success:true, code, expiresIn: 25});
 }catch(e){
  res.status(500).json({success:false, error: e.message});
 }
});

app.get('/api/whatsapp-status/:phone', (req,res)=>{
 const s = sessions.get(req.params.phone.replace(/[^0-9]/g,''));
 if(!s) return res.json({status:'not_found'});
 const age = (Date.now() - s.created)/1000;
 res.json({status:'pending', code:s.code, age, expiresIn: Math.max(0, 25-age)});
});

app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log('🚀 Running with fix on '+PORT));
