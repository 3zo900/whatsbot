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
<nav><div class="nav-logo"><div class="logo-box">WB</div><span>WhatsBot AI</span></div><a href="/login.html" class="nav-btn">لوحة التحكم</a></nav>
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
<div class="mock-typing" id="typing"><span></span><span></span></div>
</div>
<div class="mock-input"><span>اكتب رسالة...</span><span style="background:#25D366;color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center">→</span></div></div></div>
</section>
<section class="pricing"><div class="top-btn">👇 شاهد الباقات</div><h2>باقات تناسب كل متجر</h2>
<div class="plans">
<div class="plan plan-afrad"><h3>أفراد / متاجر</h3><div class="price">89 <span>ر.س / شهر</span></div><ul><li>1000 محادثة</li><li>موظف واحد</li><li>رد ذكي</li><li>تقييم رضا العملاء ⭐</li></ul><a href="/order?plan=individual" class="btn-plan">اختر الباقة</a></div>
<div class="plan plan-pro"><div class="plan-label">الأكثر طلباً</div><h3>احترافي</h3><div class="price">189 <span>ر.س / شهر</span></div><ul><li>3000 محادثة</li><li>3 موظفين</li><li>رد ذكي</li><li>تقييم رضا العملاء ⭐</li></ul><a href="/order?plan=pro" class="btn-plan">اختر الباقة</a></div>
<div class="plan plan-companies"><h3>شركات / مؤسسات</h3><div class="price">399 <span>ر.س / شهر</span></div><ul><li>7000 محادثة</li><li>8 موظفين</li><li>رد ذكي API</li><li>تقييم رضا العميل ⭐</li></ul><a href="/order?plan=companies" class="btn-plan">اختر الباقة</a></div>
</div></section>
<footer>WhatsBot AI © 2026 - wsbot.me</footer>
<script>
function restartChat(){
  const body = document.getElementById('mockBody');
  if(!body) return;
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
  const plan = req.query.plan || 'pro';
  let planName='احترافي - الأكثر طلباً';
  let planPrice='189 ر.س / شهر';
  if(plan==='individual'){ planName='أفراد / متاجر'; planPrice='89 ر.س / شهر'; }
  else if(plan==='companies'){ planName='شركات / مؤسسات'; planPrice='399 ر.س / شهر'; }
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>طلب باقة</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}
body{background:#0f281e;min-height:100vh;padding:20px;color:#fff}
.header{text-align:center;padding:20px 0 30px}
.header h1{font-size:32px;font-weight:800;line-height:1.4}
.header h1 span.orange{color:#ff8c42}
.header h1 span.yellow{color:#ffcc4d}
.header p{color:#8aa89a;font-size:14px;margin-top:12px;line-height:1.7;max-width:400px;margin:0 auto}
.form-card{background:#fff;border-radius:24px;padding:24px;max-width:500px;margin:0 auto}
.plan-badge{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.plan-badge .right{font-weight:800;color:#111;font-size:15px}
.plan-badge .left{background:#e8f5e9;color:#1a8a4a;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700}
.field{margin-bottom:18px}
.field label{color:#111;font-weight:700;font-size:14px;display:block;margin-bottom:8px;text-align:right}
.field input,.field textarea{width:100%;padding:14px 16px;border-radius:14px;border:1px solid #e5e0d5;background:#f9f5ec;color:#111;font-size:13px;outline:none}
.field textarea{min-height:90px;resize:none}
.row2{display:flex;gap:10px} .row2 .col{flex:1} .row2 .country{background:#f9f5ec;border:1px solid #e5e0d5;border-radius:14px;padding:14px 12px;display:flex;align-items:center;gap:6px;font-size:13px;color:#111;font-weight:600}
.type-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px}
.type-btn{padding:14px;background:#f9f5ec;border:1px solid #e5e0d5;border-radius:14px;text-align:center;font-size:13px;font-weight:600;color:#333;cursor:pointer}
.type-btn.active{background:#111;color:#fff;border-color:#111}
.btn-submit{width:100%;background:#111;color:#fff;padding:16px;border-radius:30px;border:none;font-weight:800;font-size:15px;cursor:pointer;margin-top:20px}
.err{color:#c62828;font-size:11px;margin-top:6px;display:none}
.footer{text-align:center;color:#5a7a6a;font-size:11px;margin-top:20px}
.required{color:#e53935}
</style></head><body>
<div class="header">
<h1><span class="orange">جاهز</span> تخلي عملاءك <span class="orange">يلاقوا رد</span><br><span class="yellow">فوري؟</span></h1>
<p>عبّ بياناتك تحت وبنكلمك خلال ساعتين على الواتساب<br>عشان نفعل لك الحساب، الاستشارة مجانية</p>
</div>
<div class="form-card">
<div class="plan-badge"><div class="right" id="planName">${planName}</div><div class="left" id="planPrice">${planPrice}</div></div>
<div class="field"><label>اسمك الكريم</label><input type="text" id="name" placeholder=""><div class="err" id="err-name">الاسم مطلوب</div></div>
<div class="field"><label>البريد الالكتروني <span class="required">*</span></label><input type="email" id="email" placeholder="example@email.com"><div class="err" id="err-email">البريد الالكتروني مطلوب والزامي</div></div>
<div class="field"><label>رقم الواتساب اللي بنتواصل معك عليه</label>
<div class="row2"><div class="country">🇸🇦 السعودية +966</div><div class="col"><input type="tel" id="whatsapp" placeholder="5XXXXXXXX"></div></div>
<div class="err" id="err-whatsapp">رقم الواتساب مطلوب</div></div>
<div class="field"><label>وش نوع نشاطك؟</label>
<div class="type-grid">
<div class="type-btn" data-type="محل / متجر" onclick="selectType(this)">محل / متجر</div>
<div class="type-btn" data-type="عيادة / مركز طبي" onclick="selectType(this)">عيادة / مركز طبي</div>
<div class="type-btn" data-type="مكتب عقاري" onclick="selectType(this)">مكتب عقاري</div>
<div class="type-btn" data-type="مطعم / كافيه" onclick="selectType(this)">مطعم / كافيه</div>
<div class="type-btn" style="grid-column:1 / -1" data-type="خدمات أخرى" onclick="selectType(this)">خدمات أخرى</div>
</div>
<div class="err" id="err-type">اختر نوع النشاط</div></div>
<div class="field"><label>وش أكثر شي متعبك في الرد على العملاء؟ (اختياري)</label><textarea id="issue" placeholder="مثال: ما ألحق أرد على كل العملاء..."></textarea></div>
<button class="btn-submit" onclick="submitOrder()">✅ إرسال الطلب - بنكلمك واتساب</button>
<div class="footer">WhatsBot.sa 2026 ©</div>
</div>
<script>
let selectedType=''; let planQuery='${plan}';
function selectType(el){ document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('active')); el.classList.add('active'); selectedType=el.dataset.type; document.getElementById('err-type').style.display='none'; }
async function submitOrder(){
  const name=document.getElementById('name').value.trim();
  const email=document.getElementById('email').value.trim();
  const whatsapp=document.getElementById('whatsapp').value.trim();
  const issue=document.getElementById('issue').value.trim();
  let valid=true;
  if(!name){document.getElementById('err-name').style.display='block';valid=false;} else document.getElementById('err-name').style.display='none';
  if(!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)){document.getElementById('err-email').style.display='block';valid=false;} else document.getElementById('err-email').style.display='none';
  if(!whatsapp){document.getElementById('err-whatsapp').style.display='block';valid=false;} else document.getElementById('err-whatsapp').style.display='none';
  if(!selectedType){document.getElementById('err-type').style.display='block';valid=false;} else document.getElementById('err-type').style.display='none';
  if(!valid) return;
  const btn=document.querySelector('.btn-submit'); btn.innerText='⏳ جاري الإرسال...'; btn.disabled=true;
  try{
    const res=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,whatsapp:'966'+whatsapp,type:selectedType,issue,plan:planQuery,planName:document.getElementById('planName').innerText})});
    const data=await res.json();
    if(data.success){ alert('تم ارسال طلبك بنجاح!'); window.location.href='https://wa.me/966510015157?text=طلبت باقة '+encodeURIComponent(document.getElementById('planName').innerText); }
  }catch(e){ alert('تم حفظ الطلب'); window.location.href='https://wa.me/966510015157'; }
}
</script>
</body></html>
  `);
});
app.post('/api/order', (req,res)=>{
  const {name,email,whatsapp,type,issue,plan,planName} = req.body;
  if(!name || !email || !whatsapp || !type) return res.status(400).json({success:false});
  console.log('NEW ORDER:',req.body);
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
<div class="box"><div class="logo-box">WB</div><h2>دخول العملاء</h2><p class="sub">WhatsBot AI</p><div class="err" id="err"></div>
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
tyle.display='block'; }
function openEmpModal(){ const limit = getPlanLimit(currentUser.plan); if((currentUser.employees||[]).length >= limit){ alert('وصلت للحد المسموح ('+limit+' موظفين)'); return; } document.getElementById('empModal').classList.add('show'); }
function closeEmpModal(){ document.getElementById('empModal').classList.remove('show'); }
function addEmployee(){ const name = document.getElementById('empName').value.trim(); const phone = document.getElementById('empPhone').value.trim(); if(!name ||!phone){ alert('ادخل الاسم ورقم الجوال'); return; } const limit = getPlanLimit(currentUser.plan); if((currentUser.employees||[]).length >= limit){ alert('الحد '+limit); return; } currentUser.employees = currentUser.employees || []; currentUser.employees.push({id:Date.now(), name, phone, rating:4.5, chats:0}); saveClient(); closeEmpModal(); document.getElementById('empName').value=''; document.getElementById('empPhone').value=''; }
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
<div class="box"><div class="logo-box">WB</div><h2>Admin Secure</h2><p>رابط سري للمالك فقط</p><div class="err" id="err"></div>
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
.brand{display:flex;align-items:center;gap:10px;margin-bottom:20px}.brand.logo-box{width:36px;height:36px;background:var(--green);color:#000;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900}
.menu a{display:block;padding:9px 10px;border-radius:8px;color:#888;text-decoration:none;margin-bottom:3px;font-size:12px}
.main{flex:1;margin-right:280px;padding:20px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:14px}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px}
.kpi.label{color:#888;font-size:10px}.kpi.val{font-size:18px;font-weight:800;margin:3px 0}
.card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:12px}
table{width:100%;border-collapse:collapse} th{color:#666;font-size:10px;text-align:right;padding:8px;border-bottom:1px solid var(--border)} td{padding:10px 8px;border-bottom:1px solid #1a1a1a;font-size:11px}
.badge{padding:2px 6px;border-radius:8px;font-size:10px;font-weight:700}.b-active{background:rgba(37,211,102,0.15);color:var(--green)}.b-pending{background:rgba(255,193,7,0.15);color:#ffc107}
.btn{padding:5px 10px;border-radius:14px;border:none;cursor:pointer;font-weight:700;font-size:10px}.btn-g{background:var(--green);color:#000}.btn-d{background:#222;color:#fff}.btn-r{background:#ff4444;color:#fff}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99;align-items:center;justify-content:center;padding:16px}.modal.show{display:flex}.modal-box{background:#1a1a1a;border:1px solid #333;border-radius:14px;padding:16px;width:100%;max-width:380px}
.field{margin-bottom:8px}.field label{display:block;color:#888;font-size:10px;margin-bottom:3px}.field input,.field select{width:100%;padding:8px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;font-size:11px}
@media(max-width:900px){.sidebar{display:none}.main{margin-right:0}}
</style></head><body>
<div class="sidebar"><div class="brand"><div class="logo-box">WB</div><div><b>WSbot.me</b><div style="font-size:9px;color:#666">Admin v13 - Orders</div></div></div><div class="menu"><a class="active">📊 لوحة التحكم</a><a href="/admin/logout" style="color:#ff6b6b;margin-top:16px">🚪 خروج</a></div><div class="card" style="margin-top:12px"><div style="font-size:10px;color:#888">رصيد البوت</div><div style="font-size:16px;font-weight:800;margin:3px 0">84,750 / 100k</div></div></div>
<div class="main"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h1 style="font-size:18px">لوحة تحكم الادمن</h1><div style="display:flex;gap:6px"><button class="btn btn-d" onclick="location.reload()">🔄</button><button class="btn btn-g" onclick="openM()">+ اضافة عميل</button></div></div>
<div class="kpis"><div class="kpi"><div class="label">السيرفر</div><div class="val">Online</div></div><div class="kpi"><div class="label">البوت</div><div class="val" style="color:var(--green)">Active</div></div><div class="kpi"><div class="label">العملاء</div><div class="val" id="total">0</div></div></div>
<div class="card"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px"><h3 style="font-size:12px">👥 العملاء</h3><div style="width:200px"><input id="q" placeholder="بحث برقم الجوال..." oninput="render()" style="padding:6px 10px;border-radius:8px;border:1px solid #333;background:#111;color:#fff;width:100%;font-size:11px"></div></div><div style="overflow:auto"><table><thead><tr><th>اليوزر</th><th>الباس</th><th>الاسم</th><th>الباقة</th><th>رصيد</th><th>واتساب</th><th>حالة</th><th>اجراء</th></tr></thead><tbody id="tb"></tbody></table></div></div></div>
<div class="modal" id="modal"><div class="modal-box"><h3 id="mt" style="font-size:13px;margin-bottom:10px">اضافة عميل</h3>
<div class="field"><label>رقم الجوال (اليوزر) *</label><input id="f_phone" placeholder="9665xxxxxxxx"></div>
<div class="field"><label>كلمة المرور (الباسورد) *</label><input id="f_pass" placeholder="123456"></div>
<div class="field"><label>اسم المتجر *</label><input id="f_name"></div>
<div class="field"><label>الباقة</label><select id="f_plan"><option value="individual">افراد 89 - 1000 محادثة - 1 موظف</option><option value="pro">احترافي 189 - 3000 محادثة - 3 موظفين</option><option value="companies">شركات 399 - 7000 محادثة - 8 موظفين</option></select></div>
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
app.get('/health', (req,res)=> res.json({status:'ok'}));
app.listen(PORT, ()=> console.log('wsbot.me V13 with order and admin fixed running on '+PORT));
