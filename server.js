const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51YourSecretKeyHere';
let stripe = null;
try{
 if(STRIPE_SECRET_KEY.startsWith('sk_')){
  stripe = require('stripe')(STRIPE_SECRET_KEY);
 }
}catch(e){}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({dest:'uploads/'});

let orders = [];
let users = [];
let proofs = [];

const PLANS = {
  individual:{name:'أفراد / متاجر', limit:600, price:99},
  pro:{name:'احترافي', limit:3000, price:199},
  enterprise:{name:'شركات', limit:999999, price:399}
};

function genPass(){ return Math.random().toString(36).slice(-8).toUpperCase(); }

// ===== ADMIN LOGIN - بالإيميل الجديد =====
const ADMIN_USER = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';

app.post('/api/admin/login',(req,res)=>{
  if(req.body.username===ADMIN_USER && req.body.password===ADMIN_PASS){
    return res.json({success:true, token:'admin-token-2026'});
  }
  res.json({success:false});
});

// Orders & Activate (بدون إيميل)
app.post('/api/orders',(req,res)=>{
  orders.push({id:Date.now().toString(),...req.body, status:'new', createdAt:new Date().toISOString()});
  res.json({success:true});
});
app.get('/api/orders',(req,res)=> res.json(orders.slice().reverse()));

app.post('/api/orders/activate',(req,res)=>{
  const o=orders.find(x=>x.id===req.body.id);
  if(!o) return res.json({success:false});
  const user={
    id:Date.now().toString(),
    name:o.name, phone:o.phone,
    username:o.phone.replace(/\D/g,'').slice(-9),
    password:genPass(), plan:o.plan,
    conversations_limit:PLANS[o.plan]?.limit||600,
    conversations_used:0, ai_enabled:true,
    is_important:false, is_active:true,
    expiry_date:new Date(Date.now()+30*24*60*60*1000).toISOString().split('T')[0],
    createdAt:new Date().toISOString()
  };
  users.push(user); o.status='activated'; o.generatedUser=user;
  res.json({success:true,user});
});

// Stats & Users
app.get('/api/users',(req,res)=> res.json(users.slice().reverse()));
app.get('/api/stats',(req,res)=>{
  res.json({
    totalOrders:orders.length,
    pendingOrders:orders.filter(o=>o.status==='new').length,
    totalClients:users.length,
    activeClients:users.filter(u=>u.is_active).length,
    importantClients:users.filter(u=>u.is_important).length,
    totalRevenue:users.reduce((s,u)=>s+(PLANS[u.plan]?.price||0),0),
    totalConversations:users.reduce((s,u)=>s+(u.conversations_used||0),0)
  });
});

app.post('/api/users/update',(req,res)=>{
  const u=users.find(x=>x.id===req.body.id);
  if(!u) return res.json({success:false});
  const {field,value}=req.body;
  if(field==='plan'){ u.plan=value; u.conversations_limit=PLANS[value]?.limit; }
  else u[field]=value;
  res.json({success:true});
});

app.post('/api/users/delete',(req,res)=>{
  users=users.filter(x=>x.id!==req.body.id);
  res.json({success:true});
});
app.post('/api/users/resetPass',(req,res)=>{
  const u=users.find(x=>x.id===req.body.id);
  if(!u) return res.json({success:false});
  u.password=genPass();
  res.json({success:true,password:u.password});
});

// Stripe + Proofs (القديم)
app.post('/api/create-checkout-session', async (req,res)=>{
  if(!stripe) return res.json({demo:true});
  const selected = PLANS[req.body.plan]||PLANS.pro;
  const session = await stripe.checkout.sessions.create({
   payment_method_types:['card'],
   line_items:[{price_data:{currency:'sar', product_data:{name:`WhatsBot - ${selected.name}`}, unit_amount:selected.price*100}, quantity:1}],
   mode:'payment', customer_email:req.body.customerEmail,
   success_url:`${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
   cancel_url:`${req.headers.origin}/cancel.html`,
  });
  res.json({id:session.id, url:session.url});
});

app.get('*',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log('🚀 Server running - Admin: az.behlal@gmail.com'));
