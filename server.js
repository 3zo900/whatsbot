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
const PROOFS_FILE = path.join(DATA_DIR, 'proofs.json');
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
function loadProofs(){
  try{
    if(!fs.existsSync(PROOFS_FILE)) return [];
    return JSON.parse(fs.readFileSync(PROOFS_FILE,'utf8'));
  }catch(e){ return []; }
}
function saveProofs(proofs){
  fs.writeFileSync(PROOFS_FILE, JSON.stringify(proofs,null,2));
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

let paymentProofs = loadProofs();

app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
  const proof = {
    id: Date.now().toString(),
    body: req.body,
    companyName: req.body.companyName || '',
    customerPhone: req.body.customerPhone || '',
    customerEmail: req.body.customerEmail || '',
    company: req.body.company || '',
    plan: req.body.plan || 'pro',
    fullName: req.body.companyName || '',
    phone: req.body.customerPhone || '',
    email: req.body.customerEmail || '',
    status: 'pending',
    file: req.file ? req.file.filename : null,
    createdAt: new Date().toISOString()
  };
  paymentProofs.push(proof);
  saveProofs(paymentProofs);
  let users = loadUsers();
  users.push({
    id: proof.id,
    fullName: proof.companyName,
    companyName: proof.companyName,
    phone: proof.customerPhone,
    customerPhone: proof.customerPhone,
    email: proof.customerEmail,
    customerEmail: proof.customerEmail,
    company: proof.company,
    plan: proof.plan,
    status: 'pending',
    file: proof.file,
    createdAt: proof.createdAt
  });
  saveUsers(users);
  res.json({success:true, proof});
});

app.get('/api/payment-proofs', (req,res)=>{
  const proofs = loadProofs();
  res.json({success:true, proofs: proofs.reverse(), users: proofs.reverse()});
});

app.get('/api/admin/users', (req,res)=>{
  let users = loadUsers();
  if(users.length===0) users = loadProofs();
  res.json({success:true, users: users.reverse(), proofs: loadProofs().reverse()});
});

app.post('/api/admin/approve', (req,res)=>{
  const {id} = req.body;
  let users = loadUsers();
  let proofs = loadProofs();
  users = users.map(u=>{ if(u.id===id){ u.status='approved'; } return u; });
  proofs = proofs.map(p=>{ if(p.id===id){ p.status='approved'; } return p; });
  saveUsers(users);
  saveProofs(proofs);
  res.json({success:true});
});

app.post('/api/admin/reject', (req,res)=>{
  const {id} = req.body;
  let users = loadUsers();
  let proofs = loadProofs();
  users = users.map(u=>{ if(u.id===id){ u.status='rejected'; } return u; });
  proofs = proofs.map(p=>{ if(p.id===id){ p.status='rejected'; } return p; });
  saveUsers(users);
  saveProofs(proofs);
  res.json({success:true});
});

app.post('/api/admin/delete', (req,res)=>{
  const {id} = req.body;
  let users = loadUsers().filter(u=>u.id!==id);
  let proofs = loadProofs().filter(p=>p.id!==id);
  saveUsers(users);
  saveProofs(proofs);
  res.json({success:true});
});

app.get('/health', (req,res)=> res.json({status:'ok', owner: companySettings.owner}));
app.listen(PORT, ()=> console.log('WhatsBot running '+PORT));
