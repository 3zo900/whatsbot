const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;
const DOMAIN = 'https://wsbot.me';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
let stripe = null;
try{
 if(STRIPE_SECRET_KEY.startsWith('sk_')){
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('✅ Stripe ready');
 }
}catch(e){}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const upload = multer({dest:'uploads/'});

let proofs = [];
let users = [];
const PLANS = {
 individual:{name:'أفراد', price:9900, priceSAR:99},
 pro:{name:'احترافي', price:19900, priceSAR:199},
 enterprise:{name:'شركات', price:39900, priceSAR:399}
};

const sessions = new Map();

async function createWASession(sessionId, phoneNumber){
 const authFolder = `./auth_${sessionId}`;
 const { state, saveCreds } = await useMultiFileAuthState(authFolder);
 const sock = makeWASocket({
  auth: state,
  logger: P({level:'silent'}),
  printQRInTerminal: false,
  browser: ["WhatsBot.sa","Chrome","1.0"]
 });
 sock.ev.on('creds.update', saveCreds);
 sock.ev.on('connection.update', (u)=>{
  if(u.connection==='open'){
   console.log(`✅ ${sessionId} connected`);
   sessions.set(sessionId, {sock, status:'connected', phone:phoneNumber});
  }
 });
 if(!state.creds.registered){
  await delay(2000);
  const clean = phoneNumber.replace(/[^0-9]/g,'');
  const code = await sock.requestPairingCode(clean);
  console.log(`🔑 Code for ${clean}: ${code}`);
  sessions.set(sessionId, {sock, status:'pending_code', pairingCode:code, phone:phoneNumber});
  return code;
 }
 return 'ALREADY_CONNECTED';
}

app.post('/api/pair-whatsapp', async (req,res)=>{
 try{
  const { clientId, waNumber } = req.body;
  if(!waNumber) return res.status(400).json({success:false, error:'رقم الواتساب مطلوب'});
  const sessionId = `client_${clientId||Date.now()}`;
  const code = await createWASession(sessionId, waNumber);
  res.json({success:true, code, sessionId});
 }catch(e){
  console.error('Pair error', e.message);
  res.status(500).json({success:false, error:e.message});
 }
});

app.get('/api/whatsapp-status/:sessionId', (req,res)=>{
 const s = sessions.get(req.params.sessionId);
 if(!s) return res.json({status:'not_found'});
 res.json({status:s.status, code:s.pairingCode});
});

app.post('/api/create-checkout-session', async (req,res)=>{
 const {plan, customerName, customerEmail, customerPhone} = req.body;
 const selected = PLANS[plan]||PLANS.pro;
 if(!stripe) return res.json({demo:true});
 try{
  const session = await stripe.checkout.sessions.create({
   payment_method_types: ['card'],
   line_items:[{price_data:{currency:'sar', product_data:{name:`WhatsBot.sa - ${selected.name}`}, unit_amount:selected.price}, quantity:1}],
   mode:'payment',
   customer_email: customerEmail,
   metadata:{plan, customerName, customerPhone},
   success_url: `${req.headers.origin||DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
   cancel_url: `${req.headers.origin||DOMAIN}/cancel.html`,
  });
  res.json({id:session.id, url:session.url});
 }catch(e){ res.status(500).json({error:e.message}); }
});

app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
 const data = {id:Date.now().toString(), fullName:req.body.companyName, phone:req.body.customerPhone, email:req.body.customerEmail, plan:req.body.plan||'pro', file:req.file?.originalname||'', status:'pending', createdAt:new Date().toISOString()};
 proofs.push(data);
 res.json({success:true, id:data.id});
});
app.get('/api/payment-proofs', (req,res)=>res.json(proofs.reverse()));
app.post('/api/admin/approve', (req,res)=>{ const p=proofs.find(x=>x.id===req.body.id); if(p){p.status='approved'; users.push(p);} res.json({success:true}); });
app.post('/api/admin/reject', (req,res)=>{ const p=proofs.find(x=>x.id===req.body.id); if(p) p.status='rejected'; res.json({success:true}); });

app.get('/', (req,res)=>{
 res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, ()=> console.log(`🚀 Running on ${PORT}`));
