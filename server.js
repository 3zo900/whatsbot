const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// ملفات ثابتة
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// بيانات الادمن واليوزرات
const ADMIN_EMAIL = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';

let users = [
  {id:1, phone:'966510015157', password:'123456', name:'ابو فهد - مالك', plan:'companies', ai_credits:7000, used_credits:1240, expiry:'2026-12-31', status:'active', whatsapp:'966510015157', employees:[], conversations:[]},
  {id:2, phone:'966500000001', password:'112233', name:'متجر تجريبي', plan:'individual', ai_credits:1000, used_credits:340, expiry:'2026-08-19', status:'active', whatsapp:'', employees:[], conversations:[]}
];

// ============ Routes HTML - تصلح مشكلة Cannot GET ============
app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/index.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/order', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'order.html')));
app.get('/order.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'order.html')));
app.get('/admin', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin-dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));
app.get('/admin-dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));
app.get('/client-dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'client-dashboard.html')));
app.get('/client-dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'client-dashboard.html')));
app.get('/employee-reply', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'employee-reply.html')));
app.get('/employee-reply.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'employee-reply.html')));
app.get('/dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/login', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/login.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));

// ============ API ============
app.get('/api/health', (req,res)=> res.json({status:'ok', time: new Date().toISOString()}));

app.post('/api/employee-reply', (req,res)=>{
  const {clientPhone, message, emp, store} = req.body || {};
  console.log(`[EMP REPLY] ${emp} -> ${clientPhone}: ${message} (via ${store})`);
  // هنا تربط مع واتساب API الحقيقي
  res.json({ok:true, sentVia:'store_number'});
});

app.post('/api/admin/login', (req,res)=>{
  const {email, pass} = req.body || {};
  if(email === ADMIN_EMAIL && pass === ADMIN_PASS){
    return res.json({ok:true, role:'superadmin', email});
  }
  if(email === 'admin' && pass === 'Letsbot@2026'){
    return res.json({ok:true, role:'admin', email});
  }
  res.status(401).json({ok:false, msg:'بيانات خاطئة'});
});

// Fallback لأي ملف html داخل public
app.use((req,res,next)=>{
  if(req.path.endsWith('.html')){
    const fileName = req.path.replace(/^\//,'').replace(/^public\//,'');
    const fullPath = path.join(__dirname, 'public', fileName);
    if(fs.existsSync(fullPath)){
      return res.sendFile(fullPath);
    }
  }
  next();
});

app.listen(PORT, ()=> console.log(`WhatsBot running on ${PORT}`));
