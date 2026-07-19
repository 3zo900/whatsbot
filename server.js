const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// ملفات public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ===== مسارات ثابتة - تحل مشكلة Cannot GET =====
app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/client-dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'client-dashboard.html')));
app.get('/client-dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'client-dashboard.html')));
app.get('/employee-reply', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'employee-reply.html')));
app.get('/employee-reply.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'employee-reply.html')));
app.get('/dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/login', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/login.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/order', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'order.html')));
app.get('/order.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'order.html')));
app.get('/admin-dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));
app.get('/admin-dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));

// ===== بيانات وهمية =====
let users = [];
function checkSubscription(user){
  if(!user.startDate) user.startDate = new Date().toISOString();
  const start = new Date(user.startDate);
  const end = new Date(start); end.setDate(end.getDate()+30);
  const now = new Date();
  const diffDays = Math.ceil((end-now)/1000/60/60/24);
  const plans = {individual:1000, pro:3000, companies:7000, enterprise:7000, basic:1000, premium:3000};
  const limit = plans[user.plan]||3000;
  const used = user.used_chats||user.usedChats||0;
  const percent = (used/limit)*100;
  return {diffDays, end, expired: diffDays<=0, limit, used, percent, nearEnd: diffDays<=5, nearQuota: percent>=80};
}

// ===== API =====
app.post('/api/order', (req,res)=>{
  const {storeName, whatsapp, plan, email} = req.body;
  if(!storeName || !whatsapp){ return res.json({ok:false, msg:'ادخل اسم المتجر ورقم الواتساب'}); }
  users.push({id:Date.now(), storeName, phone:whatsapp, whatsapp, plan:plan||'pro', email, startDate: new Date().toISOString(), used_chats:0});
  console.log('New order:', storeName, whatsapp, plan);
  res.json({ok:true});
});

app.post('/api/employee-reply', (req,res)=>{
  const {clientPhone, message, emp, store} = req.body;
  console.log(`[EMP REPLY] ${emp} -> ${clientPhone}: ${message} (via ${store})`);
  res.json({ok:true, sentVia:'store_number'});
});

app.get('/api/health', (req,res)=> res.json({ok:true, users: users.length}));


const fs = require('fs');
const pathMod = require('path');

// إصلاح شامل للروابط - يخدم أي ملف html موجود في public
app.use((req,res,next)=>{
  if(req.path.endsWith('.html')){
    const fileName = req.path.replace(/^\//,'').replace(/^public\//,'');
    const fullPath = pathMod.join(__dirname, 'public', fileName);
    if(fs.existsSync(fullPath)){
      return res.sendFile(fullPath);
    }
    // جرب بدون .html
    const altPath = pathMod.join(__dirname, 'public', fileName.replace('.html','') + '.html');
    if(fs.existsSync(altPath)){
      return res.sendFile(altPath);
    }
  }
  next();
});

app.get('/admin-dashboard', (req,res)=> res.sendFile(pathMod.join(__dirname, 'public', 'admin-dashboard.html')));
app.get('/admin-dashboard.html', (req,res)=> res.sendFile(pathMod.join(__dirname, 'public', 'admin-dashboard.html')));

app.listen(PORT, ()=> console.log('WhatsBot running on '+PORT));
