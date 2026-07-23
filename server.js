const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// يقرأ المفتاح من MASTER أو ADMIN - نفس اللي حاطه في Render
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.ADMIN_OPENAI_KEY || process.env.ADMIN || process.env.OPENAI_API_KEY || '';

app.use(cors());
app.use(express.json());

function getJson(p, fb){ try{ if(!fs.existsSync(p)) return fb; return JSON.parse(fs.readFileSync(p,'utf8')); }catch{ return fb; } }
function saveJson(p,d){ try{ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p, JSON.stringify(d,null,2),'utf8'); }catch(e){ console.log('save error',e.message); } }

const BAL = path.join(__dirname,'storage','admin_balance.json');

function getBalance(){
  let b = getJson(BAL, null);
  if(!b){ b={totalCredit:0, used:0, remaining:0, history:[], createdAt:new Date().toISOString()}; saveJson(BAL,b); }
  b.remaining = Math.max(0, parseFloat((b.totalCredit - b.used).toFixed(4)));
  return b;
}

// 1. API يرجع الرصيد - تقدر تفتح /api/admin/balance وتشوفه مو فاضي
app.get('/api/admin/balance',(req,res)=>{
  const b=getBalance();
  res.json({...b, keyStatus: MASTER_OPENAI_KEY?'SET':'NOT_SET', keyLen: MASTER_OPENAI_KEY.length});
});

// 2. تعيين رصيد جديد - هنا تكتب 50 أو أي رقم
app.post('/api/admin/balance',(req,res)=>{
  const {totalCredit}=req.body;
  if(totalCredit===''||totalCredit===undefined) return res.status(400).json({error:'amount required'});
  let b=getBalance();
  b.totalCredit=parseFloat(totalCredit);
  b.remaining=Math.max(0,b.totalCredit-b.used);
  b.updatedAt=new Date().toISOString();
  b.history.unshift({type:'set',to:b.totalCredit,at:new Date().toISOString()});
  saveJson(BAL,b);
  console.log(`✅ Balance set to ${b.totalCredit}`);
  res.json({success:true,...b});
});

// 3. إضافة رصيد
app.post('/api/admin/add-credit',(req,res)=>{
  const {amount}=req.body;
  if(!amount) return res.status(400).json({error:'amount required'});
  let b=getBalance();
  b.totalCredit=parseFloat((b.totalCredit+parseFloat(amount)).toFixed(4));
  b.remaining=Math.max(0,b.totalCredit-b.used);
  b.updatedAt=new Date().toISOString();
  b.history.unshift({type:'add',amount:parseFloat(amount),newTotal:b.totalCredit,at:new Date().toISOString()});
  saveJson(BAL,b);
  res.json({success:true,...b});
});

// 4. الصفحة الرئيسية لـ Render - الحين ما تطلع فاضية
app.get('/',(req,res)=>{
  const b=getBalance();
  res.json({
    status: "W-CENTER PRO v1 API Running ✅",
    domain: "wsbot.me",
    balance: b,
    endpoints: ["/api/admin/balance", "/api/admin/add-credit"],
    note: "اللوحات موجودة في هوستنجر - هذا مجرد API"
  });
});

app.get('/api/test',(req,res)=> res.json({ok:true, time:new Date().toISOString()}));

app.listen(PORT,()=> console.log(`✅ W-CENTER API Ready - Balance editable - Key ${MASTER_OPENAI_KEY?'SET len='+MASTER_OPENAI_KEY.length:'NOT SET'}`));
