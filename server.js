const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let orders = [];
let users = [];

const PLANS = {
  individual:{name:'أفراد / متاجر', limit:600, price:89},
  pro:{name:'احترافي', limit:3000, price:189},
  enterprise:{name:'شركات / مؤسسات', limit:999999, price:399}
};

function genPass(){ return Math.random().toString(36).slice(-8).toUpperCase(); }

// ===== ADMIN LOGIN =====
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Letsbot@2026';

app.post('/api/admin/login',(req,res)=>{
  const {username,password}=req.body;
  if(username===ADMIN_USER && password===ADMIN_PASS){
    return res.json({success:true, token:'admin-token-2026'});
  }
  res.json({success:false});
});

// ===== ORDERS =====
app.post('/api/orders',(req,res)=>{
  const o={
    id: Date.now().toString(),
    name:req.body.name,
    phone:req.body.phone,
    type:req.body.type,
    challenge:req.body.challenge||'',
    plan:req.body.plan||'pro',
    status:'new',
    createdAt:new Date().toISOString()
  };
  orders.push(o);
  res.json({success:true});
});
app.get('/api/orders',(req,res)=> res.json(orders.slice().reverse()));

// تفعيل بدون ايميل - يولد يوزر وباسورد مباشرة
app.post('/api/orders/activate',(req,res)=>{
  const o=orders.find(x=>x.id===req.body.id);
  if(!o) return res.json({success:false});
  const user={
    id: Date.now().toString(),
    name:o.name,
    phone:o.phone,
    username:o.phone.replace(/\D/g,'').slice(-9),
    password:genPass(),
    plan:o.plan,
    planName:PLANS[o.plan]?.name,
    conversations_limit:PLANS[o.plan]?.limit||600,
    conversations_used:0,
    ai_enabled:true,
    is_important:false,
    is_active:true,
    expiry_date:new Date(Date.now()+30*24*60*60*1000).toISOString().split('T')[0],
    notes:'',
    createdAt:new Date().toISOString()
  };
  users.push(user);
  o.status='activated';
  o.generatedUser=user;
  res.json({success:true,user});
});

// ===== USERS & STATS =====
app.get('/api/users',(req,res)=> res.json(users.slice().reverse()));
app.get('/api/stats',(req,res)=>{
  const rev = users.reduce((s,u)=>s+(PLANS[u.plan]?.price||0),0);
  const used = users.reduce((s,u)=>s+(u.conversations_used||0),0);
  res.json({
    totalOrders:orders.length,
    pendingOrders:orders.filter(o=>o.status==='new').length,
    totalClients:users.length,
    activeClients:users.filter(u=>u.is_active).length,
    importantClients:users.filter(u=>u.is_important).length,
    totalRevenue:rev,
    totalConversations:used
  });
});

app.post('/api/users/update',(req,res)=>{
  const u=users.find(x=>x.id===req.body.id);
  if(!u) return res.json({success:false});
  const {field,value}=req.body;
  if(field==='plan'){ u.plan=value; u.planName=PLANS[value]?.name; u.conversations_limit=PLANS[value]?.limit; }
  else { u[field]=value; }
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

app.get('*',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log(`🚀 Server running on ${PORT}`));
