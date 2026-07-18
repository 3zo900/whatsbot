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
  console.log('⚠️ Stripe key not set');
 }
}catch(e){ console.log('Stripe error', e.message); }

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({dest:'uploads/'});

let proofs = [];
let users = [];
let orders = [];

const PLANS = {
 individual:{name:'أفراد / متاجر', price:8900, priceSAR:89},
 pro:{name:'احترافي', price:18900, priceSAR:189},
 enterprise:{name:'شركات / مؤسسات', price:39900, priceSAR:399}
};

// طلبات الاشتراك الجديدة
app.post('/api/orders',(req,res)=>{
 const o={
  id: Date.now().toString(),
  name: req.body.name,
  phone: req.body.phone,
  type: req.body.type,
  challenge: req.body.challenge,
  plan: req.body.plan||'pro',
  status:'new',
  createdAt: new Date().toISOString()
 };
 orders.push(o);
 console.log('📥 طلب جديد:', o.name, o.phone);
 res.json({success:true});
});

app.get('/api/orders',(req,res)=>{
 res.json(orders.slice().reverse());
});

// تفعيل المتجر وتوليد يوزر وباسوورد
app.post('/api/orders/activate',(req,res)=>{
 const {id,email}=req.body;
 const o=orders.find(x=>x.id===id);
 if(!o) return res.json({success:false, error:'not found'});
 if(!email) return res.json({success:false, error:'email required'});

 const password = Math.random().toString(36).slice(-8).toUpperCase();
 const user={
  id: Date.now().toString(),
  fullName: o.name,
  email: email,
  password: password,
  phone: o.phone,
  plan: o.plan,
  type: o.type,
  amount: PLANS[o.plan]?.priceSAR||189,
  status:'approved',
  orderId: o.id,
  createdAt: new Date().toISOString(),
  loginUrl: 'https://whatsbot-4vkk.onrender.com/client-dashboard.html'
 };
 users.push(user);
 o.status='activated';
 o.generatedUser=user;
 o.activatedEmail=email;
 console.log('✅ تم تفعيل:', email, 'باسوورد:', password);
 res.json({success:true,user});
});

app.get('/api/users',(req,res)=> res.json(users.slice().reverse()));

// Stripe Checkout
app.post('/api/create-checkout-session', async (req,res)=>{
 const {plan, customerName, customerEmail, customerPhone} = req.body;
 const selected = PLANS[plan]||PLANS.pro;
 if(!stripe){ return res.json({demo:true}); }
 try{
  const session = await stripe.checkout.sessions.create({
   payment_method_types: ['card'],
   line_items:[{
    price_data:{
     currency:'sar',
     product_data:{name:`WhatsBot AI - باقة ${selected.name}`},
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
 }catch(e){ res.status(500).json({error:e.message}); }
});

app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
 const data = {
  id: Date.now().toString(),
  fullName: req.body.companyName,
  phone: req.body.customerPhone,
  email: req.body.customerEmail,
  plan: req.body.plan||'pro',
  file: req.file?.originalname||'',
  status:'pending',
  createdAt: new Date().toISOString()
 };
 proofs.push(data);
 res.json({success:true, id:data.id});
});

app.get('/api/payment-proofs',(req,res)=> res.json(proofs.reverse()));
app.post('/api/admin/approve',(req,res)=>{ const p=proofs.find(x=>x.id===req.body.id); if(p){p.status='approved'; users.push(p);} res.json({success:true}); });
app.post('/api/admin/reject',(req,res)=>{ const p=proofs.find(x=>x.id===req.body.id); if(p) p.status='rejected'; res.json({success:true}); });

app.get('/.well-known/apple-developer-merchantid-domain-association',(req,res)=>{
 res.sendFile(path.join(__dirname, 'public', 'apple-developer-merchantid-domain-association'));
});

app.get('*',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log(`🚀 Server running on ${PORT}`));
