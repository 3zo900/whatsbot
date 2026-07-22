const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
let stripe = null;
try{ if(STRIPE_SECRET_KEY.startsWith('sk_')){ stripe = require('stripe')(STRIPE_SECRET_KEY); } }catch(e){}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const upload = multer({dest:'uploads/'});

let proofs = [];
let users = [];
const PLANS = {
 individual:{name:'أفراد', price:9900},
 pro:{name:'احترافي', price:19900},
 enterprise:{name:'شركات', price:39900}
};

const sessions = new Map();

async function createWASession(phoneNumber){
 const clean = phoneNumber.replace(/[^0-9]/g,'');
 const folder = './auth_'+clean+'_'+Date.now();
 try{
  fs.readdirSync('.').forEach(f=>{
   if(f.startsWith('auth_'+clean)) fs.rmSync(f, {recursive:true, force:true});
  });
 }catch(e){}
 const { state, saveCreds } = await useMultiFileAuthState(folder);
 const sock = makeWASocket({
  auth: state,
  logger: P({level:'silent'}),
  browser: ["WhatsBot.sa","Chrome","110"]
 });
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', (u)=>{
  if(u.connection==='open') console.log('✅ Connected:', clean);
 });
 await delay(3000);
 if(!state.creds.registered){
  const code = await sock.requestPairingCode(clean);
  console.log(`🔑 CODE ${clean}: ${code}`);
  sessions.set(clean, {sock, code, folder, created: Date.now()});
  return code;
 }
 return 'ALREADY';
}

app.post('/api/pair-whatsapp', async (req,res)=>{
 try{
  const { waNumber, phone } = req.body;
  const num = waNumber || phone;
  const code = await createWASession(num);
  res.json({success:true, code, pairingCode:code, pending_code:code, expiresIn:90});
 }catch(e){
  res.status(500).json({success:false, error:e.message});
 }
});

app.get('/api/whatsapp-status/:phone', (req,res)=>{
 const s = sessions.get(req.params.phone.replace(/[^0-9]/g,''));
 if(!s) return res.json({status:'not_found'});
 res.json({status:'pending', code:s.code, pairingCode:s.code, expiresIn:90});
});

app.post('/api/create-checkout-session', async (req,res)=>{
 if(!stripe) return res.json({demo:true});
 const session = await stripe.checkout.sessions.create({
  payment_method_types:['card'],
  line_items:[{price_data:{currency:'sar', product_data:{name:'WhatsBot.sa'}, unit_amount:19900}, quantity:1}],
  mode:'payment',
  success_url: req.headers.origin+'/success.html',
  cancel_url: req.headers.origin+'/cancel.html'
 });
 res.json({url:session.url});
});

app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log('🚀 FIXED v2 running'));
