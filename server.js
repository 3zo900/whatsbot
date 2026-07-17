
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

// Serve static from both public and public_v2 and root
const publicPaths = [path.join(__dirname, 'public'), path.join(__dirname, 'public_v2'), __dirname];
publicPaths.forEach(p=>{
  if(fs.existsSync(p)) app.use(express.static(p));
});

const DATA_DIR = path.join(__dirname, 'data');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROOFS_FILE = path.join(DATA_DIR, 'proofs.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR,{recursive:true});

function loadJson(file, def=[]){
  try{ if(!fs.existsSync(file)) return def; return JSON.parse(fs.readFileSync(file,'utf8')); }catch(e){ return def; }
}
function saveJson(file, data){ fs.writeFileSync(file, JSON.stringify(data,null,2)); }

let companySettings = {
  name: 'WhatsBot.sa',
  owner: 'عبدالعزيز البهلال',
  iban: 'SA95 8000 0498 6080 1001 6706',
  account: '498608010016706',
  swift: 'RJHISARI',
  bank: 'مصرف الراجحي',
  whatsapp: '966510015157'
};

const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null, UPLOAD_DIR),
  filename: (req,file,cb)=>cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({storage});

app.get('/api/config', (req,res)=>{
  res.json({company: companySettings, plans:[
    {id:'individual', name:'أفراد / متاجر', price:99},
    {id:'pro', name:'احترافي', price:199},
    {id:'enterprise', name:'شركات', price:399}
  ]});
});

// REGISTER + PAYMENT PROOF COMBINED - SAVE TO USERS
app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
  try{
    const {companyName, customerPhone, customerEmail, company, plan} = req.body;
    const users = loadJson(USERS_FILE, []);
    const proofs = loadJson(PROOFS_FILE, []);
    
    const newEntry = {
      id: Date.now().toString(),
      fullName: companyName || 'عميل',
      companyName: companyName || '',
      phone: customerPhone || '',
      customerPhone: customerPhone || '',
      email: customerEmail || '',
      customerEmail: customerEmail || '',
      company: company || '',
      plan: plan || 'pro',
      status: 'pending',
      file: req.file ? req.file.filename : null,
      originalFile: req.file ? req.file.originalname : null,
      createdAt: new Date().toISOString(),
      amount: plan==='individual'?99:plan==='enterprise'?399:199
    };
    
    // Check duplicate
    if(users.find(u=> (u.email===newEntry.email || u.customerEmail===newEntry.email) && u.status!=='rejected')){
      // still allow but mark
    }
    
    users.push(newEntry);
    proofs.push(newEntry);
    saveJson(USERS_FILE, users);
    saveJson(PROOFS_FILE, proofs);
    
    console.log('New payment proof:', newEntry.email, newEntry.plan);
    res.json({success:true, proof:newEntry});
  }catch(e){
    console.error(e);
    res.status(500).json({success:false, error:e.message});
  }
});

// GET ALL PAYMENT PROOFS / USERS FOR ADMIN
app.get('/api/payment-proofs', (req,res)=>{
  const proofs = loadJson(PROOFS_FILE, []);
  const users = loadJson(USERS_FILE, []);
  // Merge, proofs is primary
  res.json({success:true, proofs: proofs.reverse(), users: users.reverse()});
});

app.get('/api/admin/users', (req,res)=>{
  const users = loadJson(USERS_FILE, []);
  const proofs = loadJson(PROOFS_FILE, []);
  const all = users.length ? users : proofs;
  res.json({success:true, users: all.reverse(), proofs: proofs.reverse()});
});

app.post('/api/admin/approve', (req,res)=>{
  const {id} = req.body;
  let users = loadJson(USERS_FILE, []);
  let proofs = loadJson(PROOFS_FILE, []);
  let idx = users.findIndex(u=>u.id===id);
  if(idx===-1) idx = proofs.findIndex(p=>p.id===id);
  if(idx===-1) return res.status(404).json({success:false, error:'not found'});
  if(users[idx]){ users[idx].status='approved'; users[idx].approvedAt=new Date().toISOString(); saveJson(USERS_FILE, users); }
  if(proofs[idx]){ proofs[idx].status='approved'; saveJson(PROOFS_FILE, proofs); }
  // update both files
  let pIdx = proofs.findIndex(p=>p.id===id);
  if(pIdx!==-1){ proofs[pIdx].status='approved'; saveJson(PROOFS_FILE, proofs); }
  res.json({success:true});
});

app.post('/api/admin/reject', (req,res)=>{
  const {id} = req.body;
  let users = loadJson(USERS_FILE, []);
  let proofs = loadJson(PROOFS_FILE, []);
  let idx = users.findIndex(u=>u.id===id);
  if(idx!==-1){ users[idx].status='rejected'; saveJson(USERS_FILE, users); }
  let pIdx = proofs.findIndex(p=>p.id===id);
  if(pIdx!==-1){ proofs[pIdx].status='rejected'; saveJson(PROOFS_FILE, proofs); }
  res.json({success:true});
});

app.post('/api/admin/delete', (req,res)=>{
  const {id} = req.body;
  let users = loadJson(USERS_FILE, []).filter(u=>u.id!==id);
  let proofs = loadJson(PROOFS_FILE, []).filter(p=>p.id!==id);
  saveJson(USERS_FILE, users);
  saveJson(PROOFS_FILE, proofs);
  res.json({success:true});
});

app.get('/health', (req,res)=> res.json({status:'ok', owner: companySettings.owner}));

app.get('*', (req,res)=>{
  // Try serve index.html
  for(let base of [path.join(__dirname,'public'), path.join(__dirname,'public_v2')]){
    const idx = path.join(base,'index.html');
    if(fs.existsSync(idx)) return res.sendFile(idx);
  }
  res.send('WhatsBot running');
});

app.listen(PORT, ()=> console.log('WhatsBot running '+PORT));
