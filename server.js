const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// ===== WhatsApp Permanent Config - إعداداتك الدائمة =====
const PHONE_NUMBER_ID = "1237839659414830"; // رقمك +966557967875
const WHATSAPP_TOKEN = "EAAZANPLTRVtcBSMJY9UBibAVcNiwWn7VszabKxsiC7UtyiYUIDvmOCdNmP2TdVNmhcksnS6Eq4tmilL3mVex8Pi2DohxD1MSyaZAIaf0ZAoUGPVeD2tZAJIwzTEzZBsHBlt8ZBDs7RbVKWtZBXhXZCBWLwYDtMRsKCdyFzEt9XMiQzJTDGhsp3mPsiwA7AB6iwZDZD";
const VERIFY_TOKEN = "wsbot_verify_2024";
const WHATSAPP_BUSINESS_ID = "1480871240462371";

// ===== Stripe Setup =====
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51YourSecretKeyHere';
let stripe = null;
try{
 if(STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_')){
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized');
 }else{
  console.log('⚠️ Stripe key not set - payment will be in demo mode');
 }
}catch(e){ console.log('Stripe init error', e.message); }

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({dest:'uploads/'});

let proofs = [];
let users = [];

const PLANS = {
 individual:{name:'أفراد', price:9900, priceSAR:99},
 pro:{name:'احترافي', price:19900, priceSAR:199},
 enterprise:{name:'شركات', price:39900, priceSAR:399}
};

// ===== WhatsApp Webhook Verification =====
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook Verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ===== WhatsApp Receive Messages =====
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              const from = message.from;
              const text = message.text?.body || '';
              console.log(`📩 رسالة من ${from}: ${text}`);

              // رد البوت الذكي
              let reply = `مرحبا! انا WhatsBot AI 🤖\n\nوصلتني رسالتك: "${text}"\n\nكيف أقدر أساعدك؟`;

              if (text.toLowerCase().includes('سلام') || text.toLowerCase().includes('هلا')) {
                reply = `هلا والله! 👋 انا WhatsBot AI 🤖\nبوت ذكي يرد على عملاءك تلقائياً 24/7`;
              }

              // إرسال الرد
              await sendWhatsAppMessage(from, reply);
            }
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook Error', e.message);
    res.sendStatus(200);
  }
});

async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      })
    });
    const data = await response.json();
    console.log('✅ تم الإرسال:', data);
    return data;
  } catch (e) {
    console.error('Send Error', e.message);
  }
}

// ===== Stripe Routes (نفس القديم) =====
app.post('/api/create-checkout-session', async (req,res)=>{
 const {plan, customerName, customerEmail, customerPhone} = req.body;
 const selected = PLANS[plan]||PLANS.pro;
 if(!stripe){
  return res.json({demo:true, message:'Stripe not configured - use WhatsApp fallback'});
 }
 try{
  const session = await stripe.checkout.sessions.create({
   payment_method_types: ['card'],
   line_items:[{
    price_data:{
     currency:'sar',
     product_data:{name:`WhatsBot.sa - باقة ${selected.name}`, description:'اشتراك شهري - تفعيل فوري'},
     unit_amount: selected.price,
    },
    quantity:1
   }],
   mode:'payment',
   customer_email: customerEmail,
   metadata:{plan, customerName, customerPhone},
   success_url: `${req.headers.origin||'https://whatsbot-4vkk.onrender.com'}/success.html?session_id={CHECKOUT_SESSION_ID}`,
   cancel_url: `${req.headers.origin||'https://whatsbot-4vkk.onrender.com'}/cancel.html`,
  });
  res.json({id: session.id, url: session.url});
 }catch(e){
  console.error('Stripe error', e.message);
  res.status(500).json({error:e.message});
 }
});

app.get('/api/verify-payment', async (req,res)=>{
 const {session_id} = req.query;
 if(!stripe ||!session_id) return res.json({success:false});
 try{
  const session = await stripe.checkout.sessions.retrieve(session_id);
  if(session.payment_status==='paid'){
   const {plan, customerName, customerPhone} = session.metadata;
   const email = session.customer_email;
   const user = {
    id: session.id,
    fullName: customerName,
    email: email,
    phone: customerPhone,
    plan: plan,
    amount: PLANS[plan]?.priceSAR,
    status:'approved',
    paymentId: session.payment_intent,
    createdAt: new Date().toISOString(),
    paid: true
   };
   users.push(user);
   proofs.push(user);
   return res.json({success:true, user});
  }
  res.json({success:false, status: session.payment_status});
 }catch(e){
  res.status(500).json({error:e.message});
 }
});

app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
 const data = {
  id: Date.now().toString(),
  fullName: req.body.companyName,
  companyName: req.body.companyName,
  phone: req.body.customerPhone,
  customerPhone: req.body.customerPhone,
  email: req.body.customerEmail,
  customerEmail: req.body.customerEmail,
  company: req.body.company,
  plan: req.body.plan||'pro',
  file: req.file?.originalname||'',
  status:'pending',
  createdAt: new Date().toISOString()
 };
 proofs.push(data);
 res.json({success:true, id:data.id});
});

app.get('/api/payment-proofs', (req,res)=>{ res.json(proofs.reverse()); });
app.post('/api/admin/approve', (req,res)=>{
 const {id}=req.body;
 const p = proofs.find(x=>x.id===id);
 if(p){ p.status='approved'; users.push(p); }
 res.json({success:true});
});
app.post('/api/admin/reject', (req,res)=>{
 const {id}=req.body;
 const p = proofs.find(x=>x.id===id);
 if(p) p.status='rejected';
 res.json({success:true});
});

app.get('/.well-known/apple-developer-merchantid-domain-association', (req,res)=>{
 res.sendFile(path.join(__dirname, 'public', 'apple-developer-merchantid-domain-association'));
});

app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, ()=> console.log(`🚀 Server running on ${PORT} - WhatsApp Bot Ready ✅`));
