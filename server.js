const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY || '';
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
function getJson(p,fb){try{if(!fs.existsSync(p))return fb;return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return fb}}
function saveJson(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}catch{}}
const BAL=path.join(__dirname,'storage','admin_balance.json');
const STATS=path.join(__dirname,'storage','stats.json');
const MERCHANTS=path.join(__dirname,'storage','merchants.json');
const KEYS=path.join(__dirname,'storage','merchant_keys.json');
function getBalance(){let b=getJson(BAL,null);if(!b){b={totalCredit:0,used:0,remaining:0,history:[]};saveJson(BAL,b);}b.remaining=Math.max(0,b.totalCredit-b.used);return b;}
function getStats(){let s=getJson(STATS,null);if(!s){s={totalMerchants:0,messagesToday:0,activeNumbers:0,totalNumbers:8,abandonedCarts:0,connectedStaff:0,totalStaff:0,conversationsToday:0,avgRating:0};saveJson(STATS,s);}return s;}
app.post('/api/admin/reset-all',(req,res)=>{saveJson(BAL,{totalCredit:0,used:0,remaining:0,history:[]});saveJson(STATS,{totalMerchants:0,messagesToday:0,activeNumbers:0,totalNumbers:8,abandonedCarts:0,connectedStaff:0,totalStaff:0,conversationsToday:0,avgRating:0});saveJson(MERCHANTS,[]);saveJson(KEYS,{});res.json({success:true});});
app.post('/api/merchant/activate-ai',(req,res)=>{const {merchantId, whatsappNumber}=req.body;if(!merchantId) return res.status(400).json({error:'merchantId'});let keys=getJson(KEYS,{});let stats=getStats();keys[merchantId]={id:merchantId, whatsappNumber, master:MASTER_OPENAI_KEY?MASTER_OPENAI_KEY.substring(0,20)+'...':'master', status:'active', createdAt:new Date().toISOString(), owner:'عبدالعزيز'};saveJson(KEYS,keys);stats.totalMerchants=Object.keys(keys).length;stats.activeNumbers=Object.keys(keys).length;saveJson(STATS,stats);let merchants=getJson(MERCHANTS,[]);if(!merchants.find(m=>m.id===merchantId)){merchants.push({id:merchantId,name:merchantId,domain:'new-store.com',chats:0});saveJson(MERCHANTS,merchants);}res.json({success:true, message:'تم تفعيل AI من ماستر عبدالعزيز'});});
app.get('/api/admin/balance',(req,res)=>{const b=getBalance();res.json({...b, openaiKeySet:!!MASTER_OPENAI_KEY, billingUrl:'https://platform.openai.com/account/billing/overview', owner:'عبدالعزيز - إدخال يدوي'});});
app.post('/api/admin/balance',(req,res)=>{let b=getBalance();b.totalCredit=parseFloat(req.body.totalCredit);b.remaining=Math.max(0,b.totalCredit-b.used);b.updatedAt=new Date().toISOString();saveJson(BAL,b);res.json(b);});
app.get('/api/admin/stats',(req,res)=>{const b=getBalance();const m=getJson(MERCHANTS,[]);res.json({totalMerchants:m.length,messagesToday:0,activeNumbers:0,totalNumbers:8,remainingBalance:b.remaining,totalCredit:b.totalCredit,merchants:m,zeroed:true,masterKeyActive:!!MASTER_OPENAI_KEY,owner:'عبدالعزيز'});});
app.get('/api/merchant/stats',(req,res)=>{res.json({conversationsToday:0,abandonedCarts:0,connectedStaff:0,totalStaff:0,avgRating:0,zeroed:true});});
app.get('/',(req,res)=>res.json({status:"MASTER - عبدالعزيز - بدون باقات وبدون بنك ✅", master:!!MASTER_OPENAI_KEY}));
app.listen(PORT,()=>console.log(`✅ عبدالعزيز - نظيف بدون باقات ${PORT}`));
