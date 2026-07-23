const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 10000;

// يقرأ MASTER و ADMIN - الاثنين شغالين
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.ADMIN_OPENAI_KEY || process.env.ADMIN || process.env.OPENAI_API_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getJsonFile(p){try{if(!fs.existsSync(p))return[];return JSON.parse(fs.readFileSync(p,'utf8'))||[]}catch{return[]}}
function saveJsonFile(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2),'utf8')}catch{}}

// عداد جديد - يفحص المفتاح بطريقة صحيحة (مو credit_grants القديم)
app.get('/api/openai-balance', async (req,res)=>{
  const balPath = path.join(__dirname,'public','storage','openai_balance.json');
  if(!MASTER_OPENAI_KEY){
    return res.json({balance:"0.00", real:false, error:"No key set"});
  }
  try{
    // نفحص المفتاح بطريقة صحيحة - نطلب قائمة الموديلات
    const r = await fetch('https://api.openai.com/v1/models',{headers:{'Authorization':`Bearer ${MASTER_OPENAI_KEY}`}});
    const txt = await r.text();
    if(r.ok){
      // المفتاح شغال ✅
      const b={balance:"valid", real:true, valid:true, keyWorks:true, lastUpdated:new Date().toISOString(), message:"المفتاح شغال ✅ - الرصيد ما ينعرف عبر API الجديد، شفه من platform.openai.com"};
      saveJsonFile(balPath,b);
      return res.json(b);
    } else {
      return res.json({balance:"0.00", real:false, valid:false, error:txt, status:r.status});
    }
  }catch(e){
    res.json({balance:"0.00", real:false, error:e.message});
  }
});

app.post('/api/merchant/generate-key',(req,res)=>{
  const {phone, storeUrl, storeName}=req.body;
  if(!phone||!storeUrl) return res.status(400).json({error:'required'});
  const hash=crypto.createHash('sha256').update(`${phone}|${storeUrl}|${MASTER_OPENAI_KEY}`).digest('hex');
  const key=`wsbot-m-${hash.substring(0,8)}-${hash.substring(8,16)}-${hash.substring(16,24)}`;
  const p=path.join(__dirname,'storage','merchant_keys.json');
  let keys=getJsonFile(p); if(Array.isArray(keys)){let o={};keys.forEach(k=>{if(k.phone)o[k.phone]=k});keys=o;}
  keys[phone]={phone, store_url:storeUrl, store_name:storeName, ai_key:key, created_at:new Date().toISOString(), status:'active'};
  saveJsonFile(p,keys);
  res.json({success:true,...keys[phone]});
});

app.get('/api/merchants',(req,res)=>{ res.json(getJsonFile(path.join(__dirname,'public','storage','merchants.json'))); });

// مافي دفع - واتساب فقط
app.get('/',(req,res)=> res.send(`<meta http-equiv="refresh" content="0;url=https://wa.me/966510015157">`));
app.get('*',(req,res)=> res.sendFile(path.join(__dirname,'public','dashboard.html')));
app.listen(PORT,()=> console.log(`🚀 Fixed - Key ${MASTER_OPENAI_KEY?'SET len='+MASTER_OPENAI_KEY.length:'NOT SET'}`));
