const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

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

// توليد كلمة مرور 10 خانات حروف وأرقام انجليزية
function generatePassword(length = 10){
 const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 let pass = '';
 for(let i=0;i<length;i++) pass += chars.charAt(Math.floor(Math.random()*chars.length));
 return pass;
}

const PLANS = {
 individual:{name:'أفراد', price:9900, priceSAR:99},
 pro:{name:'احترافي', price:19900, priceSAR:199},
 enterprise:{name:'شركات', price:39900, priceSAR:399}
};

app.post('/api/create-checkout-session', async (req,res)=>{
 const {plan, customerName, customerEmail, customerPhone} = req.body;
 const selected = PLANS[plan]||PLANS.pro;
 if(!stripe){
  return res.json({demo:true, message:'Stripe not configured'});
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
   const password = generatePassword(10);
   const user = {
    id: session.id,
    fullName: customerName,
    email: email,
    phone: customerPhone,
    plan: plan,
    amount: PLANS[plan]?.priceSAR,
    status:'approved',
    password: password,
    paymentId: session.payment_intent,
    createdAt: new Date().toISOString(),
    paid: true
   };
   users.push(user);
   proofs.push(user);
   console.log('✅ Payment verified & user activated:', email);
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
 console.log('📥 New proof:', data.email);
 res.json({success:true, id:data.id});
});

app.get('/api/payment-proofs', (req,res)=>{
 res.json(proofs.reverse());
});

app.post('/api/admin/approve', (req,res)=>{
 const {id}=req.body;
 const p = proofs.find(x=>x.id===id);
 if(p){
  const password = generatePassword(10);
  p.password = password;
  p.status='approved';
  p.approvedAt = new Date().toISOString();
  const user = {
   id: p.id,
   fullName: p.fullName || p.companyName,
   email: p.customerEmail || p.email,
   phone: p.customerPhone || p.phone,
   plan: p.plan,
   password: password,
   status:'approved',
   createdAt: new Date().toISOString(),
   paid: true
  };
  users.push(user);
  const cleanPhone = (p.customerPhone||p.phone||'').replace(/[^0-9]/g,'');
  const waMsg = `✅ تم تفعيل حسابك في WhatsBot.sa!

🔐 بيانات الدخول:
📧 الإيميل: ${user.email}
🔑 الرقم السري: ${password}

🌐 رابط الدخول:
https://whatsbot.sa/client-dashboard.html

لوحة العميل فيها: ربط واتساب + فريق العمل + تقييم العملاء ⭐`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
  console.log('✅ Approved:', user.email, password);
  return res.json({success:true, password, email: user.email, phone: user.phone, waUrl});
 }
 res.json({success:false});
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

app.listen(PORT, ()=> console.log(`🚀 Server running on ${PORT}`));
