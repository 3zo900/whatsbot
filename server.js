const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const ADMIN_EMAIL = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';
const ADMIN_TOKEN = 'wsbot_secure_token_2026';
let users = [
  {id:1, phone:'966510015157', password:'123456', name:'ابو فهد - مالك', plan:'companies', ai_credits:7000, used_credits:1240, expiry:'2026-12-31', status:'active', whatsapp:'966510015157', employees:[{id:1,name:'احمد الدعم',phone:'966500000001',rating:4.8,chats:120}], conversations:[{id:1,customer:'0555123456',last:'ابي استفسر',assigned:'bot',status:'open',rating:5}]},
  {id:2, phone:'966500000001', password:'112233', name:'متجر تجريبي', plan:'individual', ai_credits:1000, used_credits:340, expiry:'2026-08-19', status:'active', whatsapp:'', employees:[], conversations:[]}
];
function isAuth(req){ const c = req.headers.cookie || ''; return c.includes('admin_token='+ADMIN_TOKEN); }

app.get('/', (req,res)=>{
 res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WhatsBot AI</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}
body{background:#f8f8f6;color:#111;overflow-x:hidden}
nav{display:flex;justify-content:space-between;align-items:center;padding:14px 5%;background:#f8f8f6;position:sticky;top:0;z-index:10;border-bottom:1px solid #eee}
.nav-logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px}
.logo-box{width:38px;height:38px;background:#25D366;color:#000;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px}
.nav-btn{background:#111;color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;text-decoration:none;font-weight:600}
.hero{display:flex;align-items:center;justify-content:space-between;padding:40px 5%;gap:30px;max-width:1300px;margin:0 auto}
.hero-text{flex:1.2} .badge-top{display:inline-flex;background:#fff;border:1px solid #eee;padding:6px 12px;border-radius:20px;font-size:12px;color:#555;margin-bottom:20px}
.hero-text h1{font-size:32px;line-height:1.3;font-weight:800;margin-bottom:16px} .hero-text h1 span{color:#1a8a4a}
.hero-desc{color:#777;font-size:15px;line-height:1.7;margin:20px 0 24px;max-width:500px}
.features-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px} .feat{background:#fff;border:1px solid #eee;padding:8px 14px;border-radius:20px;font-size:12px;display:flex;gap:6px}
.hero-mock{flex:0.8} .mock-phone{background:#fff;border:1px solid #e5e5e5;border-radius:24px;padding:12px;box-shadow:0 20px 40px rgba(0,0,0,0.08);max-width:360px;margin:auto;overflow:hidden}
.mock-header{background:#25D366;color:#fff;padding:10px 14px;border-radius:14px;font-size:13px;font-weight:700;display:flex;justify-content:space-between;margin-bottom:10px}
.mock-body{height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0}
.mock-msg{background:#f1f5f0;padding:10px 12px;border-radius:14px 14px 14px 2px;font-size:11px;line-height:1.6;color:#333;max-width:80%;align-self:flex-start;opacity:0;transform:translateY(12px) scale(0.95);animation:msgIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards}
.mock-msg.user{background:#dcf8c6;border-radius:14px 14px 2px 14px;align-self:flex-end;color:#111}
.mock-msg:nth-child(1){animation-delay:0.3s} .mock-msg:nth-child(2){animation-delay:1.1s} .mock-msg:nth-child(3){animation-delay:1.9s} .mock-msg:nth-child(4){animation-delay:2.7s} .mock-msg:nth-child(5){animation-delay:3.5s}
@keyframes msgIn{0%{opacity:0;transform:translateY(12px) scale(0.95)} 100%{opacity:1;transform:translateY(0) scale(1)}}
.mock-typing{display:flex;gap:4px;padding:10px 14px;background:#f1f5f0;border-radius:18px;width:fit-content;align-self:flex-start;margin-top:6px;animation:msgIn 0.4s 4.2s both}
.mock-typing span{width:6px;height:6px;background:#999;border-radius:50%;animation:typing 1.2s infinite} .mock-typing span:nth-child(2){animation-delay:0.2s} .mock-typing span:nth-child(3){animation-delay:0.4s}
@keyframes typing{0%,60%,100%{transform:translateY(0);opacity:0.5} 30%{transform:translateY(-6px);opacity:1}}
.mock-input{border:1px solid #eee;border-radius:20px;padding:8px 12px;font-size:11px;color:#aaa;display:flex;justify-content:space-between;margin-top:10px;background:#fafafa}
.pricing{padding:60px 5%;background:#f8f8f6;text-align:center;max-width:1300px;margin:0 auto} .pricing .top-btn{display:inline-block;background:#111;color:#fff;padding:10px 22px;border-radius:30px;font-size:13px;margin-bottom:24px} .pricing h2{font-size:28px;font-weight:800;margin-bottom:40px}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;text-align:right} @media(max-width:900px){.plans{grid-template-columns:1fr}.hero{flex-direction:column}.hero-text h1{font-size:28px}}
.plan{border-radius:20px;padding:24px;position:relative;border:1px solid #e9e9e9;display:flex;flex-direction:column} .plan-label{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#25D366;color:#000;font-size:11px;font-weight:700;padding:4px 12px;border-radius:12px}
.plan h3{font-size:14px;color:#888;font-weight:500;margin-bottom:8px} .plan .price{font-size:28px;font-weight:800;margin-bottom:16px} .plan .price span{font-size:14px;font-weight:400;color:#888}
.plan ul{list-style:none;margin:16px 0 24px;flex:1} .plan li{font-size:13px;padding:7px 0;display:flex;gap:6px;color:#333} .plan li::before{content:"✓";color:#25D366;font-weight:800}
.plan .btn-plan{padding:12px;border-radius:30px;border:1px solid #111;text-align:center;font-weight:700;font-size:13px;text-decoration:none;display:block}
.plan-afrad{background:#ffffff} .plan-afrad .btn-plan{background:#fff;color:#111} .plan-pro{background:#111;color:#fff;border-color:#111} .plan-pro h3{color:#aaa} .plan-pro .price{color:#fff} .plan-pro li{color:#ddd} .plan-pro .btn-plan{background:#25D366;color:#000;border-color:#25D366}
.plan-companies{background:#e8f5e9;border-color:#c8e6c9} .plan-companies .btn-plan{background:#111;color:#fff} footer{text-align:center;padding:30px;color:#aaa;font-size:12px}
</style></head><body>
<nav><div class="nav-logo"><div class="wb-logo" style="width:44px;height:44px;background:#25D366;border-radius:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,.3)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11C7 7.5 9.5 5 13 5H16C19.5 5 22 7.5 22 11C22 14.5 19.5 17 16 17H11L8.5 19.5V17C5.5 17 3.5 14.5 3.5 11C3.5 10 3.7 9 4 8.2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 2.5L18.7 5L21.2 6.2L18.7 7.4L17.5 9.9L16.3 7.4L13.8 6.2L16.3 5L17.5 2.5Z" fill="#FFEB3B" stroke="white" stroke-width="1" stroke-linejoin="round"/></svg></div><span>WhatsBot AI</span></div><a href="/login.html" class="nav-btn">لوحة التحكم</a></nav>
<section class="hero">
<div class="hero-text"><div class="badge-top">🇸🇦 مساعد واتساب بالذكاء الاصطناعي - لهجة سعودية</div>
<h1>عميلك يكتب لك الساعة 3 الفجر ؟<br><span>عندك زحمة عملاء يراسلونك على</span><br><span>الواتساب وما تلحق عليهم ؟</span><br><span style="color:#111">لا تشيل هم WhatsBot يفزع لك 24/7</span></h1>
<p class="hero-desc">يرد عليهم ويحول المحادثة الصعبة للموظفين عندك ويرسل لك تقييم رضا العميل تلقائي</p>
<div class="features-row"><div class="feat">✔ لهجة سعودية</div><div class="feat">✔ تفعيل فوري</div><div class="feat">✔ بدون رسوم تركيب</div></div></div>
<div class="hero-mock"><div class="mock-phone"><div class="mock-header"><span>WhatsBot AI</span><span>● متصل الآن</span></div>
<div class="mock-body" id="mockBody">
<div class="mock-msg">السلام عليكم</div>
<div class="mock-msg user">وعليكم السلام حياك الله في WhatsBot 🤖 انا المساعد الذكي</div>
<div class="mock-msg">ابي استفسر عن اسعار الباقات</div>
<div class="mock-msg user">اشر لي باختصار، ياخذ منك التفاصيل علشان اساعدك في اختيار الباقة</div>
<div class="mock-msg">متجري عبارة عن قطع غيار سيارات</div>
<div class="mock-typing" id="typing"><span></span><span></span><span></span></div>
</div>
<div class="mock-input"><span>اكتب رسالة...</span><span style="background:#25D366;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center">→</span></div></div></div>
</section>
<section class="pricing"><div class="top-btn">👇 شاهد الباقات</div><h2>باقات تناسب كل متجر</h2>
<div class="plans">
<div class="plan plan-afrad"><h3>أفراد / متاجر</h3><div class="price">89 <span>ر.س / شهر</span></div><ul><li>1000 محادثة</li><li>موظف واحد</li><li>رد ذكي</li><li>تقييم رضا العملاء ⭐</li></ul><a href="/order?plan=individual" class="btn-plan">اختر الباقة</a></div>
<div class="plan plan-pro"><div class="plan-label">الأكثر طلباً</div><h3>احترافي</h3><div class="price">220 <span>ر.س / شهر</span></div><ul><li>3000 محادثة</li><li>3 موظفين</li><li>رد ذكي</li><li>تقييم رضا العملاء ⭐</li></ul><a href="/order?plan=companies" class="btn-plan">اختر الباقة</a></div>
<div class="plan plan-companies"><h3>شركات / مؤسسات</h3><div class="price">480 <span>ر.س / شهر</span></div><ul><li>7000 محادثة</li><li>8 موظفين</li><li>رد ذكي API (سجل تجاري / وثيقة عمل حر)</li><li>تقييم رضا العميل ⭐</li></ul><a href="/order?plan=enterprise" class="btn-plan">اختر الباقة</a></div>
</div></section>
<footer>WhatsBot AI © 2026 - wsbot.me</footer>
<script>
function restartChat(){
  const body = document.getElementById('mockBody');
  const msgs = body.querySelectorAll('.mock-msg');
  msgs.forEach(m=>{m.style.animation='none'; m.offsetHeight; m.style.animation='';});
  const typing = document.getElementById('typing');
  if(typing){typing.style.animation='none'; typing.offsetHeight; typing.style.animation='';}
}
setInterval(restartChat, 8000);
</script>
</body></html>
  `);
});




app.get('/order', (req,res)=>{
  const plan = req.query.plan || 'individual';
  const plans = {
    individual:{name:'أفراد / متاجر', price:'89', sub:'ر.س / شهر'},
    companies:{name:'احترافي - الأكثر طلباً', price:'220', sub:'ر.س / شهر'},
    pro:{name:'احترافي - الأكثر طلباً', price:'220', sub:'ر.س / شهر'},
    enterprise:{name:'شركات / مؤسسات', price:'480', sub:'ر.س / شهر'}
  };
  const cur = plans[plan] || plans['companies'];
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>طلب باقة - WhatsBot</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}
body{background:#fdfcf8;color:#111;min-height:100vh}
.header{padding:28px 5% 24px;text-align:center;background:linear-gradient(180deg,#f6f3eb 0%,#fdfcf8 100%);border-bottom:1px solid #f0ebe0}
.header h1{font-size:26px;font-weight:800;line-height:1.3;margin-bottom:8px} .header h1 .c1{color:#111} .header h1 .c2{color:#ff8a2b}
.header p{color:#8a8578;font-size:13px;line-height:1.7;max-width:420px;margin:0 auto}
.wrap{max-width:560px;margin:-10px auto 40px;padding:0 16px}
.card{background:#fff;border:1px solid #f0ebe0;border-radius:28px;padding:22px;box-shadow:0 10px 40px rgba(0,0,0,0.04)}
.top-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.badge-plan{background:#e8f5e9;color:#1a8a4a;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700}
.plan-title{font-weight:800;font-size:14px}
.field{margin-bottom:16px} .field label{font-size:13px;font-weight:700;margin-bottom:8px;display:block}
.field label span.opt{color:#aaa;font-weight:400;font-size:11px}
.input-light{width:100%;background:#faf6ef;border:1.5px solid #f0ebe0;border-radius:14px;padding:14px 14px;font-size:13px;outline:none;transition:.2s}
.input-light:focus{border-color:#25D366;background:#fff}
.input-light.err{border-color:#ff4444;background:#fff5f5}
.whats-row{display:grid;grid-template-columns:1fr 1.2fr;gap:10px}
.country-box{background:#faf6ef;border:1.5px solid #f0ebe0;border-radius:14px;padding:14px;font-size:13px;display:flex;align-items:center;gap:6px;justify-content:center;font-weight:600}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.type-btn{background:#faf6ef;border:1.5px solid #f0ebe0;border-radius:14px;padding:14px;font-size:12.5px;font-weight:600;text-align:center;cursor:pointer;transition:.2s}
.type-btn.selected{background:#111;color:#fff;border-color:#111}
.type-btn:hover{border-color:#111}
textarea.input-light{resize:none;height:90px}
.btn-submit{width:100%;background:#111;color:#fff;border:none;border-radius:30px;padding:15px;font-size:14px;font-weight:800;margin-top:10px;cursor:pointer;transition:.2s}
.btn-submit:hover{background:#000}
.btn-submit:disabled{background:#ccc}
.note{font-size:11px;color:#aaa;text-align:center;margin-top:14px}
.err-msg{font-size:11px;color:#ff4444;margin-top:6px;display:none}
.err-msg.show{display:block}
</style></head><body>
<div class="header">
  <h1><span class="c1">جاهز تخلي عملاءك</span> <span class="c2">يلاقوا رد</span><br><span class="c2">فوري؟</span></h1>
  <p>عبّ بياناتك تحت وبنكلمك خلال ساعتين على الواتساب<br>عشان نفعل لك الحساب، الاستشارة مجانية</p>
</div>
<div class="wrap">
<div class="card">
  <div class="top-row"><div class="plan-title">${cur.name}</div><div class="badge-plan">${cur.price} ${cur.sub}</div></div>
  
  <div class="field"><label>اسم الشركة / المؤسسة / المتجر <span style="color:red">*</span></label><input id="storeName" class="input-light" placeholder="مثال: متجر فهد للالكترونيات"><div class="err-msg" id="e-storeName">اسم المتجر مطلوب</div></div>
  
  <div class="field"><label>اسمك الكريم <span style="color:red">*</span></label><input id="name" class="input-light" placeholder="مثال: ناصر محمد"><div class="err-msg" id="e-name">الاسم مطلوب</div></div>
  
  <div class="field"><label>رقم الواتساب اللي بنتواصل معك عليه <span style="color:red">*</span></label>
    <div class="whats-row">
      <div class="country-box">🇸🇦 السعودية +966</div>
      <div><input id="whatsapp" class="input-light" placeholder="5XXXXXXXX" inputmode="numeric"><div class="err-msg" id="e-whatsapp">رقم الواتساب مطلوب</div></div>
    </div>
  </div>
  
  <div class="field"><label>البريد الالكتروني <span style="color:red">*</span></label><input id="email" class="input-light" type="email" placeholder="example@company.com"><div class="err-msg" id="e-email">الايميل مطلوب</div></div>
  
  <div class="field"><label>وش نوع نشاطك؟ <span class="opt">(اختياري)</span></label>
    <div class="grid2">
      <div class="type-btn" data-v="متجر">محل / متجر</div>
      <div class="type-btn" data-v="عيادة">عيادة / مركز طبي</div>
      <div class="type-btn" data-v="مكتب عقاري">مكتب عقاري</div>
      <div class="type-btn" data-v="مطعم">مطعم / كافيه</div>
    </div>
    <div style="margin-top:10px"><div class="type-btn" data-v="خدمات أخرى">خدمات أخرى</div></div>
  </div>
  
  <div class="field"><label>وش أكثر شي متعبك في الرد على العملاء؟ <span class="opt">(اختياري)</span></label><textarea id="pain" class="input-light" placeholder="مثال: ما ألحق أرد على كل العملاء وتروح علي مبيعات كثيرة..."></textarea></div>
  
  <button class="btn-submit" id="btnSend" onclick="submitOrder()">✅ إرسال الطلب - بنكلمك واتساب</button>
  <div class="note">WhatsBot.sa 2026 © - سيتم التواصل معك خلال ساعتين</div>
  <div style="text-align:center;margin-top:10px"><a href="/" style="font-size:12px;color:#888;text-decoration:none">← العودة للرئيسية</a></div>
</div>
</div>
<script>
let selectedType = '';
document.querySelectorAll('.type-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.type-btn').forEach(x=>x.classList.remove('selected'));
    b.classList.add('selected');
    selectedType = b.dataset.v;
  });
});
async function submitOrder(){
  const storeName=document.getElementById('storeName').value.trim();
  const name=document.getElementById('name').value.trim();
  const whatsapp=document.getElementById('whatsapp').value.trim();
  const email=document.getElementById('email').value.trim();
  const pain=document.getElementById('pain').value.trim();
  let ok=true;
  const check=(id,val,errId)=>{const e=document.getElementById(errId); const inp=document.getElementById(id); if(!val){e.classList.add('show'); inp.classList.add('err'); ok=false;} else {e.classList.remove('show'); inp.classList.remove('err');}};
  check('storeName',storeName,'e-storeName');
  check('name',name,'e-name');
  check('whatsapp',whatsapp,'e-whatsapp');
  check('email',email,'e-email');
  if(!ok) return;
  const btn=document.getElementById('btnSend'); btn.disabled=true; btn.innerText='جاري الارسال...';
  try{
    const res=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({storeName,name,whatsapp:'966'+whatsapp.replace(/^0+/,'').replace(/^966/,''),email,type:selectedType,pain,plan:'${plan}'})});
    const data=await res.json();
    if(data.success){ alert('تم ارسال طلبك بنجاح ✅ بنتواصل معك واتساب خلال ساعتين'); location.href='/'; }
    else { alert('تم الارسال بنجاح'); location.href='/'; }
  }catch(e){ alert('تم ارسال طلبك بنجاح ✅'); location.href='/'; }
}
</script></body></html>`);
});
app.post('/api/order', (req,res)=>{
  const {storeName,name,whatsapp,email,type,pain,plan}=req.body;
  if(!storeName||!name||!whatsapp||!email) return res.status(400).json({success:false,message:'بيانات ناقصة'});
  console.log('ORDER:',req.body);
  users.push({id:Date.now(), phone:whatsapp, password:'123456', name:storeName, realName:name, plan:plan||'individual', ai_credits:1000, used_credits:0, expiry:'2026-12-31', status:'pending', whatsapp, email, businessType:type, pain});
  res.json({success:true});
});

app.get('/login.html', (req,res)=>{
 res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دخول العملاء</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}body{background:#f8f8f6;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.box{background:#fff;border:1px solid #e5e5e5;border-radius:24px;padding:32px;width:100%;max-width:420px}
.logo-box{width:60px;height:60px;background:#25D366;color:#000;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;margin:0 auto 16px}
h2{text-align:center;font-size:20px;margin-bottom:6px} .sub{text-align:center;color:#888;font-size:12px;margin-bottom:24px}
.field{margin-bottom:14px} .field label{color:#666;font-size:12px;display:block;margin-bottom:6px} .field input{width:100%;padding:13px;border-radius:12px;border:1px solid #ddd;background:#fff;color:#111}
.btn{width:100%;padding:13px;border-radius:12px;border:none;background:#111;color:#fff;font-weight:800;font-size:14px;cursor:pointer;margin-top:6px} .err{background:#ffebee;color:#c62828;padding:10px;border-radius:10px;font-size:12px;margin-bottom:12px;display:none;text-align:center}
</style></head><body>
<div class="box"><div class="wb-logo" style="width:44px;height:44px;background:#25D366;border-radius:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,.3)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11C7 7.5 9.5 5 13 5H16C19.5 5 22 7.5 22 11C22 14.5 19.5 17 16 17H11L8.5 19.5V17C5.5 17 3.5 14.5 3.5 11C3.5 10 3.7 9 4 8.2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 2.5L18.7 5L21.2 6.2L18.7 7.4L17.5 9.9L16.3 7.4L13.8 6.2L16.3 5L17.5 2.5Z" fill="#FFEB3B" stroke="white" stroke-width="1" stroke-linejoin="round"/></svg></div><h2>دخول العملاء</h2><p class="sub">WhatsBot AI - لوحة تحكم العملاء</p><div class="err" id="err"></div>
<div class="field"><label>اسم المستخدم (رقم الجوال)</label><input type="text" id="user" placeholder="9665xxxxxxxx"></div>
<div class="field"><label>كلمة المرور</label><input type="password" id="pass" placeholder="••••••••"></div>
<button class="btn" onclick="login()">دخول →</button>
<div style="text-align:center;margin-top:18px"><a href="/" style="font-size:12px;text-decoration:none;color:#111">← العودة للرئيسية</a></div></div>
<script>
async function login(){
  const phone=document.getElementById('user').value.trim();
  const pass=document.getElementById('pass').value.trim();
  const err=document.getElementById('err');
  err.style.display='none';
  if(!phone||!pass){err.innerText='ادخل اليوزر والباسورد';err.style.display='block';return;}
  try{
    const res=await fetch('/api/client/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,password:pass})});
    const data=await res.json();
    if(data.success){localStorage.setItem('ws_client',JSON.stringify(data.user));location.href='/client-dashboard?phone='+encodeURIComponent(phone);}
    else{err.innerText=data.message;err.style.display='block';}
  }catch(e){err.innerText='خطأ';err.style.display='block';}
}
</script></body></html>`);
});

app.get('/client-dashboard', (req,res)=>{
  res.send(`
<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>لوحة العميل</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<style>
:root{--green:#25D366;--bg:#f8f8f6;--card:#fff;--border:#eee}
*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif} body{background:var(--bg);color:#111;display:flex;min-height:100vh}
.sidebar{width:280px;background:#111;color:#fff;padding:20px;position:fixed;height:100vh;overflow:auto;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:28px} .brand .logo-box{width:40px;height:40px;background:var(--green);color:#000;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900}
.menu{flex:1} .menu a{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;color:#888;text-decoration:none;margin-bottom:4px;font-size:13px;cursor:pointer} .menu a.active,.menu a:hover{background:#1e1e1e;color:#fff}
.main{flex:1;margin-right:280px;padding:24px} .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:18px} .kpi{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px}
.kpi .label{color:#888;font-size:11px} .kpi .val{font-size:22px;font-weight:800;margin:4px 0}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px} .card h3{font-size:14px;margin-bottom:12px}
table{width:100%;border-collapse:collapse} th{color:#888;font-size:11px;text-align:right;padding:10px;border-bottom:1px solid var(--border)} td{padding:12px 10px;border-bottom:1px solid #f5f5f5;font-size:12px}
.badge{padding:3px 8px;border-radius:10px;font-size:10px;font-weight:700} .b-bot{background:#e8f5e9;color:#1a8a4a} .b-emp{background:#e3f2fd;color:#1565c0}
.btn{padding:7px 14px;border-radius:20px;border:none;cursor:pointer;font-weight:700;font-size:11px} .btn-g{background:var(--green);color:#000} .btn-d{background:#111;color:#fff} .btn-w{background:#fff;border:1px solid #ddd;color:#111} .btn-r{background:#ffebee;color:#c62828}
.field{margin-bottom:12px} .field label{display:block;color:#666;font-size:11px;margin-bottom:4px} .field input{width:100%;padding:10px;border-radius:10px;border:1px solid #ddd;background:#fff;font-size:12px}
.progress{height:6px;background:#eee;border-radius:10px;overflow:hidden;margin-top:6px} .progress i{display:block;height:100%;background:var(--green)}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;align-items:center;justify-content:center;padding:20px} .modal.show{display:flex} .modal-box{background:#fff;border-radius:16px;padding:20px;width:100%;max-width:420px}
@media(max-width:900px){.sidebar{display:none} .main{margin-right:0}}
</style></head><body>
<div class="sidebar"><div class="brand"><div class="wb-logo" style="width:44px;height:44px;background:#25D366;border-radius:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,.3)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11C7 7.5 9.5 5 13 5H16C19.5 5 22 7.5 22 11C22 14.5 19.5 17 16 17H11L8.5 19.5V17C5.5 17 3.5 14.5 3.5 11C3.5 10 3.7 9 4 8.2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 2.5L18.7 5L21.2 6.2L18.7 7.4L17.5 9.9L16.3 7.4L13.8 6.2L16.3 5L17.5 2.5Z" fill="#FFEB3B" stroke="white" stroke-width="1" stroke-linejoin="round"/></svg></div><b>WhatsBot AI</b></div>
<div class="menu"><a class="active" onclick="showTab('dash')">📊 لوحة التحكم</a><a onclick="showTab('convs')">💬 المحادثات <span id="convCount" style="background:var(--green);color:#000;padding:2px 6px;border-radius:10px;font-size:10px;margin-right:6px">0</span></a><a onclick="showTab('employees')">👥 الموظفين <span id="empCountBadge" style="color:#888;font-size:10px"></span></a><a onclick="showTab('ratings')">⭐ تقييم رضا العملاء</a><a onclick="showTab('settings')">⚙️ الاعدادات</a><a href="/login.html" style="color:#ff6b6b;margin-top:20px">🚪 خروج</a></div>
<div style="margin-top:20px;padding:12px;background:#1e1e1e;border-radius:12px"><div style="font-size:11px;color:#888">رقم الواتساب</div><div style="font-size:13px;font-weight:700;margin:4px 0" id="sideWhatsapp">-</div><div style="font-size:10px;color:#666" id="sidePhone"></div></div></div>
<div class="main"><div class="top"><div><h1 style="font-size:20px">لوحة تحكم المتجر</h1><p style="font-size:12px;color:#888" id="welcomeMsg">مرحبا بك 👋</p></div><div style="display:flex;gap:8px"><button class="btn btn-w" onclick="downloadPDF()">📄 تقرير PDF</button><button class="btn btn-g" onclick="refreshData()">🔄 تحديث</button></div></div>
<div class="kpis"><div class="kpi"><div class="label">المحادثات المستخدمة</div><div class="val" id="kpiUsed">0 / 0</div><div class="progress"><i id="kpiProg" style="width:0%"></i></div><div class="label" style="margin-top:4px" id="kpiSub"></div></div><div class="kpi"><div class="label">تقييم البوت</div><div class="val">⭐ <span id="kpiBotRate">4.8</span></div><div class="label">من 5 - <span id="kpiBotChats">0</span> محادثة</div></div><div class="kpi"><div class="label">الموظفين</div><div class="val" id="kpiEmps">0</div><div class="label" id="kpiEmpsLimit"></div></div><div class="kpi"><div class="label">تقييم العملاء</div><div class="val">⭐ <span id="kpiAvgRate">4.7</span></div><div class="label">متوسط التقييم</div></div></div>
<div id="tab-dash"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div class="card"><h3>💬 المحادثات الجارية</h3><div id="liveChats"></div></div><div class="card"><h3>🔄 تحويل محادثة</h3><div class="field"><label>اختر المحادثة</label><select id="transChat" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd"></select></div><div class="field"><label>حول الى</label><select id="transTo" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd"><option value="bot">🤖 البوت</option></select></div><button class="btn btn-g" style="width:100%;margin-top:8px" onclick="transferChat()">تحويل الآن</button></div></div></div>
<div id="tab-convs" style="display:none"><div class="card"><h3>💬 جميع المحادثات</h3><div style="overflow:auto"><table><thead><tr><th>العميل</th><th>آخر رسالة</th><th>المسؤول</th><th>الحالة</th><th>التقييم</th></tr></thead><tbody id="convTable"></tbody></table></div></div></div>
<div id="tab-employees" style="display:none"><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3>👥 الموظفون (<span id="empCount">0</span> / <span id="empLimit">0</span>)</h3><button class="btn btn-g" onclick="openEmpModal()">+ اضافة موظف</button></div><div style="font-size:11px;color:#888;margin-bottom:12px">حسب باقتك: افراد 1 موظف، احترافي 3 موظفين، شركات 8 موظفين.</div><div id="empList" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px"></div></div></div>
<div id="tab-ratings" style="display:none"><div class="card"><h3>⭐ تقييم رضا العملاء</h3><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px" id="ratingCards"></div><div style="overflow:auto"><table><thead><tr><th>الموظف/البوت</th><th>عدد المحادثات</th><th>التقييم</th></tr></thead><tbody id="ratingTable"></tbody></table></div></div></div>
<div id="tab-settings" style="display:none"><div class="card"><h3>⚙️ اعدادات المتجر - رقم الواتساب لتفعيل البوت</h3><div class="field"><label>رقم واتساب المتجر / المؤسسة / الشركة</label><input id="setWhatsapp" placeholder="9665xxxxxxxx"></div><div class="field"><label>اسم المتجر</label><input id="setStoreName"></div><button class="btn btn-g" onclick="saveSettings()">حفظ الاعدادات ✅</button></div></div></div>
<div class="modal" id="empModal"><div class="modal-box"><h3 style="font-size:14px;margin-bottom:12px">اضافة موظف</h3><div class="field"><label>اسم الموظف</label><input id="empName"></div><div class="field"><label>رقم الجوال</label><input id="empPhone"></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-g" style="flex:1" onclick="addEmployee()">اضافة</button><button class="btn btn-w" style="flex:1" onclick="closeEmpModal()">الغاء</button></div></div></div>
<script>
let currentUser = JSON.parse(localStorage.getItem('ws_client')||'null');
let urlPhone = new URLSearchParams(location.search).get('phone');
if(!currentUser && urlPhone){ const localUsers = JSON.parse(localStorage.getItem('wsbot_v11')||'[]'); currentUser = localUsers.find(u=>u.phone===urlPhone); if(currentUser) localStorage.setItem('ws_client', JSON.stringify(currentUser)); }
if(!currentUser){ location.href='/login.html'; }
function getPlanLimit(plan){ if(plan==='individual') return 1; if(plan==='pro') return 3; return 8; }
function getPlanConversations(plan){ if(plan==='individual') return 1000; if(plan==='pro') return 3000; return 7000; }
function refreshData(){
  if(!currentUser) return;
  document.getElementById('welcomeMsg').innerText = 'مرحبا ' + currentUser.name + ' - باقتك: ' + (currentUser.plan==='individual'?'افراد 89':currentUser.plan==='pro'?'احترافي 220':'شركات 480');
  document.getElementById('sidePhone').innerText = currentUser.phone;
  document.getElementById('sideWhatsapp').innerText = currentUser.whatsapp || 'لم يتم الاضافة';
  document.getElementById('setWhatsapp').value = currentUser.whatsapp || '';
  document.getElementById('setStoreName').value = currentUser.name || '';
  const limit = getPlanConversations(currentUser.plan); const used = currentUser.used_credits || 0;
  document.getElementById('kpiUsed').innerText = used + ' / ' + limit;
  document.getElementById('kpiProg').style.width = Math.min(100, (used/limit)*100) + '%';
  document.getElementById('kpiSub').innerText = 'متبقي ' + (limit-used) + ' محادثة';
  document.getElementById('kpiBotChats').innerText = used;
  const empLimit = getPlanLimit(currentUser.plan); const emps = currentUser.employees || [];
  document.getElementById('kpiEmps').innerText = emps.length; document.getElementById('kpiEmpsLimit').innerText = 'الحد ' + empLimit + ' موظفين';
  document.getElementById('empCount').innerText = emps.length; document.getElementById('empLimit').innerText = empLimit;
  document.getElementById('empCountBadge').innerText = '('+emps.length+'/'+empLimit+')';
  document.getElementById('convCount').innerText = (currentUser.conversations||[]).length;
  document.getElementById('empList').innerHTML = emps.map(e=>\`<div style="border:1px solid #eee;border-radius:12px;padding:12px"><div style="display:flex;justify-content:space-between"><b>\${e.name}</b><span>⭐ \${e.rating||4.5}</span></div><div style="font-size:11px;color:#888;margin:4px 0" dir="ltr">\${e.phone}</div><div style="font-size:11px;color:#666">\${e.chats||0} محادثة</div><button class="btn btn-r" style="margin-top:8px;width:100%" onclick="removeEmp(\${e.id})">حذف</button></div>\`).join('') || '<div style="color:#888;font-size:12px">لا يوجد موظفون</div>';
  const empOptions = emps.map(e=>\`<option value="\${e.name}">👤 \${e.name} - \${e.phone}</option>\`).join('');
  document.getElementById('transTo').innerHTML = '<option value="bot">🤖 البوت</option>' + empOptions;
  const convs = currentUser.conversations || [];
  document.getElementById('transChat').innerHTML = convs.map(c=>\`<option value="\${c.id}">\${c.customer} - \${c.last}</option>\`).join('') || '<option>لا يوجد</option>';
  document.getElementById('liveChats').innerHTML = convs.slice(0,3).map(c=>\`<div style="padding:10px;border:1px solid #f0f0f0;border-radius:10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center"><div><b style="font-size:12px">\${c.customer}</b><div style="font-size:11px;color:#888">\${c.last}</div></div><span class="badge \${c.assigned==='bot'?'b-bot':'b-emp'}">\${c.assigned}</span></div>\`).join('') || '<div style="color:#888;font-size:12px">لا يوجد محادثات</div>';
  document.getElementById('convTable').innerHTML = convs.map(c=>\`<tr><td>\${c.customer}</td><td>\${c.last}</td><td><span class="badge \${c.assigned==='bot'?'b-bot':'b-emp'}">\${c.assigned}</span></td><td>\${c.status}</td><td>⭐ \${c.rating||5}</td></tr>\`).join('') || '<tr><td colspan=5 style="text-align:center;color:#888">لا يوجد</td></tr>';
  const allRatings = [{name:'🤖 البوت', chats:used, rating:4.8}, ...emps.map(e=>({name:e.name, chats:e.chats||0, rating:e.rating||4.5}))];
  document.getElementById('ratingCards').innerHTML = allRatings.map(r=>\`<div style="background:#fff;border:1px solid #eee;border-radius:12px;padding:14px;text-align:center"><div style="font-size:12px;font-weight:700">\${r.name}</div><div style="font-size:22px;font-weight:800;margin:6px 0">⭐ \${r.rating}</div><div style="font-size:11px;color:#888">\${r.chats} محادثة</div></div>\`).join('');
  document.getElementById('ratingTable').innerHTML = allRatings.map(r=>\`<tr><td>\${r.name}</td><td>\${r.chats}</td><td>⭐ \${r.rating}</td></tr>\`).join('');
}
function showTab(tab){ document.querySelectorAll('[id^=tab-]').forEach(el=>el.style.display='none'); document.getElementById('tab-'+tab).style.display='block'; }
function openEmpModal(){ const limit = getPlanLimit(currentUser.plan); if((currentUser.employees||[]).length >= limit){ alert('وصلت للحد المسموح ('+limit+' موظفين)'); return; } document.getElementById('empModal').classList.add('show'); }
function closeEmpModal(){ document.getElementById('empModal').classList.remove('show'); }
function addEmployee(){ const name = document.getElementById('empName').value.trim(); const phone = document.getElementById('empPhone').value.trim(); if(!name || !phone){ alert('ادخل الاسم ورقم الجوال'); return; } const limit = getPlanLimit(currentUser.plan); if((currentUser.employees||[]).length >= limit){ alert('الحد '+limit); return; } currentUser.employees = currentUser.employees || []; currentUser.employees.push({id:Date.now(), name, phone, rating:4.5, chats:0}); saveClient(); closeEmpModal(); document.getElementById('empName').value=''; document.getElementById('empPhone').value=''; }
function removeEmp(id){ if(!confirm('حذف الموظف؟')) return; currentUser.employees = currentUser.employees.filter(e=>e.id!==id); saveClient(); }
function saveSettings(){ currentUser.whatsapp = document.getElementById('setWhatsapp').value.trim(); currentUser.name = document.getElementById('setStoreName').value.trim() || currentUser.name; saveClient(); alert('تم الحفظ - سيتم تفعيل البوت على رقم: ' + currentUser.whatsapp); }
function saveClient(){ localStorage.setItem('ws_client', JSON.stringify(currentUser)); let all = JSON.parse(localStorage.getItem('wsbot_v11')||'[]'); let idx = all.findIndex(u=>u.phone===currentUser.phone); if(idx>=0) all[idx]=currentUser; else all.push(currentUser); localStorage.setItem('wsbot_v11', JSON.stringify(all)); refreshData(); }
function transferChat(){ const chatId = document.getElementById('transChat').value; const to = document.getElementById('transTo').value; if(!chatId) return; let conv = currentUser.conversations.find(c=>c.id==chatId); if(conv){ conv.assigned = to; saveClient(); alert('تم تحويل المحادثة الى: ' + to); } }
function downloadPDF(){ const {jsPDF} = window.jspdf; const doc = new jsPDF(); doc.text('WhatsBot AI - Weekly Report', 10, 10); doc.text('Store: ' + currentUser.name, 10, 20); doc.text('Phone: ' + currentUser.phone, 10, 30); doc.text('Whatsapp: ' + (currentUser.whatsapp||'-'), 10, 40); doc.text('Used: ' + (currentUser.used_credits||0) + ' / ' + getPlanConversations(currentUser.plan), 10, 50); doc.save('report-' + currentUser.phone + '.pdf'); }
refreshData();
</script></body></html>
  `);
});

app.post('/api/client/login', (req,res)=>{
  const {phone, password} = req.body;
  let user = users.find(u=>u.phone===phone && u.password===password);
  if(!user) return res.json({success:false, message:'اليوزر او الباسورد غير صحيح'});
  if(user.status!=='active') return res.json({success:false, message:'الحساب غير مفعل'});
  return res.json({success:true, user});
});

app.get('/az-admin-secure-2026', (req,res)=>{
 res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Secure</title>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI}body{background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}.box{background:#141414;border:1px solid #222;border-radius:20px;padding:28px;width:100%;max-width:380px;text-align:center}.logo-box{width:60px;height:60px;background:#25D366;color:#000;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;margin:0 auto 12px}h2{font-size:16px;margin-bottom:4px}p{color:#666;font-size:11px;margin-bottom:16px}.field{margin-bottom:10px;text-align:right}.field label{color:#888;font-size:11px;display:block;margin-bottom:4px}.field input{width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;font-size:12px}.btn{width:100%;padding:11px;border-radius:10px;border:none;background:#25D366;color:#000;font-weight:800;cursor:pointer;margin-top:8px}.err{background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.2);color:#ff6b6b;padding:8px;border-radius:8px;font-size:11px;margin-bottom:8px;display:none}</style></head><body>
<div class="box"><div class="wb-logo" style="width:44px;height:44px;background:#25D366;border-radius:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,.3)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11C7 7.5 9.5 5 13 5H16C19.5 5 22 7.5 22 11C22 14.5 19.5 17 16 17H11L8.5 19.5V17C5.5 17 3.5 14.5 3.5 11C3.5 10 3.7 9 4 8.2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 2.5L18.7 5L21.2 6.2L18.7 7.4L17.5 9.9L16.3 7.4L13.8 6.2L16.3 5L17.5 2.5Z" fill="#FFEB3B" stroke="white" stroke-width="1" stroke-linejoin="round"/></svg></div><h2>Admin Secure</h2><p>رابط سري للمالك فقط</p><div class="err" id="err"></div>
<div class="field"><label>البريد</label><input type="email" id="email" value="az.behlal@gmail.com"></div>
<div class="field"><label>كلمة المرور</label><input type="password" id="pass"></div>
<button class="btn" onclick="login()">دخول 🔐</button></div>
<script>
async function login(){
  const email=document.getElementById('email').value.trim();
  const pass=document.getElementById('pass').value;
  const err=document.getElementById('err'); err.style.display='none';
  try{
    const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pass})});
    const data=await res.json();
    if(data.success) location.href='/admin';
    else {err.innerText=data.message; err.style.display='block';}
  }catch(e){err.innerText='خطأ'; err.style.display='block';}
}
</script></body></html>`);
});

app.post('/api/admin/login', (req,res)=>{
  const {email, pass} = req.body;
  if(email===ADMIN_EMAIL && pass===ADMIN_PASS){
    res.setHeader('Set-Cookie', 'admin_token='+ADMIN_TOKEN+'; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400');
    return res.json({success:true});
  }
  return res.status(401).json({success:false, message:'بيانات غير صحيحة'});
});

app.get('/admin/logout', (req,res)=>{ res.setHeader('Set-Cookie','admin_token=; Path=/; Max-Age=0'); res.redirect('/'); });

app.post('/api/users', (req,res)=>{
  if(!isAuth(req)) return res.status(401).json({message:'غير مصرح'});
  const {phone, password, name, plan, ai_credits, expiry, status} = req.body;
  let existing = users.find(u=>u.phone===phone);
  if(existing){ existing.password = password || existing.password; existing.name = name; existing.plan = plan; existing.ai_credits = +ai_credits; existing.expiry = expiry; existing.status = status; }
  else { users.push({id:Date.now(), phone, password, name, plan, ai_credits:+ai_credits, used_credits:0, expiry, status, whatsapp:'', employees:[], conversations:[]}); }
  res.json({success:true, users});
});

app.get('/admin', (req,res)=>{
  if(!isAuth(req)) return res.redirect('/az-admin-secure-2026');
  res.send(`
<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin</title>
<style>
:root{--green:#25D366;--bg:#0a0a0a;--card:#141414;--border:#222}
*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI}body{background:var(--bg);color:#fff;display:flex;min-height:100vh}
.sidebar{width:280px;background:#111;border-left:1px solid var(--border);padding:18px;position:fixed;height:100vh;overflow:auto}
.brand{display:flex;align-items:center;gap:10px;margin-bottom:20px} .brand .logo-box{width:36px;height:36px;background:var(--green);color:#000;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900}
.menu a{display:block;padding:9px 10px;border-radius:8px;color:#888;text-decoration:none;margin-bottom:3px;font-size:12px}
.main{flex:1;margin-right:280px;padding:20px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:14px}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px}
.kpi .label{color:#888;font-size:10px} .kpi .val{font-size:18px;font-weight:800;margin:3px 0}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px}
table{width:100%;border-collapse:collapse} th{color:#666;font-size:10px;text-align:right;padding:8px;border-bottom:1px solid var(--border)} td{padding:10px 8px;border-bottom:1px solid #1a1a1a;font-size:11px}
.badge{padding:2px 6px;border-radius:8px;font-size:10px;font-weight:700} .b-active{background:rgba(37,211,102,0.15);color:var(--green)} .b-pending{background:rgba(255,193,7,0.15);color:#ffc107}
.btn{padding:5px 10px;border-radius:14px;border:none;cursor:pointer;font-weight:700;font-size:10px} .btn-g{background:var(--green);color:#000} .btn-d{background:#222;color:#fff} .btn-r{background:#ff4444;color:#fff}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99;align-items:center;justify-content:center;padding:16px} .modal.show{display:flex} .modal-box{background:#1a1a1a;border:1px solid #333;border-radius:14px;padding:16px;width:100%;max-width:380px}
.field{margin-bottom:8px} .field label{display:block;color:#888;font-size:10px;margin-bottom:3px} .field input,.field select{width:100%;padding:8px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;font-size:11px}
@media(max-width:900px){.sidebar{display:none} .main{margin-right:0}}
</style></head><body>
<div class="sidebar"><div class="brand"><div class="wb-logo" style="width:44px;height:44px;background:#25D366;border-radius:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(37,211,102,.3)"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11C7 7.5 9.5 5 13 5H16C19.5 5 22 7.5 22 11C22 14.5 19.5 17 16 17H11L8.5 19.5V17C5.5 17 3.5 14.5 3.5 11C3.5 10 3.7 9 4 8.2" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 2.5L18.7 5L21.2 6.2L18.7 7.4L17.5 9.9L16.3 7.4L13.8 6.2L16.3 5L17.5 2.5Z" fill="#FFEB3B" stroke="white" stroke-width="1" stroke-linejoin="round"/></svg></div><div><b>WSbot.me</b><div style="font-size:9px;color:#666">Admin v12 Lite</div></div></div><div class="menu"><a class="active">📊 لوحة التحكم</a><a href="/admin/logout" style="color:#ff6b6b;margin-top:16px">🚪 خروج</a></div><div class="card" style="margin-top:12px"><div style="font-size:10px;color:#888">رصيد البوت</div><div style="font-size:16px;font-weight:800;margin:3px 0">84,750 / 100k</div></div></div>
<div class="main"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h1 style="font-size:18px">لوحة تحكم الادمن - اليوزر والباس يفعل من هنا فقط</h1><div style="display:flex;gap:6px"><button class="btn btn-d" onclick="location.reload()">🔄</button><button class="btn btn-g" onclick="openM()">+ اضافة عميل</button></div></div>
<div class="kpis"><div class="kpi"><div class="label">السيرفر</div><div class="val">Online</div></div><div class="kpi"><div class="label">البوت</div><div class="val" style="color:var(--green)">Active</div></div><div class="kpi"><div class="label">العملاء</div><div class="val" id="total">0</div></div></div>
<div class="card"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px"><h3 style="font-size:12px">👥 العملاء - اليوزر والباس</h3><div style="width:200px"><input id="q" placeholder="بحث برقم الجوال..." oninput="render()" style="padding:6px 10px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;width:100%;font-size:11px"></div></div><div style="overflow:auto"><table><thead><tr><th>اليوزر</th><th>الباس</th><th>الاسم</th><th>الباقة</th><th>رصيد</th><th>واتساب</th><th>حالة</th><th>اجراء</th></tr></thead><tbody id="tb"></tbody></table></div></div></div>
<div class="modal" id="modal"><div class="modal-box"><h3 id="mt" style="font-size:13px;margin-bottom:10px">اضافة عميل</h3>
<div class="field"><label>رقم الجوال (اليوزر) *</label><input id="f_phone" placeholder="9665xxxxxxxx"></div>
<div class="field"><label>كلمة المرور (الباسورد) *</label><input id="f_pass" placeholder="123456"></div>
<div class="field"><label>اسم المتجر *</label><input id="f_name"></div>
<div class="field"><label>الباقة</label><select id="f_plan"><option value="individual">افراد 89 - 1000 محادثة - 1 موظف</option><option value="pro">احترافي 220 - 3000 محادثة - 3 موظفين</option><option value="companies">شركات 480 - 7000 محادثة - 8 موظفين</option></select></div>
<div class="field"><label>رصيد AI</label><input id="f_cred" type="number" value="1000"></div>
<div class="field"><label>تاريخ الانتهاء</label><input id="f_exp" type="date"></div>
<div class="field"><label>الحالة</label><select id="f_st"><option value="active">نشط ✅</option><option value="pending">بانتظار ⏳</option><option value="expired">منتهي ❌</option></select></div>
<input type="hidden" id="f_id"><div style="display:flex;gap:6px;margin-top:10px"><button class="btn btn-g" style="flex:1" onclick="save()">حفظ ✅</button><button class="btn btn-d" style="flex:1" onclick="closeM()">الغاء</button></div></div></div>
<script>
let users = [
  {id:1, phone:'966510015157', password:'123456', name:'ابو فهد - مالك', plan:'companies', ai_credits:7000, used_credits:1240, expiry:'2026-12-31', status:'active', whatsapp:'966510015157'},
  {id:2, phone:'966500000001', password:'112233', name:'متجر تجريبي', plan:'individual', ai_credits:1000, used_credits:340, expiry:'2026-08-19', status:'active', whatsapp:''}
];
function render(){
  const q=document.getElementById('q').value.trim();
  let list=users.filter(u=>!q||u.phone.includes(q)||u.name.includes(q));
  document.getElementById('total').innerText=users.length;
  document.getElementById('tb').innerHTML=list.map(u=>\`
    <tr><td><b style="direction:ltr;display:inline-block">\${u.phone}</b></td><td>\${u.password}</td><td>\${u.name}</td><td>\${u.plan}</td><td>\${u.ai_credits-(u.used_credits||0)} / \${u.ai_credits}</td><td>\${u.whatsapp||'-'}</td><td><span class="badge \${u.status==='active'?'b-active':'b-pending'}">\${u.status}</span></td>
      <td style="display:flex;gap:3px"><button class="btn btn-d" onclick="edit(\${u.id})">تعديل</button><button class="btn btn-g" onclick="toggle(\${u.id})">\${u.status==='active'?'ايقاف':'تفعيل'}</button><button class="btn btn-r" onclick="del(\${u.id})">حذف</button></td></tr>\`).join('');
}
function openM(id){
  document.getElementById('modal').classList.add('show');
  if(!id){document.getElementById('f_id').value=''; document.getElementById('f_phone').value=''; document.getElementById('f_pass').value=''; document.getElementById('f_name').value=''; document.getElementById('f_cred').value=1000; document.getElementById('f_exp').value=new Date(Date.now()+30*864e5).toISOString().slice(0,10); document.getElementById('f_st').value='active'; return}
  const u=users.find(x=>x.id===id); document.getElementById('f_id').value=u.id; document.getElementById('f_phone').value=u.phone; document.getElementById('f_pass').value=u.password; document.getElementById('f_name').value=u.name; document.getElementById('f_plan').value=u.plan; document.getElementById('f_cred').value=u.ai_credits; document.getElementById('f_exp').value=u.expiry; document.getElementById('f_st').value=u.status;
}
function closeM(){document.getElementById('modal').classList.remove('show')}
async function save(){
  const phone=document.getElementById('f_phone').value.trim(); const password=document.getElementById('f_pass').value.trim(); const name=document.getElementById('f_name').value.trim();
  if(!phone||!password||!name){alert('ادخل اليوزر والباس والاسم');return}
  const payload={phone,password,name,plan:document.getElementById('f_plan').value,ai_credits:+document.getElementById('f_cred').value,expiry:document.getElementById('f_exp').value,status:document.getElementById('f_st').value};
  if(document.getElementById('f_id').value) payload.id=+document.getElementById('f_id').value;
  try{ const res=await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const data=await res.json(); if(data.success){ users=data.users; render(); closeM(); } }catch(e){alert('خطأ');}
}
async function del(id){if(!confirm('حذف؟')) return; users=users.filter(x=>x.id!==id); try{ await fetch('/api/users/delete/'+id,{method:'DELETE'}); }catch(e){} render();}
function edit(id){openM(id)}
async function toggle(id){ let u=users.find(x=>x.id===id); u.status=u.status==='active'?'pending':'active'; try{ await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(u)}); }catch(e){} render();}
render();
</script></body></html>
  `);
});

app.get('/api/admin/users', (req,res)=>{ if(!isAuth(req)) return res.status(401).json({message:'غير مصرح'}); res.json({users}); });
app.delete('/api/users/delete/:id', (req,res)=>{ if(!isAuth(req)) return res.status(401).json({message:'غير مصرح'}); users = users.filter(u=>u.id!=req.params.id); res.json({success:true, users}); });
app.get('/admin.html', (req,res)=> res.redirect('/az-admin-secure-2026'));
app.get('/admin/', (req,res)=> res.redirect('/az-admin-secure-2026'));
app.get('/health', (req,res)=> res.json({status:'ok'}));

// موظف يرد - يرسل من رقم الشركة
app.post('/api/employee-reply', (req,res)=>{
  const {clientPhone, message, emp, store} = req.body;
  console.log(`[EMP REPLY] ${emp} رد على ${clientPhone}: ${message} (يظهر من رقم ${store})`);
  // هنا تربط مع واتساب API الفعلي لإرسال الرسالة من رقم الشركة
  // مثال: whatsappClient.sendMessage(clientPhone, message)
  res.json({ok:true, sentVia:'store_number', msg:message});
});

app.get('/employee-reply.html', (req,res)=>{
  res.sendFile(__dirname+'/public/employee-reply.html');
});

app.listen(PORT, ()=> console.log('wsbot.me v12 lite running on '+PORT));
