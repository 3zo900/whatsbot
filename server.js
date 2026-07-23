const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// مفتاح الماستر / الأدمن - اللي ضبطناه في OpenAI
const MASTER_OPENAI_KEY = process.env.MASTER_OPENAI_KEY || process.env.OPENAI_API_KEY || process.env.ADMIN || '';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
let stripe=null; try{if(STRIPE_SECRET_KEY.startsWith('sk_'))stripe=require('stripe')(STRIPE_SECRET_KEY);}catch{}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

function getJson(p,fb){try{if(!fs.existsSync(p))return fb;return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return fb}}
function saveJson(p,d){try{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2))}catch{}}
const BAL=path.join(__dirname,'storage','admin_balance.json');
const STATS=path.join(__dirname,'storage','stats.json');
const MERCHANTS=path.join(__dirname,'storage','merchants.json');
const KEYS=path.join(__dirname,'storage','merchant_keys.json');

function getBalance(){let b=getJson(BAL,null);if(!b){b={totalCredit:0,used:0,remaining:0,history:[],createdAt:new Date().toISOString()};saveJson(BAL,b);}b.remaining=Math.max(0,parseFloat((b.totalCredit-b.used).toFixed(4)));return b;}
function getStats(){let s=getJson(STATS,null);if(!s){s={totalMerchants:0,messagesToday:0,activeNumbers:0,totalNumbers:8,abandonedCarts:0,connectedStaff:0,totalStaff:0,conversationsToday:0,avgRating:0,ratingsCount:0,createdAt:new Date().toISOString()};saveJson(STATS,s);}return s;}
function getMerchants(){return getJson(MERCHANTS,[]);}
function getKeys(){return getJson(KEYS,{});}

// تصفير شامل - يبدأ من 0 واقعي
app.post('/api/admin/reset-all',(req,res)=>{
  saveJson(BAL,{totalCredit:0,used:0,remaining:0,history:[],createdAt:new Date().toISOString()});
  saveJson(STATS,{totalMerchants:0,messagesToday:0,activeNumbers:0,totalNumbers:8,abandonedCarts:0,connectedStaff:0,totalStaff:0,conversationsToday:0,avgRating:0,ratingsCount:0,createdAt:new Date().toISOString()});
  saveJson(MERCHANTS,[]); saveJson(KEYS,{});
  res.json({success:true, message:'تم تصفير 0/0 واقعي'});
});

// نظام الماستر - التاجر يربط واتساب يتفعل له AI من مفتاحك
app.post('/api/merchant/activate-ai',(req,res)=>{
  const {merchantId, whatsappNumber} = req.body;
  if(!merchantId) return res.status(400).json({error:'merchantId'});
  let keys=getKeys(); let stats=getStats();
  keys[merchantId]={id:'sub_'+merchantId, merchantId, whatsappNumber, masterKeyUsed: MASTER_OPENAI_KEY?MASTER_OPENAI_KEY.substring(0,20)+'...':'master', status:'active', createdAt:new Date().toISOString(), model:'gpt-4o-mini', owner:'عبدالعزيز'};
  saveJson(KEYS,keys);
  stats.totalMerchants=Object.keys(keys).length; stats.activeNumbers=Object.keys(keys).length; saveJson(STATS,stats);
  let merchants=getMerchants(); if(!merchants.find(m=>m.id===merchantId)){merchants.push({id:merchantId,name:merchantId,domain:'new-store.com',chats:0,status:'متصل'}); saveJson(MERCHANTS,merchants);}
  res.json({success:true, subKey: keys[merchantId], message:'تم التفعيل من مفتاح الماستر - عبدالعزيز'});
});

app.get('/api/admin/balance',(req,res)=>{
  const b=getBalance();
  res.json({...b, openaiKeySet:!!MASTER_OPENAI_KEY, masterPreview: MASTER_OPENAI_KEY?MASTER_OPENAI_KEY.substring(0,20)+'...':'غير موجود', billingUrl:'https://platform.openai.com/account/billing/overview', manual:true, note:'إدخال يدوي + زر يودي لصفحة الرصيد في OpenAI مباشرة'});
});
app.post('/api/admin/balance',(req,res)=>{let b=getBalance();b.totalCredit=parseFloat(req.body.totalCredit);b.remaining=Math.max(0,b.totalCredit-b.used);b.updatedAt=new Date().toISOString();b.history.unshift({type:'set',to:b.totalCredit,at:new Date().toISOString(),by:'عبدالعزيز'});saveJson(BAL,b);res.json(b);});
app.get('/api/admin/stats',(req,res)=>{const b=getBalance();const s=getStats();const m=getMerchants();res.json({totalMerchants:m.length,messagesToday:s.messagesToday,activeNumbers:s.activeNumbers,totalNumbers:s.totalNumbers,remainingBalance:b.remaining,totalCredit:b.totalCredit,merchants:m,zeroed:true,masterKeyActive:!!MASTER_OPENAI_KEY,owner:'عبدالعزيز'});});
app.get('/api/merchant/stats',(req,res)=>{const s=getStats();res.json({conversationsToday:s.conversationsToday,abandonedCarts:s.abandonedCarts,connectedStaff:s.connectedStaff,totalStaff:s.totalStaff,avgRating:s.avgRating,zeroed:true});});

// Stripe Apple Pay + Mada
app.post('/api/create-checkout-session', async (req,res)=>{
  const {plan,customerName,customerEmail,customerPhone}=req.body;
  const PLANS={individual:{name:'أفراد',price:9900},pro:{name:'احترافي',price:19900},enterprise:{name:'شركات',price:39900}};
  const selected=PLANS[plan]||PLANS.pro;
  if(!stripe) return res.json({demo:true});
  try{const session=await stripe.checkout.sessions.create({payment_method_types:['card'],line_items:[{price_data:{currency:'sar',product_data:{name:`WhatsBot.sa - ${selected.name}`},unit_amount:selected.price},quantity:1}],mode:'payment',customer_email:customerEmail,metadata:{plan,customerName,customerPhone},success_url:`${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${req.headers.origin}/cancel.html`});res.json({id:session.id,url:session.url});}catch(e){res.status(500).json({error:e.message});}
});

app.get('/',(req,res)=>res.json({status:"W-CENTER MASTER v1 - عبدالعزيز ✅",master:!!MASTER_OPENAI_KEY,balance:getBalance(),stats:getStats()}));
app.listen(PORT,()=>console.log(`✅ MASTER READY - عبدالعزيز - ${PORT}`));
