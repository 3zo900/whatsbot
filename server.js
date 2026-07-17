const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR,{recursive:true});

function loadUsers(){
  try{
    if(!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE,'utf8'));
  }catch(e){ return []; }
}
function saveUsers(users){
  fs.writeFileSync(USERS_FILE, JSON.stringify(users,null,2));
}

const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null, UPLOAD_DIR),
  filename: (req,file,cb)=>cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({storage});

let companySettings = {
  name: 'WhatsBot.sa',
  owner: 'عبدالعزيز البهلال',
  iban: 'SA95 8000 0498 6080 1001 6706',
  account: '498608010016706',
  swift: 'RJHISARI',
  bank: 'مصرف الراجحي',
  whatsapp: '966510015157'
};

let paymentProofs = [];

app.get('/api/config', (req,res)=>{
  res.json({company: companySettings, plans:[
    {id:'individual', name:'أفراد / متاجر', price:99},
    {id:'pro', name:'احترافي', price:199},
    {id:'enterprise', name:'شركات', price:399}
  ]});
});

app.post('/api/register', (req,res)=>{
  const {fullName, phone, email, company, plan} = req.body;
  if(!fullName ||!phone ||!email ||!plan) return res.status(400).json({success:false, error:'الحقول الإلزامية مطلوبة'});
  let users = loadUsers();
  if(users.find(u=>u.phone===phone || u.email===email)){
    return res.status(400).json({success:false, error:'الجوال أو الإيميل مسجل مسبقاً'});
  }
  const newUser = {
    id: Date.now().toString(),
    fullName, phone, email, company: company||'', plan,
    status: 'pending',
    whatsappNumber: '',
    createdAt: new Date().toISOString(),
    approvedAt: null
  };
  users.push(newUser);
  saveUsers(users);
  res.json({success:true, user:newUser});
});

app.post('/api/login', (req,res)=>{
  const {identifier} = req.body;
  let users = loadUsers();
  const user = users.find(u=>u.phone===identifier || u.email===identifier);
  if(!user) return res.status(404).json({success:false, error:'الحساب غير موجود'});
  if(user.status!=='approved') return res.status(403).json({success:false, error:'حسابك قيد المراجعة', status:user.status});
  res.json({success:true, user});
});

app.get('/api/admin/users', (req,res)=>{
  let users = loadUsers();
  res.json({success:true, users: users.reverse()});
});

app.post('/api/admin/approve', (req,res)=>{
  const {id, whatsappNumber} = req.body;
  let users = loadUsers();
  const idx = users.findIndex(u=>u.id===id);
  if(idx===-1) return res.status(404).json({success:false});
  users[idx].status='approved';
  users[idx].whatsappNumber=whatsappNumber||users[idx].phone;
  users[idx].approvedAt=new Date().toISOString();
  saveUsers(users);
  res.json({success:true, user:users[idx]});
});

app.post('/api/admin/reject', (req,res)=>{
  const {id} = req.body;
  let users = loadUsers();
  const idx = users.findIndex(u=>u.id===id);
  if(idx===-1) return res.status(404).json({success:false});
  users[idx].status='rejected';
  saveUsers(users);
  res.json({success:true});
});

app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
  const proof = {
    id: Date.now().toString(),
    body: req.body,
    file: req.file? req.file.filename : null,
    createdAt: new Date().toISOString()
  };
  paymentProofs.push(proof);
  res.json({success:true, proof});
});

app.get('/health', (req,res)=> res.json({status:'ok', owner: companySettings.owner}));
app.listen(PORT, ()=> console.log('WhatsBot running '+PORT));
