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
let proofs = [];

const PLANS = {
  individual:{name:'أفراد / متاجر', limit:600, price:89},
  pro:{name:'احترافي', limit:3000, price:189},
  enterprise:{name:'شركات / مؤسسات', limit:999999, price:399}
};

function genPass(){ return Math.random().toString(36).slice(-8).toUpperCase(); }

// الطلبات
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

// تفعيل مباشر بدون ايميل - يولد يوزر وباسوورد
app.post('/api/orders/activate',(req,res)=>{
  const {id}=req.body;
  const o=orders.find(x=>x.id===id);
  if(!o) return res.json({success:false});
  
  const limit = PLANS[o.plan]?.limit||600;
  const user={
    id: Date.now().toString(),
    name: o.name,
    phone: o.phone,
    username: o.phone.replace(/\D/g,'').slice(-9),
    password: genPass(),
    plan: o.plan,
    planName: PLANS[o.plan]?.name,
    conversations_limit: limit,
    conversations_used: 0,
    ai_enabled: true,
    is_important: false,
    is
