const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({dest:'uploads/'});

let orders = [];
let users = [];

const PLANS = { individual:{name:'أفراد', limit:1, price:99}, pro:{name:'احترافي', limit:3, price:199}, enterprise:{name:'شركات', limit:100, price:399} };
function genPass(){ return Math.random().toString(36).slice(-8).toUpperCase(); }

// أدمن
const ADMIN_USER = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';
app.post('/api/admin/login',(req,res)=>{
  if(req.body.username===ADMIN_USER && req.body.password===ADMIN_PASS) return res.json({success:true, token:'admin-token-2026'});
  res.json({success:false});
});

// طلبات
app.post('/api/orders',(req,res)=>{
  orders.push({id:Date.now().toString(),...req.body,status:'new',createdAt:new Date().toISOString()});
  res.json({success:true});
});
app.get('/api/orders',(req,res)=> res.json(orders.reverse()));

// تفعيل من الأدمن - يولد يوزر وباس
app.post('/api/orders/activate',(req,res)=>{
  const o=orders.find(x=>x.id===req.body.id);
  if(!o) return res.json({success:false});
  const user={
    id:Date.now().toString(), name:o.name, phone:o.phone,
    username:o.phone.replace(/\D/g,'').slice(-9), // اليوزر هو آخر 9 أرقام
    password:genPass(), plan:o.plan, limit:PLANS[o.plan]?.limit||1,
    createdAt:new Date().toISOString()
  };
  users.push(user); o.status='activated'; o.generatedUser=user;
  res.json({success:true,user});
});

// ✅ تسجيل دخول العميل - الحل للثغرة
app.post('/api/client/login',(req,res)=>{
  const {username,password}=req.body;
  const u=users.find(x=>x.username===username && x.password===password);
  if(u) return res.json({success:true, user:u, token:'client-'+u.id});
  res.json({success:false, message:'اليوزر أو الباسورد خطأ'});
});

app.get('/api/users',(req,res)=> res.json(users));
app.get('*',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log('Server running - Admin:'+ADMIN_USER));
