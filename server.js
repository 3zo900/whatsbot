const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const ADMIN_EMAIL = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';
const ADMIN_TOKEN = 'wsbot_secure_token_2026';
const SECRET_ADMIN_PATH = '/az-admin-secure-2026';

let users = [
  {id:1, phone:'966510015157', name:'ابو فهد - مالك', plan:'companies', ai_credits:10000, used_credits:120, expiry:'2026-12-31', status:'active'},
  {id:2, phone:'966500000001', name:'عميل تجريبي', plan:'pro', ai_credits:5000, used_credits:340, expiry:'2026-08-19', status:'pending'}
];

function isAuth(req){ const c = req.headers.cookie || ''; return c.includes('admin_token='+ADMIN_TOKEN); }

app.get('/', (req,res)=>{
 res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WhatsBot AI - مساعد واتساب بالذكاء الاصطناعي</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic','Segoe UI',sans-serif}
body{background:#f8f8f6;color:#111;overflow-x:hidden}
nav{display:flex;justify-content:space-between;align-items:center;padding:16px 5%;background:#f8f8f6;position:sticky;top:0;z-index:10}
nav .logo{font-weight:800;font-size:20px}
.nav-btn{background:#111;color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;text-decoration:none;font-weight:600}
.hero{display:flex;align-items:center;justify-content:space-between;padding:40px 5%;gap:30px;max-width:1300px;margin:0 auto}
.hero-text{flex:1.2}
.badge-top{display:inline-flex;background:#fff;border:1px solid #eee;padding:6px 12px;border-radius:20px;font-size:12px;color:#555;margin-bottom:20px}
.hero-text h1{font-size:42px;line-height:1.3;font-weight:800;margin-bottom:16px}
.hero-text h1 span{color:#1a8a4a}
.hero-desc{color:#777;font-size:15px;line-height:1.7;margin:20px 0 24px;max-width:500px}
.features-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.feat{background:#fff;border:1px solid #eee;padding:8px 14px;border-radius:20px;font-size:12px;display:flex;gap:6px}
.feat i{color:#25D366}
.hero-mock{flex:0.8}
.mock-phone{background:#fff;border:1px solid #e5e5e5;border-radius:24px;padding:12px;box-shadow:0 20px 40px rgba(0,0,0,0.08);max-width:340px;margin:auto}
.mock-header{background:#25D366;color:#fff;padding:10px 14px;border-radius:14px;font-size:13px;font-weight:700;display:flex;justify-content:space-between;margin-bottom:10px}
.mock-msg{background:#f1f5f0;padding:10px 12px;border-radius:14px;font-size:11px;line-height:1.6;margin-bottom:8px;color:#333}
.mock-msg.user{background:#e8f5e9;margin-left:20px}
.mock-input{border:1px solid #eee;border-radius:20px;padding:8px 12px;font-size:11px;color:#aaa;display:flex;justify-content:space-between;margin-top:10px}
.pricing{padding:60px 5%;background:#f8f8f6;text-align:center;max-width:1300px;margin:0 auto}
.pricing .top-btn{display:inline-block;background:#111;color:#fff;padding:10px 22px;border-radius:30px;font-size:13px;margin-bottom:24px}
.pricing h2{font-size:28px;font-weight:800;margin-bottom:40px}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;text-align:right}
@media(max-width:900px){.plans{grid-template-columns:1fr}.hero{flex-direction:column}}
.plan{border-radius:20px;padding:24px;position:relative;border:1px solid #e9e9e9;display:flex;flex-direction:column}
.plan-label{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#25D366;color:#000;font-size:11px;font-weight:700;padding:4px 12px;border-radius:12px}
.plan h3{font-size:14px;color:#888;font-weight:500;margin-bottom:8px}
.plan .price{font-size:28px;font-weight:800;margin-bottom:16px}
.plan .price span{font-size:14px;font-weight:400;color:#888}
.plan ul{list-style:none;margin:16px 0 24px;flex:1}
.plan li{font-size:13px;padding:7px 0;display:flex;gap:6px;color:#333}
.plan li::before{content:"✓";color:#25D366;font-weight:800}
.plan .btn-plan{padding:12px;border-radius:30px;border:1px solid #111;text-align:center;font-weight:700;font-size:13px;text-decoration:none;display:block}
.plan-afrad{background:#ffffff;border-color:#e5e5e5}
.plan-afrad .btn-plan{background:#fff;color:#111}
.plan-pro{background:#111111;color:#fff;border-color:#111}
.plan-pro h3{color:#aaa}.plan-pro .price{color:#fff}.plan-pro .price span{color:#aaa}.plan-pro li{color:#ddd}
.plan-pro .btn-plan{background:#25D366;color:#000;border-color:#25D366}
.plan-companies{background:#e8f5e9;border-color:#c8e6c9}
.plan-companies .btn-plan{background:#111;color:#fff;border-color:#111}
footer{text-align:center;padding:30px;color:#aaa;font-size:12px}
</style>
</head>
<body>
<nav>
  <div class="logo">WhatsBot AI 💬</div>
  <a href="/login.html" class="nav-btn">لوحة التحكم</a>
</nav>
<section class="hero">
  <div class="hero-text">
    <div class="badge-top">🇸🇦 مساعد واتساب بالذكاء الاصطناعي - لهجة سعودية</div>
    <h1>عميلك يكتب لك الساعة 3 الفجر ؟<br><span>عندك زحمة عملاء يراسلونك على</span><br><span>الواتساب وما تلحق عليهم ؟</span><br><span style="color:#111">لا تشيل هم WhatsBot يفزع لك 24/7</span></h1>
    <p class="hero-desc">يرد عليهم ويحول المحادثة الصعبة للموظفين عندك ويرسل لك تقييم رضا العميل تلقائي</p>
    <div class="features-row">
      <div class="feat"><i>✔</i> لهجة سعودية</div>
      <div class="feat"><i>✔</i> تفعيل فوري</div>
      <div class="feat"><i>✔</i> بدون رسوم تركيب</div>
    </div>
  </div>
  <div class="hero-mock">
    <div class="mock-phone">
      <div class="mock-header"><span>WhatsBot AI</span><span>●</span></div>
      <div class="mock-msg">السلام عليكم</div>
      <div class="mock-msg user">وعليكم السلام حياك الله في WhatsBot 🤖 انا المساعد الذكي</div>
      <div class="mock-msg">ابي استفسر عن اسعار الباقات</div>
      <div class="mock-msg user">اشر لي باختصار، ياخذ منك التفاصيل علشان اساعدك في اختيار الباقة</div>
      <div class="mock-input"><span>اكتب رسالة...</span><span style="background:#25D366;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center">→</span></div>
    </div>
  </div>
</section>
<section class="pricing">
  <div class="top-btn">👇 شاهد الباقات</div>
  <h2>باقات تناسب كل متجر</h2>
  <div class="plans">
    <div class="plan plan-afrad">
      <h3>أفراد / متاجر</h3>
      <div class="price">89 <span>ر.س / شهر</span></div>
      <ul>
        <li>1000 محادثة</li>
        <li>موظف واحد</li>
        <li>رد ذكي</li>
        <li>تقييم رضا العملاء ⭐</li>
      </ul>
      <a href="https://wa.me/966510015157?text=اريد باقة افراد 89" class="btn-plan">اختر الباقة</a>
    </div>
    <div class="plan plan-pro">
      <div class="plan-label">الأكثر طلباً</div>
      <h3>احترافي</h3>
      <div class="price">189 <span>ر.س / شهر</span></div>
      <ul>
        <li>3000 محادثة</li>
        <li>3 موظفين</li>
        <li>رد ذكي</li>
        <li>تقييم رضا العملاء ⭐</li>
      </ul>
      <a href="https://wa.me/966510015157?text=اريد باقة احترافي 189" class="btn-plan">اختر الباقة</a>
    </div>
    <div class="plan plan-companies">
      <h3>شركات / مؤسسات</h3>
      <div class="price">399 <span>ر.س / شهر</span></div>
      <ul>
        <li>7000 محادثة</li>
        <li>8 موظفين</li>
        <li>رد ذكي API</li>
        <li>تقييم رضا العميل ⭐</li>
      </ul>
      <a href="https://wa.me/966510015157?text=اريد باقة شركات 399" class="btn-plan">اختر الباقة</a>
    </div>
  </div>
</section>
<footer>WhatsBot AI © 2026 - wsbot.me</footer>
</body></html>
  `);
});

// دخول العملاء فقط
app.get('/login.html', (req,res)=>{
 res.send(`
<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دخول العملاء - wsbot.me</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}
body{background:#f8f8f6;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.box{background:#fff;border:1px solid #e5e5e5;border-radius:24px;padding:32px;width:100%;max-width:420px;box-shadow:0 10px 40px rgba(0,0,0,0.05)}
.logo{width:60px;height:60px;background:#25D366;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#000;margin:0 auto 16px}
h2{text-align:center;font-size:20px;margin-bottom:6px} .sub{text-align:center;color:#888;font-size:12px;margin-bottom:24px}
.field{margin-bottom:14px} .field label{color:#666;font-size:12px;display:block;margin-bottom:6px} .field input{width:100%;padding:13px;border-radius:12px;border:1px solid #ddd;background:#fff;color:#111;outline:none}
.btn{width:100%;padding:13px;border-radius:12px;border:none;background:#111;color:#fff;font-weight:800;font-size:14px;cursor:pointer;margin-top:6px}
.err{background:rgba(255,68,68,0.08);border:1px solid rgba(255,68,68,0.15);color:#e53935;padding:10px;border-radius:10px;font-size:12px;margin-bottom:12px;display:none;text-align:center}
.hint{font-size:11px;color:#aaa;text-align:center;margin-top:14px;line-height:1.6}
a{color:#111;text-decoration:none;font-size:12px}
</style></head><body>
<div class="box">
  <div class="logo">WB</div>
  <h2>دخول العملاء</h2>
  <p class="sub">ادخل رقم جوالك للوصول للوحة التحكم</p>
  <div class="err" id="err"></div>
  <div class="field"><label>رقم الجوال (اليوزر)</label><input type="text" id="phone" placeholder="9665xxxxxxxx"></div>
  <button class="btn" onclick="login()">دخول للوحة التحكم →</button>
  <div class="hint">اليوزر الخاص بك هو رقم الجوال المسجل<br><a href="https://wa.me/966510015157" style="color:#25D366">966510015157</a></div>
  <div style="text-align:center;margin-top:18px"><a href="/">← العودة للرئيسية</a></div>
</div>
<script>
function login(){
  const phone = document.getElementById('phone').value.trim();
  const err = document.getElementById('err');
  err.style.display='none';
  if(!phone){ err.innerText='ادخل رقم الجوال'; err.style.display='block'; return; }
  localStorage.setItem('ws_client_phone', phone);
  location.href = '/client?phone=' + encodeURIComponent(phone);
}
</script>
</body></html>`);
});

app.get('/client', (req,res)=>{
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>لوحة العميل - wsbot.me</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}body{background:#f8f8f6;color:#111;padding:20px}
.card{background:#fff;border:1px solid #eee;border-radius:20px;padding:24px;margin-bottom:16px;max-width:800px;margin:20px auto}
.btn{padding:10px 18px;border-radius:20px;border:none;background:#111;color:#fff;cursor:pointer;text-decoration:none;display:inline-block;font-size:12px}
.muted{color:#888;font-size:12px}
</style></head><body>
<div class="card" style="text-align:center">
  <h1>مرحبا 👋</h1>
  <p class="muted">رقمك: <b id="ph" style="direction:ltr;display:inline-block"></b></p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0">
    <div style="background:#f1f5f0;padding:16px;border-radius:14px"><div class="muted">الباقة</div><div style="font-weight:800" id="p">-</div></div>
    <div style="background:#e8f5e9;padding:16px;border-radius:14px"><div class="muted">رصيد AI</div><div style="font-weight:800" id="c">-</div></div>
    <div style="background:#fff3cd;padding:16px;border-radius:14px"><div class="muted">الانتهاء</div><div style="font-weight:800" id="e">-</div></div>
  </div>
  <a href="/login.html" class="btn">خروج</a> <a href="https://wa.me/966510015157" class="btn" style="background:#25D366;color:#000;margin-right:8px">دعم واتساب</a>
</div>
<script>
const params = new URLSearchParams(location.search);
const phone = params.get('phone') || localStorage.getItem('ws_client_phone') || '';
document.getElementById('ph').innerText = phone;
const users = JSON.parse(localStorage.getItem('wsbot_v8')||'[]');
let u = users.find(x=>x.phone===phone);
if(!u && phone==='966510015157'){ u={plan:'شركات 399', ai_credits:10000, used_credits:120, expiry:'2026-12-31'}; }
if(u){
  document.getElementById('p').innerText = u.plan;
  document.getElementById('c').innerText = (u.ai_credits - (u.used_credits||0)) + ' / ' + u.ai_credits;
  document.getElementById('e').innerText = u.expiry;
}
</script>
</body></html>`);
});

// رابط الادمن السري
app.get('/az-admin-secure-2026', (req,res)=>{
 res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Secure</title>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI}body{background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}.box{background:#141414;border:1px solid #222;border-radius:24px;padding:32px;width:100%;max-width:400px;text-align:center}.logo{width:60px;height:60px;background:#25D366;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000;margin:0 auto 16px}h2{font-size:18px;margin-bottom:4px}p{color:#666;font-size:11px;margin-bottom:20px}.field{margin-bottom:12px;text-align:right}.field label{color:#888;font-size:12px;display:block;margin-bottom:6px}.field input{width:100%;padding:12px;border-radius:10px;border:1px solid #333;background:#111;color:#fff}.btn{width:100%;padding:12px;border-radius:10px;border:none;background:#25D366;color:#000;font-weight:800;cursor:pointer;margin-top:10px}.err{background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.2);color:#ff6b6b;padding:10px;border-radius:10px;font-size:11px;margin-bottom:10px;display:none}</style></head><body>
<div class="box"><div class="logo">WB</div><h2>Admin Secure Access</h2><p>رابط سري - للمالك فقط</p><div class="err" id="err"></div>
<div class="field"><label>البريد</label><input type="email" id="email" value="az.behlal@gmail.com"></div>
<div class="field"><label>كلمة المرور</label><input type="password" id="pass"></div>
<button class="btn" onclick="login()">دخول الادمن 🔐</button></div>
<script>
async function login(){
  const email=document.getElementById('email').value.trim();
  const pass=document.getElementById('pass').value;
  const err=document.getElementById('err'); err.style.display='none';
  try{
    const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pass})});
    const data=await res.json();
    if(data.success){location.href='/admin';} else {err.innerText=data.message; err.style.display='block';}
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

app.get('/admin', (req,res)=>{
  if(!isAuth(req)) return res.redirect('/az-admin-secure-2026');
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - wsbot.me</title>
<style>
:root{--green:#25D366;--bg:#0a0a0a;--card:#141414;--border:#222}
*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI}body{background:var(--bg);color:#fff;display:flex;min-height:100vh}
.sidebar{width:280px;background:#111;border-left:1px solid var(--border);padding:20px;position:fixed;height:100vh;overflow:auto}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:30px} .brand b{font-size:18px} .brand span{color:var(--green)}
.menu a{display:block;padding:10px 12px;border-radius:10px;color:#888;text-decoration:none;margin-bottom:4px;font-size:13px} .menu a.active,.menu a:hover{background:#1c1c1c;color:#fff}
.main{flex:1;margin-right:280px;padding:24px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:18px}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px}
.kpi .label{color:#888;font-size:11px} .kpi .val{font-size:22px;font-weight:900;margin:4px 0}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:16px}
table{width:100%;border-collapse:collapse} th{color:#666;font-size:11px;text-align:right;padding:10px;border-bottom:1px solid var(--border)} td{padding:12px 10px;border-bottom:1px solid #1a1a1a;font-size:12px}
.badge{padding:3px 8px;border-radius:12px;font-size:10px;font-weight:700} .b-active{background:rgba(37,211,102,0.15);color:var(--green)} .b-pending{background:rgba(255,193,7,0.15);color:#ffc107}
.btn{padding:6px 12px;border-radius:16px;border:none;cursor:pointer;font-weight:700;font-size:11px} .btn-g{background:var(--green);color:#000} .btn-d{background:#222;color:#fff} .btn-r{background:#ff4444;color:#fff}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99;align-items:center;justify-content:center;padding:20px} .modal.show{display:flex} .modal-box{background:#1a1a1a;border:1px solid #333;border-radius:16px;padding:20px;width:100%;max-width:400px}
.field{margin-bottom:10px} .field label{display:block;color:#888;font-size:11px;margin-bottom:4px} .field input,.field select{width:100%;padding:10px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;font-size:12px}
.progress{height:5px;background:#222;border-radius:10px;overflow:hidden;margin-top:4px} .progress i{display:block;height:100%;background:var(--green)}
@media(max-width:900px){.sidebar{display:none} .main{margin-right:0}}
</style></head><body>
<div class="sidebar">
  <div class="brand"><div style="width:40px;height:40px;background:var(--green);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000">WB</div><div><b><span>W</span>Sbot.me</b><div style="font-size:10px;color:#666">Admin Secret</div></div></div>
  <div class="menu"><a class="active">📊 لوحة التحكم</a><a onclick="document.querySelector('table').scrollIntoView({behavior:'smooth'})">👥 العملاء</a><a href="/admin/logout" style="color:#ff6b6b;margin-top:20px">🚪 خروج</a></div>
  <div class="card" style="margin-top:16px"><div style="font-size:11px;color:#888">رصيد AI</div><div style="font-size:18px;font-weight:900;margin:4px 0">84,750 / 100k</div><div class="progress"><i style="width:84%"></i></div></div>
</div>
<div class="main">
  <div class="top"><h1 style="font-size:20px">لوحة تحكم wsbot.me - Secret Admin</h1><div style="display:flex;gap:8px"><button class="btn btn-d" onclick="location.reload()">🔄</button><button class="btn btn-g" onclick="openM()">+ اضافة عميل</button></div></div>
  <div class="kpis">
    <div class="kpi"><div class="label">حالة السيرفر</div><div class="val">Online</div></div>
    <div class="kpi"><div class="label">حالة البوت</div><div class="val" style="color:var(--green)">Active</div></div>
    <div class="kpi"><div class="label">رصيد البوت</div><div class="val" style="color:var(--green)">84,750</div></div>
    <div class="kpi"><div class="label">العملاء</div><div class="val" id="total">0</div></div>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:10px"><h3 style="font-size:14px">👥 الاشتراكات - اليوزر = رقم الجوال</h3><div style="width:220px"><input id="q" placeholder="ابحث برقم..." oninput="render()" style="padding:8px 12px;border-radius:10px;border:1px solid #333;background:#111;color:#fff;width:100%;font-size:12px"></div></div>
    <div style="overflow:auto"><table><thead><tr><th>اليوزر</th><th>الاسم</th><th>الباقة</th><th>رصيد AI</th><th>انتهاء</th><th>حالة</th><th>اجراءات</th></tr></thead><tbody id="tb"></tbody></table></div>
  </div>
</div>
<div class="modal" id="modal"><div class="modal-box"><h3 id="mt" style="font-size:14px;margin-bottom:12px">اضافة عميل</h3>
<div class="field"><label>رقم الجوال (اليوزر)</label><input id="f_phone"></div>
<div class="field"><label>الاسم</label><input id="f_name"></div>
<div class="field"><label>الباقة</label><select id="f_plan"><option value="individual">افراد / متاجر 89 - 1000</option><option value="pro">احترافي 189 - 3000</option><option value="companies">شركات 399 - 7000</option></select></div>
<div class="field"><label>رصيد AI</label><input id="f_cred" type="number" value="1000"></div>
<div class="field"><label>انتهاء</label><input id="f_exp" type="date"></div>
<div class="field"><label>حالة</label><select id="f_st"><option value="active">نشط</option><option value="pending">بانتظار</option><option value="expired">منتهي</option></select></div>
<input type="hidden" id="f_id"><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-g" style="flex:1" onclick="save()">حفظ</button><button class="btn btn-d" style="flex:1" onclick="closeM()">الغاء</button></div>
</div></div>
<script>
let users = JSON.parse(localStorage.getItem('wsbot_v8')||'null') || [{id:1, phone:'966510015157', name:'ابو فهد - مالك', plan:'companies', ai_credits:10000, used_credits:120, expiry:'2026-12-31', status:'active'}];
function saveLocal(){localStorage.setItem('wsbot_v8', JSON.stringify(users))}
function render(){
  const q=document.getElementById('q').value.trim();
  let list=users.filter(u=>!q||u.phone.includes(q)||u.name.includes(q));
  document.getElementById('total').innerText=users.length;
  document.getElementById('tb').innerHTML=list.map(u=>\`
    <tr>
      <td><b style="direction:ltr;display:inline-block">\${u.phone}</b></td>
      <td>\${u.name}</td>
      <td>\${u.plan==='individual'?'افراد 89':u.plan==='pro'?'احترافي 189':'شركات 399'}</td>
      <td><div>\${u.ai_credits-(u.used_credits||0)} / \${u.ai_credits}</div><div class="progress"><i style="width:\${Math.max(5,100*(u.ai_credits-(u.used_credits||0))/u.ai_credits)}%"></i></div></td>
      <td>\${u.expiry}</td>
      <td><span class="badge \${u.status==='active'?'b-active':'b-pending'}">\${u.status}</span></td>
      <td style="display:flex;gap:4px;flex-wrap:wrap">
        <button class="btn btn-d" onclick="edit(\${u.id})">تعديل</button>
        <button class="btn btn-d" onclick="addC(\${u.id})">+AI</button>
        <button class="btn \${u.status==='active'?'btn-d':'btn-g'}" onclick="tog(\${u.id})">\${u.status==='active'?'ايقاف':'تفعيل'}</button>
        <button class="btn btn-r" onclick="del(\${u.id})">حذف</button>
      </td>
    </tr>\`).join('');
}
function openM(id){
  document.getElementById('modal').classList.add('show');
  if(!id){document.getElementById('f_id').value=''; document.getElementById('f_phone').value=''; document.getElementById('f_name').value=''; document.getElementById('f_cred').value=1000; document.getElementById('f_exp').value=new Date(Date.now()+30*864e5).toISOString().slice(0,10); document.getElementById('f_st').value='pending'; return}
  const u=users.find(x=>x.id===id); document.getElementById('f_id').value=u.id; document.getElementById('f_phone').value=u.phone; document.getElementById('f_name').value=u.name; document.getElementById('f_plan').value=u.plan; document.getElementById('f_cred').value=u.ai_credits; document.getElementById('f_exp').value=u.expiry; document.getElementById('f_st').value=u.status;
}
function closeM(){document.getElementById('modal').classList.remove('show')}
function save(){
  const phone=document.getElementById('f_phone').value.trim(); const name=document.getElementById('f_name').value.trim();
  if(!phone||!name){alert('ادخل البيانات');return}
  const obj={phone,name,plan:document.getElementById('f_plan').value,ai_credits:+document.getElementById('f_cred').value,expiry:document.getElementById('f_exp').value,status:document.getElementById('f_st').value,used_credits:0};
  const id=document.getElementById('f_id').value;
  if(id){const i=users.findIndex(x=>x.id==id); obj.id=+id; obj.used_credits=users[i].used_credits||0; users[i]=obj} else {obj.id=Date.now(); users.push(obj)}
  saveLocal(); render(); closeM();
}
function edit(id){openM(id)} function del(id){if(!confirm('حذف؟')) return; users=users.filter(x=>x.id!==id); saveLocal(); render()} function tog(id){const u=users.find(x=>x.id===id); u.status=u.status==='active'?'pending':'active'; saveLocal(); render()} function addC(id){const v=prompt('كم رصيد؟'); if(!v) return; const u=users.find(x=>x.id===id); u.ai_credits+= +v; saveLocal(); render()} render();
</script></body></html>
  `);
});

app.get('/health', (req,res)=> res.json({status:'ok'}));
app.listen(PORT, ()=> console.log('wsbot.me v10 secret admin running'));
