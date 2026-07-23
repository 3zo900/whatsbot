const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

// المفتاح الحقيقي من Render - ما ينحذف
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getJsonFile(p){try{if(!fs.existsSync(p))return[];return JSON.parse(fs.readFileSync(p,'utf8'))||[]}catch{return[]}}
function saveJsonFile(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2),'utf8')}catch(e){}}

// عداد الرصيد الحقيقي - يقرأ من مفتاح الأدمن
app.get('/api/openai-balance', async (req,res)=>{
  const balPath = path.join(__dirname,'public','storage','openai_balance.json');
  if(!MASTER_OPENAI_KEY){
    const c=getJsonFile(balPath);
    return res.json(c.balance? c : {balance:"0.00", real:false, lastUpdated:new Date().toISOString()});
  }
  try{
    const r = await fetch('https://api.openai.com/v1/dashboard/billing/credit_grants',{headers:{'Authorization':`Bearer ${MASTER_OPENAI_KEY}`}});
    if(r.ok){
      const d=await r.json();
      const b={balance:(d.total_granted-d.total_used).toFixed(2), total_granted:d.total_granted, total_used:d.total_used, lastUpdated:new Date().toISOString(), real:true};
      saveJsonFile(balPath,b);
      saveJsonFile(path.join(__dirname,'storage','openai_balance.json'),b);
      return res.json(b);
    }
  }catch(e){ console.log(e.message); }
  const c=getJsonFile(balPath);
  res.json(c.balance? {...c, lastChecked:new Date().toISOString()} : {balance:"0.00", real:false});
});

// توليد مفتاح للتاجر من مفتاح الأدمن - كل تاجر له مفتاح خاص
app.post('/api/merchant/generate-key',(req,res)=>{
  const {phone, storeUrl, storeName}=req.body;
  if(!phone||!storeUrl) return res.status(400).json({error:'phone and storeUrl required'});
  const hash=crypto.createHash('sha256').update(`${phone}|${storeUrl}|${MASTER_OPENAI_KEY}`).digest('hex');
  const key=`wsbot-m-${hash.substring(0,8)}-${hash.substring(8,16)}-${hash.substring(16,24)}`;
  const p=path.join(__dirname,'storage','merchant_keys.json');
  let keys=getJsonFile(p); if(Array.isArray(keys)){let o={};keys.forEach(k=>{if(k.phone)o[k.phone]=k});keys=o;}
  keys[phone]={phone, store_url:storeUrl, store_name:storeName||storeUrl, ai_key:key, created_at:new Date().toISOString(), status:'active', master_derived:true};
  saveJsonFile(p,keys);
  saveJsonFile(path.join(__dirname,'public','storage','merchant_keys.json'), Object.values(keys));
  res.json({success:true,...keys[phone]});
});

app.get('/api/merchant/get-key',(req,res)=>{
  const {phone}=req.query;
  const p=path.join(__dirname,'storage','merchant_keys.json');
  const keys=getJsonFile(p);
  const k=keys[phone];
  if(k) return res.json({success:true,...k});
  res.json({success:false});
});

app.get('/api/merchants',(req,res)=>{
  const mp=path.join(__dirname,'public','storage','merchants.json');
  res.json(getJsonFile(mp));
});

// الصفحة الرئيسية الحين تودي للواتساب مباشرة - مافيه موقع
app.get('/',(req,res)=>{
  res.send(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=https://wa.me/966510015157"><title>تواصل واتساب</title></head><body style="font-family:tajawal;text-align:center;padding:50px"><h2>جاري تحويلك للواتساب...</h2><a href="https://wa.me/966510015157">اضغط هنا اذا لم يتم تحويلك</a></body></html>`);
});

app.get('*',(req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

app.listen(PORT,()=> console.log(`🚀 Server ${PORT} - NO PAYMENT - Master ${MASTER_OPENAI_KEY?'SET ✅':'NOT SET ❌'}`));
