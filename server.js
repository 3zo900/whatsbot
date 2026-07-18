const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
const OFFICIAL_WA_NUMBER = '966511515727';

const STORAGE_PATH = path.join(__dirname, 'uploads');
if(!fs.existsSync(STORAGE_PATH)) fs.mkdirSync(STORAGE_PATH, {recursive:true});

const storage = multer.diskStorage({
 destination: (req,file,cb)=> cb(null, STORAGE_PATH),
 filename: (req,file,cb)=> {
  const ext = path.extname(file.originalname);
  cb(null, Date.now() + '-' + Math.round(Math.random()*1E9) + ext);
 }
});
const upload = multer({storage: storage});

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51YourSecretKeyHere';
let stripe = null;
try{
 if(STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_')){
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized');
 }
}catch(e){ console.log('Stripe init error', e.message); }

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(STORAGE_PATH));

let proofs = [];
let users = [];

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

app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
 const fileUrl = req.file? `/uploads/${req.file.filename}` : '';
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
  fileUrl: fileUrl,
  filePath: req.file?.filename||'',
  status:'pending',
  createdAt: new Date().toISOString()
 };
 proofs.push(data);
 console.log('📥 New proof with receipt:', data.email, fileUrl, '-> notify', OFFICIAL_WA_NUMBER);
 res.json({success:true, id:data.id, fileUrl:fileUrl});
});

app.get('/api/payment-proofs', (req,res)=>{
 res.json(proofs.slice().reverse());
});

app.post('/api/admin/approve', (req,res)=>{
 const {id}=req.body;
 const p = proofs.find(x=>x.id===id);
 if(p){
  const password = generatePassword(10);
  p.password = password;
  p.status='approved';
  const user = {
   id: p.id, fullName: p.fullName||p.companyName, email: p.customerEmail||p.email,
   phone: p.customerPhone||p.phone, plan: p.plan, password: password,
   status:'approved', fileUrl: p.fileUrl, createdAt: new Date().toISOString(), paid: true
  };
  users.push(user);
  const cleanPhone = (p.customerPhone||p.phone||'').replace(/[^0-9]/g,'');
  const waMsg = `✅ تم تفعيل حسابك في WhatsBot.sa!
🔐 بيانات الدخول:
📧 الإيميل: ${user.email}
🔑 الرقم السري: ${password}
🌐 https://whatsbot.sa/client-dashboard.html
📞 الدعم: ${OFFICIAL_WA_NUMBER}`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
  return res.json({success:true, password, email:user.email, waUrl});
 }
 res.json({success:false});
});

app.post('/api/admin/reject', (req,res)=>{
 const {id}=req.body; const p=proofs.find(x=>x.id===id); if(p) p.status='rejected';
 res.json({success:true});
});

app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, ()=> console.log(`🚀 Server on ${PORT} - Receipts at /uploads - WA ${OFFICIAL_WA_NUMBER}`));
