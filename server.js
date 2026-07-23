const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.ADMIN_OPENAI_KEY || process.env.ADMIN || '';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getJson(p, fb){ try{ if(!fs.existsSync(p)) return fb; return JSON.parse(fs.readFileSync(p,'utf8')); }catch{ return fb; } }
function saveJson(p,d){ try{ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p, JSON.stringify(d,null,2),'utf8'); }catch{} }

const BAL = path.join(__dirname,'storage','admin_balance.json');
function getBalance(){
  let b = getJson(BAL, null);
  if(!b){ b={totalCredit:0, used:0, remaining:0, history:[]}; saveJson(BAL,b); }
  b.remaining = Math.max(0, b.totalCredit - b.used);
  return b;
}

app.get('/api/admin/balance',(req,res)=>{ res.json({...getBalance(), keyStatus: MASTER_OPENAI_KEY?'SET':'NOT_SET'}) });

app.post('/api/admin/balance',(req,res)=>{
  let b=getBalance();
  b.totalCredit=parseFloat(req.body.totalCredit); // هنا تكتب 50 أو أي رقم
  b.remaining=Math.max(0,b.totalCredit-b.used);
  b.history.unshift({type:'set',to:b.totalCredit,at:new Date().toISOString()});
  saveJson(BAL,b); res.json({success:true,...b});
});

app.post('/api/admin/add-credit',(req,res)=>{
  let b=getBalance();
  b.totalCredit+=parseFloat(req.body.amount);
  b.remaining=Math.max(0,b.totalCredit-b.used);
  saveJson(BAL,b); res.json({success:true,...b});
});

app.get('/',(req,res)=> res.sendFile(path.join(__dirname,'public','dashboard.html')));
app.get('*',(req,res)=> res.sendFile(path.join(__dirname,'public','dashboard.html')));
app.listen(PORT,()=> console.log(`✅ Editable 50$ Balance Ready`));
