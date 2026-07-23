const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY || '';

app.use(cors());
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));

// تأكد ان مجلد storage موجود
const STORAGE_DIR = path.join(__dirname,'storage');
try{ fs.mkdirSync(STORAGE_DIR, {recursive:true}); console.log('✅ Storage dir:', STORAGE_DIR); }catch(e){ console.log('mkdir error', e.message); }

function getJson(p,fb){try{if(!fs.existsSync(p)) return fb; return JSON.parse(fs.readFileSync(p,'utf8'))}catch(e){ console.log('read error', p, e.message); return fb}}
function saveJson(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p, JSON.stringify(d,null,2)); console.log('✅ Saved', p); return true;}catch(e){ console.log('❌ save error', p, e.message); return false;}}

const BAL=path.join(STORAGE_DIR,'admin_balance.json');
const MERCHANTS=path.join(STORAGE_DIR,'merchants.json');
const KEYS=path.join(STORAGE_DIR,'merchant_keys.json');
const WA=path.join(STORAGE_DIR,'whatsapp.json');

function getWA(){return getJson(WA,{});}

// اضافة تاجر
app.post('/api/admin/add-merchant', (req,res)=>{
  const {name, storeName, domain, whatsappNumber, balance} = req.body;
  console.log('📥 add-merchant body:', req.body);
  if(!name||!storeName||!whatsappNumber) return res.status(400).json({error:'عبي الاسم واسم المتجر ورقم الجوال *'});
  let num = String(whatsappNumber).replace(/[^0-9]/g,'');
  if(!num.startsWith('966')) num='966'+num.replace(/^0/,'');
  
  let merchants=getJson(MERCHANTS,[]);
  if(merchants.find(m=>m.whatsappNumber===num)) return res.status(400).json({error:'الرقم موجود مسبقاً: '+num});
  
  let newMerchant={
    id: num,
    name: String(name).trim(),
    storeName: String(storeName).trim(),
    companyName: String(storeName).trim(),
    domain: String(domain||'').toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,''),
    storeUrl: domain||'',
    whatsappNumber: num,
    phone: num,
    balance: parseFloat(balance)||10,
    status:'approved',
    enabled:true,
    botActive:false,
    createdAt: new Date().toISOString()
  };
  merchants.push(newMerchant);
  let ok = saveJson(MERCHANTS, merchants);
  if(!ok) return res.status(500).json({error:'فشل حفظ merchants.json - Disk غير مربوط'});
  
  let wa=getWA(); wa[num]={connected:false, botActive:false, createdAt:new Date().toISOString()}; saveJson(WA,wa);
  console.log(`✅ تاجر جديد: ${newMerchant.storeName} - ${num} - $${newMerchant.balance}`);
  res.json({success:true, merchant:newMerchant, total:merchants.length});
});

// توافق مع PHP
app.post('/api/payment-proof', (req,res)=>{
  console.log('📥 payment-proof body:', req.body);
  const b=req.body;
  const name=b.companyName||b.fullName||b.name||b.m_name||'تاجر';
  const storeName=b.company||b.companyName||b.storeName||b.m_store_name||name;
  const domain=b.storeUrl||b.store_url||b.domain||b.m_store_url||'';
  const whatsappNumber=b.customerPhone||b.phone||b.whatsapp||b.whatsappNumber||b.m_phone;
  const balance=b.balance||b.m_balance||10;
  if(!whatsappNumber) return res.json({success:false, error:'no phone'});
  
  let num = String(whatsappNumber).replace(/[^0-9]/g,'');
  if(!num.startsWith('966')) num='966'+num.replace(/^0/,'');
  
  let merchants=getJson(MERCHANTS,[]);
  let existing = merchants.find(m=>m.whatsappNumber===num);
  if(existing){
    existing.balance=parseFloat(existing.balance||0)+parseFloat(balance||0);
    saveJson(MERCHANTS, merchants);
    return res.json({success:true, id:existing.id, updated:true, total:merchants.length});
  }
  let newMerchant={id:num, name, storeName, companyName:storeName, domain:String(domain).replace(/^https?:\/\//,''), storeUrl:domain, whatsappNumber:num, phone:num, balance:parseFloat(balance)||10, status:'approved', enabled:true, createdAt:new Date().toISOString()};
  merchants.push(newMerchant);
  saveJson(MERCHANTS, merchants);
  let wa=getWA(); wa[num]={connected:false, botActive:false, createdAt:new Date().toISOString()}; saveJson(WA,wa);
  res.json({success:true, id:num, total:merchants.length});
});

app.get('/api/payment-proofs',(req,res)=>{
  let merchants=getJson(MERCHANTS,[]);
  console.log('📤 payment-proofs count:', merchants.length);
  res.json(merchants.reverse());
});

app.get('/api/admin/stats',(req,res)=>{
  let merchants=getJson(MERCHANTS,[]);
  let wa=getWA();
  res.json({totalMerchants:merchants.length, merchants, masterKeyActive:!!MASTER_OPENAI_KEY});
});

app.get('/api/whatsapp/status/:number',(req,res)=>{
  let wa=getWA();
  let s=wa[req.params.number];
  let merchants=getJson(MERCHANTS,[]);
  let m=merchants.find(x=>x.whatsappNumber==req.params.number);
  if(!s) return res.json({connected:false, botActive:false, balance:m?.balance||0, message:'غير مرتبط'});
  res.json({number:req.params.number, connected:!!s.connected, botActive:!!s.connected, lastSeen:s.lastSeen, qr:s.qr||null, balance:m?.balance||0});
});

app.post('/api/whatsapp/generate-qr',(req,res)=>{
  let {number}=req.body; let wa=getWA();
  if(!wa[number]) return res.status(404).json({error:'التاجر غير موجود - اضفه اول'});
  wa[number].qr=`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=wsbot-${number}-${Date.now()}`;
  saveJson(WA,wa);
  res.json({success:true, qr:wa[number].qr});
});

app.post('/api/whatsapp/connect',(req,res)=>{
  let {number}=req.body; let wa=getWA();
  if(!wa[number]) return res.status(404).json({error:'غير موجود'});
  wa[number].connected=true; wa[number].botActive=true; wa[number].lastSeen=new Date().toISOString(); saveJson(WA,wa);
  let merchants=getJson(MERCHANTS,[]); let mm=merchants.find(x=>x.whatsappNumber==number); if(mm){mm.botActive=true; saveJson(MERCHANTS,merchants);}
  res.json({success:true});
});

app.post('/api/whatsapp/disconnect',(req,res)=>{ let wa=getWA(); if(wa[req.body.number]){wa[req.body.number].connected=false; saveJson(WA,wa);} res.json({success:true}); });

app.get('/api/debug/storage',(req,res)=>{
  let files=[];
  try{ files=fs.readdirSync(STORAGE_DIR); }catch(e){ files=['no dir - '+e.message]; }
  res.json({storageDir:STORAGE_DIR, files, merchants:getJson(MERCHANTS,[]).length, waKeys:Object.keys(getWA()).length, masterKey:!!MASTER_OPENAI_KEY});
});

app.get('/',(req,res)=>res.json({status:"MASTER عبدالعزيز ✅", master:!!MASTER_OPENAI_KEY, merchants:getJson(MERCHANTS,[]).length, storage:STORAGE_DIR}));

app.listen(PORT,()=>console.log(`✅ MASTER - ${PORT}`));
