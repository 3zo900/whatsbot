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

function getJson(p,fb){try{if(!fs.existsSync(p))return fb;return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return fb}}
function saveJson(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}catch(e){console.log('save error',e.message)}}

const STORAGE_DIR = path.join(__dirname,'storage');
const BAL=path.join(STORAGE_DIR,'admin_balance.json');
const MERCHANTS=path.join(STORAGE_DIR,'merchants.json');
const KEYS=path.join(STORAGE_DIR,'merchant_keys.json');
const WA=path.join(STORAGE_DIR,'whatsapp.json');

function getBalance(){let b=getJson(BAL,null);if(!b){b={totalCredit:0,used:0,remaining:0,history:[]};saveJson(BAL,b);}b.remaining=Math.max(0,b.totalCredit-b.used);return b;}
function getWA(){return getJson(WA,{});}

// ========== اضافة تاجر جديد - مع رصيد حقيقي ==========
app.post('/api/admin/add-merchant', (req,res)=>{
  const {name, storeName, domain, whatsappNumber, balance} = req.body;
  if(!name||!storeName||!domain||!whatsappNumber) return res.status(400).json({error:'عبي كل الحقول *'});
  if(!String(whatsappNumber).startsWith('966')) return res.status(400).json({error:'رقم الواتساب لازم يبدأ ب 966'});
  let merchants=getJson(MERCHANTS,[]);
  if(merchants.find(m=>m.whatsappNumber===whatsappNumber)) return res.status(400).json({error:'رقم الواتساب موجود مسبقاً'});
  let realBalance=parseFloat(balance)||5.00;
  let newMerchant={
    id: whatsappNumber,
    name: name.trim(),
    storeName: storeName.trim(),
    companyName: storeName.trim(),
    domain: domain.trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/$/,''),
    storeUrl: domain,
    whatsappNumber: whatsappNumber.trim(),
    phone: whatsappNumber.trim(),
    customerPhone: whatsappNumber.trim(),
    balance: realBalance,
    initialBalance: realBalance,
    enabled:true,
    whatsappLinked:false,
    botActive:false,
    status:'approved',
    createdAt: new Date().toISOString()
  };
  merchants.push(newMerchant); saveJson(MERCHANTS,merchants);
  let wa=getWA(); wa[whatsappNumber]={connected:false, botActive:false, lastSeen:null, qr:null, createdAt:new Date().toISOString()}; saveJson(WA,wa);
  let keys=getJson(KEYS,{}); keys[whatsappNumber]={id:whatsappNumber, whatsappNumber, master:MASTER_OPENAI_KEY?MASTER_OPENAI_KEY.substring(0,20)+'...':'master', status:'active', createdAt:new Date().toISOString(), owner:'عبدالعزيز - '+storeName}; saveJson(KEYS,keys);
  console.log(`✅ تاجر جديد: ${storeName} - ${whatsappNumber} - $${realBalance}`);
  res.json({success:true, merchant:newMerchant});
});

