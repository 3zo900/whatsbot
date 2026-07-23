const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 10000;

// يقرأ MASTER و ADMIN - كلها شغالة
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.ADMIN_OPENAI_KEY || process.env.ADMIN || process.env.OPENAI_API_KEY || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getJsonFile(p){try{if(!fs.existsSync(p))return[];return JSON.parse(fs.readFileSync(p,'utf8'))||[]}catch{return[]}}
function saveJsonFile(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2),'utf8')}catch{}}

app.get('/api/openai-balance', async (req,res)=>{
  const balPath = path.join(__dirname,'public','storage','openai_balance.json');
  if(!MASTER_OPENAI_KEY) return res.json({balance:"0.00", real:false});
  try{
    const r = await fetch('https://api.openai.com/v1/dashboard/billing/credit_grants',{headers:{'Authorization':`Bearer ${MASTER_OPENAI_KEY}`}});
    if(r.ok){
      const d=await r.json();
      const b={balance:(d.total_granted-d.total_used).toFixed(2), real:true, lastUpdated:new Date().toISOString()};
      saveJsonFile(balPath,b);
      return res.json(b);
    }
  }catch{}
  res.json({balance:"0.00", real:false});
});

app.post('/api/merchant/generate-key',(req,res)=>{
  const {phone, storeUrl, storeName}=req.body;
  const hash=crypto.createHash('sha256').update(`${phone}|${storeUrl}|${MASTER_OPENAI_KEY}`).digest('hex');
  const key=`wsbot-m-${hash.substring(0,8)}-${hash.substring(8,16)}-${hash.substring(16,24)}`;
  res.json({success:true, ai_key:key, phone});
});

app.get('/',(req,res)=> res.send(`<meta http-equiv="refresh" content="0;url=https://wa.me/966510015157">`));
app.get('*',(req,res)=> res.sendFile(path.join(__dirname,'public','dashboard.html')));
app.listen(PORT,()=> console.log(`✅ Key ${MASTER_OPENAI_KEY?'SET len='+MASTER_OPENAI_KEY.length:'NOT SET'}`));
