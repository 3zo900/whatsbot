const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 10000;

// يقرأ كل الأسماء - ADMIN أو MASTER - كلها شغالة
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.ADMIN_OPENAI_KEY || process.env.ADMIN || process.env.OPENAI_API_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getJsonFile(p){try{if(!fs.existsSync(p))return[];return JSON.parse(fs.readFileSync(p,'utf8'))||[]}catch{return[]}}
function saveJsonFile(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2),'utf8')}catch{}}

app.get('/api/openai-balance', async (req,res)=>{
  const balPath = path.join(__dirname,'public','storage','openai_balance.json');
  if(!MASTER_OPENAI_KEY){
    const c=getJsonFile(balPath);
    return res.json({balance:"0.00", real:false, message:"No key", lastUpdated:new Date().toISOString()});
  }
  try{
    const r = await fetch('https://api.openai.com/v1/dashboard/billing/credit_grants',{headers:{'Authorization':`Bearer ${MASTER_OPENAI_KEY}`}});
    if(r.ok){
      const d=await r.json();
      const b={balance:(d.total_granted-d.total_used).toFixed(2), total_granted:d.total_granted, total_used:d.total_used, lastUpdated:new Date().toISOString(), real:true, keyName: process.env.MASTER_OPENAI_KEY ? "MASTER" : "ADMIN"};
      saveJsonFile(balPath,b);
      return res.json(b);
    } else {
      const txt = await r.text();
      return res.json({balance:"0.00", real:false, error: txt, status: r.status});
    }
  }catch(e){ res.json({balance:"0.00", real:false, error:e.message}); }
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

app.get('/',(req,res)=>{ res.send(`<html dir="rtl"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=https://wa.me/966510015157"></head><body style="text-align:center;padding:50px;font-family:sans-serif"><h2>تواصل واتساب</h2><a href="https://wa.me/966510015157">اضغط هنا</a></body></html>`); });
app.get('*',(req,res)=> res.sendFile(path.join(__dirname,'public','dashboard.html')));
app.listen(PORT,()=> console.log(`🚀 Master ${MASTER_OPENAI_KEY?'SET ✅':'NOT SET ❌'} Len:${MASTER_OPENAI_KEY.length}`));