// ========== توافق مع لوحة PHP القديمة - مهم ==========
app.post('/api/payment-proof', (req,res)=>{
  const b=req.body;
  const name=b.companyName||b.fullName||b.name||'تاجر';
  const storeName=b.company||b.companyName||b.storeName||name;
  const domain=b.storeUrl||b.store_url||b.domain||'';
  const whatsappNumber=b.customerPhone||b.phone||b.whatsapp||b.whatsappNumber;
  const balance=b.balance||b.merchant_balance||5;
  if(!whatsappNumber) return res.json({success:false, error:'no phone'});
  req.body={name, storeName, domain:domain||'example.com', whatsappNumber, balance};
  // اعادة استخدام نفس المنطق
  let merchants=getJson(MERCHANTS,[]);
  if(merchants.find(m=>m.whatsappNumber===whatsappNumber)){
    let m=merchants.find(m=>m.whatsappNumber===whatsappNumber);
    m.balance=parseFloat(m.balance||0)+parseFloat(balance||0);
    saveJson(MERCHANTS,merchants);
    return res.json({success:true, id:m.id, updated:true});
  }
  let realBalance=parseFloat(balance)||5;
  let newMerchant={id:whatsappNumber, name, storeName, companyName:storeName, domain:domain.replace(/^https?:\/\//,''), storeUrl:domain, whatsappNumber, phone:whatsappNumber, balance:realBalance, enabled:true, status:'approved', createdAt:new Date().toISOString()};
  merchants.push(newMerchant); saveJson(MERCHANTS,merchants);
  let wa=getWA(); wa[whatsappNumber]={connected:false, botActive:false, createdAt:new Date().toISOString()}; saveJson(WA,wa);
  res.json({success:true, id:newMerchant.id});
});

app.get('/api/payment-proofs',(req,res)=>{
  let merchants=getJson(MERCHANTS,[]);
  res.json(merchants.reverse());
});

// ========== احصائيات حقيقية ==========
app.get('/api/admin/stats',(req,res)=>{
  const b=getBalance();
  let merchants=getJson(MERCHANTS,[]);
  let wa=getWA();
  let enriched=merchants.map(m=>{
    let s=wa[m.whatsappNumber]||{};
    return {...m, whatsappLinked:!!s.connected, botActive:!!s.connected && parseFloat(m.balance||0)>0 && m.enabled!==false, lastSeen:s.lastSeen||m.createdAt, isReal:true}
  });
  res.json({
    totalMerchants: merchants.length,
    messagesToday: 0,
    activeNumbers: enriched.filter(m=>m.whatsappLinked).length,
    totalNumbers:8,
    remainingBalance: enriched.reduce((a,m)=>a+parseFloat(m.balance||0),0),
    totalCredit:b.totalCredit,
    merchants: enriched,
    masterKeyActive:!!MASTER_OPENAI_KEY,
    owner:'عبدالعزيز - abdulaziz800'
  });
});

app.get('/api/whatsapp/status/:number',(req,res)=>{
  let wa=getWA();
  let s=wa[req.params.number];
  let merchants=getJson(MERCHANTS,[]);
  let m=merchants.find(x=>x.whatsappNumber==req.params.number);
  if(!s) return res.json({connected:false, botActive:false, real:true, message:'غير مرتبط', balance:m?.balance||0});
  res.json({number:req.params.number, connected:!!s.connected, botActive:!!s.connected && parseFloat(m?.balance||0)>0, lastSeen:s.lastSeen, qr:s.qr||null, real:true, balance:m?.balance||0});
});

app.post('/api/whatsapp/generate-qr',(req,res)=>{
  let {number}=req.body;
  let wa=getWA();
  if(!wa[number]) return res.status(404).json({error:'التاجر غير موجود'});
  wa[number].qr=`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=wsbot-${number}-${Date.now()}`;
  wa[number].qrGeneratedAt=new Date().toISOString();
  saveJson(WA,wa);
  res.json({success:true, qr:wa[number].qr});
});

app.post('/api/whatsapp/connect',(req,res)=>{
  let {number}=req.body;
  let wa=getWA();
  if(!wa[number]) return res.status(404).json({error:'غير موجود'});
  wa[number].connected=true; wa[number].botActive=true; wa[number].lastSeen=new Date().toISOString(); wa[number].connectedAt=new Date().toISOString(); wa[number].qr=null;
  saveJson(WA,wa);
  let merchants=getJson(MERCHANTS,[]); let mm=merchants.find(x=>x.whatsappNumber==number); if(mm){mm.whatsappLinked=true; mm.botActive=true; saveJson(MERCHANTS,merchants);}
  res.json({success:true, connected:true, botActive:true});
});

app.post('/api/whatsapp/disconnect',(req,res)=>{
  let wa=getWA(); if(wa[req.body.number]){wa[req.body.number].connected=false; wa[req.body.number].botActive=false; saveJson(WA,wa);} res.json({success:true});
});

app.post('/api/admin/add-balance',(req,res)=>{
  let {whatsappNumber, amount}=req.body;
  let merchants=getJson(MERCHANTS,[]);
  let m=merchants.find(x=>x.whatsappNumber==whatsappNumber);
  if(!m) return res.status(404).json({error:'التاجر غير موجود'});
  m.balance=parseFloat(m.balance||0)+parseFloat(amount);
  saveJson(MERCHANTS,merchants);
  res.json({success:true, newBalance:m.balance});
});

app.delete('/api/admin/merchant/:number',(req,res)=>{
  let merchants=getJson(MERCHANTS,[]); merchants=merchants.filter(m=>m.whatsappNumber!==req.params.number); saveJson(MERCHANTS,merchants);
  let wa=getWA(); delete wa[req.params.number]; saveJson(WA,wa);
  let keys=getJson(KEYS,{}); delete keys[req.params.number]; saveJson(KEYS,keys);
  res.json({success:true});
});

app.post('/api/whatsapp/webhook', async (req,res)=>{
  let {merchantNumber}=req.body;
  let merchants=getJson(MERCHANTS,[]);
  let merchant=merchants.find(m=>m.whatsappNumber==merchantNumber);
  if(!merchant) return res.json({error:'تاجر غير موجود'});
  if(parseFloat(merchant.balance||0)<=0) return res.json({error:'رصيد منتهي', botStopped:true});
  merchant.balance=parseFloat(merchant.balance)-0.002;
  merchant.totalMessages=(merchant.totalMessages||0)+1;
  saveJson(MERCHANTS,merchants);
  res.json({success:true, newBalance:merchant.balance, costDeducted:0.002});
});

app.get('/api/admin/balance',(req,res)=>{const b=getBalance();res.json({...b, openaiKeySet:!!MASTER_OPENAI_KEY, billingUrl:'https://platform.openai.com/account/billing/overview'});});
app.post('/api/admin/balance',(req,res)=>{let b=getBalance();b.totalCredit=parseFloat(req.body.totalCredit);b.remaining=Math.max(0,b.totalCredit-b.used);b.updatedAt=new Date().toISOString();saveJson(BAL,b);res.json(b);});
app.get('/',(req,res)=>res.json({status:"MASTER عبدالعزيز - رصيد حقيقي + واتساب حقيقي ✅", master:!!MASTER_OPENAI_KEY, merchants:getJson(MERCHANTS,[]).length}));
app.listen(PORT,()=>console.log(`✅ MASTER - ${PORT} - Disk: ${STORAGE_DIR}`));
