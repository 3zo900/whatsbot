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
app.use(express.static(path.join(__dirname, 'public_v2')));
app.use(express.static(__dirname));

const DATA_DIR = path.join(__dirname, 'data');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROOFS_FILE = path.join(DATA_DIR, 'proofs.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR,{recursive:true});

function loadJson(file, def){
  try{ if(!fs.existsSync(file)) return def; return JSON.parse(fs.readFileSync(file,'utf8')); }catch(e){ return def; }
}
function saveJson(file, data){ fs.writeFileSync(file, JSON.stringify(data,null,2)); }

const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null, UPLOAD_DIR),
  filename: (req,file,cb)=>cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({storage});

app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
  try{
    const b = req.body;
    const users = loadJson(USERS_FILE, []);
    const proofs = loadJson(PROOFS_FILE, []);
    const newEntry = {
      id: Date.now().toString(),
      fullName: b.companyName || b.fullName || 'عميل',
      companyName: b.companyName || b.fullName || '',
      phone: b.customerPhone || b.phone || '',
      customerPhone: b.customerPhone || b.phone || '',
      email: b.customerEmail || b.email || '',
      customerEmail: b.customerEmail || b.email || '',
      company: b.company || '',
      plan: b.plan || 'pro',
      status: 'pending',
      file: req.file ? req.file.filename : null,
      createdAt: new Date().toISOString(),
      amount: b.plan==='individual'?99:b.plan==='enterprise'?399:199
    };
    users.push(newEntry);
    proofs.push(newEntry);
    saveJson(USERS_FILE, users);
    saveJson(PROOFS_FILE, proofs);
    res.json({success:true, proof:newEntry});
  }catch(e){
    res.status(500).json({success:false, error:e.message});
  }
});

app.get('/api/payment-proofs', (req,res)=>{
  const proofs = loadJson(PROOFS_FILE, []);
  const users = loadJson(USERS_FILE, []);
  res.json({success:true, proofs: proofs.reverse(), users: users.reverse()});
});

app.get('/api/admin/users', (req,res)=>{
  const users = loadJson(USERS_FILE, []);
  const proofs = loadJson(PROOFS_FILE, []);
  res.json({success:true, users: users.reverse(), proofs: proofs.reverse()});
});

app.post('/api/admin/approve', (req,res)=>{
  const id = req.body.id;
  let users = loadJson(USERS_FILE, []);
  let proofs = loadJson(PROOFS_FILE, []);
  users = users.map(u=>{ if(u.id===id){ u.status='approved'; u.approvedAt=new Date().toISOString(); } return u; });
  proofs = proofs.map(p=>{ if(p.id===id){ p.status='approved'; p.approvedAt=new Date().toISOString(); } return p; });
  saveJson(USERS_FILE, users);
  saveJson(PROOFS_FILE, proofs);
  res.json({success:true});
});

app.post('/api/admin/reject', (req,res)=>{
  const id = req.body.id;
  let users = loadJson(USERS_FILE, []);
  let proofs = loadJson(PROOFS_FILE, []);
  users = users.map(u=>{ if(u.id===id){ u.status='rejected'; } return u; });
  proofs = proofs.map(p=>{ if(p.id===id){ p.status='rejected'; } return p; });
  saveJson(USERS_FILE, users);
  saveJson(PROOFS_FILE, proofs);
  res.json({success:true});
});

app.post('/api/admin/delete', (req,res)=>{
  const id = req.body.id;
  let users = loadJson(USERS_FILE, []).filter(u=>u.id!==id);
  let proofs = loadJson(PROOFS_FILE, []).filter(p=>p.id!==id);
  saveJson(USERS_FILE, users);
  saveJson(PROOFS_FILE, proofs);
  res.json({success:true});
});

app.get('/health', (req,res)=> res.json({status:'ok'}));

app.listen(PORT, ()=> console.log('WhatsBot running '+PORT));
