const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const ADMIN_EMAIL = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';
const ADMIN_TOKEN = 'wsbot_secure_token_2026';
let users = [
  {id:1, phone:'966510015157', password:'123456', name:'ابو فهد - مالك', plan:'companies', ai_credits:7000, used_credits:1240, expiry:'2026-12-31', status:'active', whatsapp:'966510015157', dailyClients:'100-300', employees:[{id:1,name:'احمد الدعم',phone:'966500000001',rating:4.8,chats:120}], conversations:[[{id:1,customer:'0555123456',last:'ابي استفسر',assigned:'bot',status:'open',rating:5}]]},
  {id:2, phone:'966500000001', password:'112233', name:'متجر تجريبي', plan:'individual', ai_credits:1000, used_credits:340, expiry:'2026-08-19', status:'active', whatsapp:'', employees:[], conversations:[]}
];
function isAuth(req){ const c = req.headers.cookie || ''; return c.includes('admin_token='+ADMIN_TOKEN); }
app.get('/admin.html', (req,res)=> res.redirect('/az-admin-secure-2026'));
app.get('/admin/', (req,res)=> res.redirect('/az-admin-secure-2026'));
app.get('/az-admin-secure-2026.html', (req,res)=> res.redirect('/az-admin-secure-2026'));
app.get('/health', (req,res)=> res.json({ok:true}));
app.get('/', (req,res)=>{
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WhatsBot AI - مساعد واتساب بالذكاء الاصطناعي</title><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic',sans-serif}body{background:#f8fffe;color:#111}nav{position:fixed;top:0;left:0;right:0;background:#fff;z-index:1000;padding:12px 5%;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 10px rgba(0,0,0,.05)}.logo{display:flex;align-items:center;gap:8px;font-weight:800;font-size:18px}.logo-box{width:38px;height:38px;background:#22C55E;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900}.hero{padding:140px 5% 60px;display:flex;flex-wrap:wrap;align-items:center;gap:30px;max-width:1200px;margin:0 auto}.hero-text{flex:1;min-width:300px}.hero h1{font-size:42px;line-height:1.2;margin-bottom:16px}.hero h1 span{color:#22C55E}.hero p{color:#666;font-size:16px;margin-bottom:20px;line-height:1.6}.btn{display:inline-block;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;cursor:pointer;border:none}.btn-g{background:#22C55E;color:#fff}.btn-w{background:#fff;color:#111;border:1px solid #ddd}.hero-img{flex:1;min-width:300px;text-align:center}.plans{padding:40px 5%;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;max-width:1100px;margin:0 auto}.plan{background:#fff;border:1px solid #eee;border-radius:16px;padding:24px;position:relative}.plan.pop{border:2px solid #22C55E;transform:scale(1.02)}.plan h3{font-size:20px;margin-bottom:8px}.price{font-size:28px;font-weight:800;margin:12px 0}.price small{font-size:14px;color:#666}.plan ul{list-style:none;margin:16px 0}.plan li{padding:6px 0;color:#444;font-size:14px}.plan li:before{content:'✓ ';color:#22C55E;font-weight:800}</style></head><body>
<nav><div class="logo"><div class="logo-box">WB</div> WhatsBot AI</div><div><a href="/order?plan=starter" class="btn btn-g">ابدأ الان</a></div></nav>
<div class="hero"><div class="hero-text"><h1>بوت واتساب ذكي <span>يبيع ويرد عنك 24/7</span></h1><p>حول واتساب متجرك لموظف مبيعات ذكي يفهم لهجتك ويرد على عملاءك حتى وانت نايم - مساعد واتساب بالذكاء الاصطناعي 🇸🇦</p><div><a href="/order?plan=companies" class="btn btn-g">جرب 14 يوم مجانا</a> <a href="https://wa.me/966510015157" class="btn btn-w" style="margin-right:10px">شاهد ديمو</a></div></div><div class="hero-img">🤖💬</div></div>
<div class="plans">
<div class="plan"><h3>باقة الافراد</h3><div class="price">89 <small>ريال/شهريا</small></div><ul><li>1000 محادثة AI</li><li>بوت واحد</li><li>لوحة تحكم بسيطة</li><li>دعم فني</li><li>لوحة تحكم بسيطة</li></ul><a href="/order?plan=individual" class="btn btn-g" style="width:100%;text-align:center">اطلب الباقة</a></div>
<div class="plan pop"><h3>⭐ باقة الشركات - الاكثر طلبا</h3><div class="price">250 <small>ريال/شهريا</small></div><ul><li>7000 محادثة AI</li><li>3 بوتات</li><li>تحويل للموظفين</li><li>تقييم العملاء</li><li>ربط واتساب QR</li><li>دعم اولوية</li></ul><a href="/order?plan=companies" class="btn btn-g" style="width:100%;text-align:center">اطلب الباقة - الاكثر طلبا</a></div>
<div class="plan"><h3>باقة المؤسسات</h3><div class="price">499 <small>ريال/شهريا</small></div><ul><li>محادثات غير محدودة</li><li>بوتات غير محدودة</li><li>API خاص</li><li>مدير حساب مخصص</li><li>تدريب مخصص</li><li>واتساب غير محدود</li></ul><a href="/order?plan=enterprise" class="btn btn-g" style="width:100%;text-align:center">اطلب الباقة</a></div>
</div>
</body></html>`);
});
app.get('/order', (req,res)=>{
  const plan = req.query.plan || 'companies';
  const names = {individual:'باقة الافراد - 89 ريال', companies:'باقة الشركات - 250 ريال', enterprise:'باقة المؤسسات - 499 ريال', starter:'باقة البداية'};
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>طلب باقة</title><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;font-family:'IBM Plex Sans Arabic'}body{background:#f6f8f6;padding:20px}.box{max-width:560px;margin:30px auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 10px 30px rgba(0,0,0,.06)}.logo{display:flex;align-items:center;gap:8px;font-weight:800;margin-bottom:20px}.logo-box{width:38px;height:38px;background:#22C55E;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900}.field{margin-bottom:14px}.field label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}.field input,.field textarea,.field select{width:100%;padding:11px;border:1px solid #ddd;border-radius:10px;font-size:13px}.required{color:#e53935}.type-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.type-btn{padding:10px;border:1px solid #ddd;border-radius:10px;text-align:center;cursor:pointer;font-size:12px;background:#fff}.type-btn.active{background:#22C55E;color:#fff;border-color:#22C55E}.err{color:#e53935;font-size:11px;display:none;margin-top:4px}.btn{width:100%;padding:13px;background:#22C55E;color:#fff;border:none;border-radius:10px;font-weight:800;cursor:pointer;margin-top:10px}</style></head><body>
<div class="box"><div class="logo"><div class="logo-box">WB</div> WhatsBot AI</div>
<h2 id="planName">${names[plan]||names.companies}</h2><p style="color:#666;font-size:12px;margin:6px 0 16px">عبي البيانات وبنتواصل معك خلال ساعتين</p>
<div class="field"><label>اسمك الكريم</label><input type="text" id="name" placeholder=""><div class="err" id="err-name">الاسم مطلوب</div></div>
<div class="field"><label>🏪 اسم المتجر / المؤسسة <span class="required">*</span></label><input type="text" id="storeName" placeholder="مثال: متجر فهد للجوالات / شركة الرؤية"><div class="err" id="err-store">اسم المتجر مطلوب</div></div>
<div class="field"><label>البريد الالكتروني <span class="required">*</span></label><input type="email" id="email" placeholder="example@email.com"><div class="err" id="err-email">البريد الالكتروني مطلوب والزامي</div></div>
<div class="field"><label>رقم الواتساب اللي بنتواصل معك عليه</label><div style="display:flex;gap:6px"><span style="padding:11px;background:#f5f5f5;border:1px solid #ddd;border-radius:10px;font-size:12px">+966</span><input type="text" id="whatsapp" placeholder="5xxxxxxxx" style="flex:1"></div><div class="err" id="err-whatsapp">رقم الواتساب مطلوب</div></div>
<div class="field"><label>نوع النشاط</label><div class="type-grid"><div class="type-btn" data-type="متجر الكتروني" onclick="selectType(this)">🛒 متجر الكتروني</div><div class="type-btn" data-type="مطعم / كافيه" onclick="selectType(this)">🍔 مطعم</div><div class="type-btn" data-type="عيادة / صالون" onclick="selectType(this)">💈 عيادة</div><div class="type-btn" data-type="عقار" onclick="selectType(this)">🏠 عقار</div><div class="type-btn" data-type="تعليم" onclick="selectType(this)">📚 تعليم</div><div class="type-btn" data-type="خدمات" onclick="selectType(this)">⚙️ خدمات</div></div><div class="err" id="err-type">اختر نوع النشاط</div></div>
<div class="field"><label>💬 كم عدد العملاء اللي يتواصلوا معك يوميا تقريبا؟ <span class="required">*</span></label>
<div class="type-grid" style="grid-template-columns:1fr 1fr 1fr">
<div class="type-btn" data-clients="1-20" onclick="selectClients(this)">1 - 20 عميل</div>
<div class="type-btn" data-clients="20-50" onclick="selectClients(this)">20 - 50 عميل</div>
<div class="type-btn" data-clients="50-100" onclick="selectClients(this)">50 - 100 عميل</div>
<div class="type-btn" data-clients="100-300" onclick="selectClients(this)">100 - 300 عميل</div>
<div class="type-btn" data-clients="300+" onclick="selectClients(this)" style="grid-column:1 / -1">اكثر من 300 عميل يوميا 🔥</div>
</div>
<div class="err" id="err-clients">اختر متوسط العملاء اليومي</div></div>
<div class="field"><label>وش أكثر شي متعبك في الرد على العملاء؟ (اختياري)</label><textarea id="issue" rows="3" placeholder="مثال: عملاء يسألوا نفس الاسئلة..."></textarea></div>
<button class="btn" onclick="submitOrder()">ارسل الطلب - بنكلمك خلال ساعتين 🚀</button>
<p style="text-align:center;margin-top:12px"><a href="/" style="color:#666;font-size:12px">← رجوع للرئيسية</a></p>
</div>
<script>
let selectedType=''; let selectedClients=''; let planQuery='${plan}';
function selectType(el){ const siblings=el.parentElement.querySelectorAll('.type-btn'); siblings.forEach(b=>{ if(b.dataset.type) b.classList.remove('active'); }); el.classList.add('active'); selectedType=el.dataset.type; document.getElementById('err-type').style.display='none'; }
function selectClients(el){ const siblings=el.parentElement.querySelectorAll('.type-btn'); siblings.forEach(b=>{ if(b.dataset.clients) b.classList.remove('active'); }); el.classList.add('active'); selectedClients=el.dataset.clients; document.getElementById('err-clients').style.display='none'; }
async function submitOrder(){
  const name=document.getElementById('name').value.trim();
  const email=document.getElementById('email').value.trim();
  const whatsapp=document.getElementById('whatsapp').value.trim();
  const issue=document.getElementById('issue').value.trim();
  let valid=true;
  if(!name){document.getElementById('err-name').style.display='block';valid=false;} else document.getElementById('err-name').style.display='none';
  const storeName=document.getElementById('storeName').value.trim();
  if(!storeName){document.getElementById('err-store').style.display='block';valid=false;} else document.getElementById('err-store').style.display='none';
  if(!email || !/^[^@]+@[^@]+\\.[^@]+$/.test(email)){document.getElementById('err-email').style.display='block';valid=false;} else document.getElementById('err-email').style.display='none';
  if(!whatsapp){document.getElementById('err-whatsapp').style.display='block';valid=false;} else document.getElementById('err-whatsapp').style.display='none';
  if(!selectedType){document.getElementById('err-type').style.display='block';valid=false;} else document.getElementById('err-type').style.display='none';
  if(!selectedClients){document.getElementById('err-clients').style.display='block';valid=false;} else document.getElementById('err-clients').style.display='none';
  if(!valid) return;
  try{
    const res=await fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,storeName:document.getElementById('storeName').value.trim(),email,whatsapp:'966'+whatsapp,type:selectedType,clients:selectedClients,issue,plan:planQuery,planName:document.getElementById('planName').innerText})});
    const data=await res.json();
    if(data.success){ alert('تم ارسال طلبك بنجاح! بنكلمك خلال ساعتين ✅'); window.location.href='/'; }
    else alert('حدث خطأ');
  }catch(e){ alert('تم حفظ الطلب بنجاح! بنكلمك قريباً ✅'); window.location.href='/'; }
}
</script>
</body></html>`);
});
app.post('/api/order', (req,res)=>{
  const {name,storeName,email,whatsapp,type,clients,issue,plan,planName} = req.body;
  if(!name || !storeName || !email || !whatsapp || !type || !clients) return res.status(400).json({success:false, message:'بيانات ناقصة'});
  console.log('ORDER:', {name,storeName,whatsapp,type,clients,plan});
  users.push({id:Date.now(), phone:whatsapp, password:'123456', name:storeName, plan:plan||'individual', ai_credits:plan==='companies'?7000:1000, used_credits:0, expiry:'2026-12-31', status:'pending', whatsapp, email, type, clients, issue, dailyClients:clients});
  res.json({success:true});
});
app.get('/login.html', (req,res)=>{
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دخول العملاء</title><style>body{background:#f6f8f6;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui}.box{background:#fff;padding:24px;border-radius:16px;width:360px;box-shadow:0 10px 30px rgba(0,0,0,.06)}input{width:100%;padding:11px;border:1px solid #ddd;border-radius:10px;margin:8px 0}button{width:100%;padding:12px;background:#22C55E;color:#fff;border:none;border-radius:10px;font-weight:800}</style></head><body><div class="box"><h3>دخول العملاء</h3><input id="phone" placeholder="رقم الجوال 9665..."><input id="pass" type="password" placeholder="كلمة المرور"><button onclick="login()">دخول</button><p style="font-size:11px;color:#666;margin-top:10px;text-align:center"><a href="/">← الرئيسية</a></p></div><script>async function login(){const phone=document.getElementById('phone').value;const password=document.getElementById('pass').value;const r=await fetch('/api/client/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,password})});const d=await r.json();if(d.success){localStorage.setItem('client',JSON.stringify(d.user));location.href='/client-dashboard'}else alert('بيانات خاطئة')}</script></body></html>`);
});
app.get('/client-dashboard', (req,res)=>{
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>لوحة العميل</title><style>body{background:#f6f8f6;font-family:system-ui;padding:16px}.card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,.04)}.btn{padding:8px 14px;border:none;border-radius:8px;font-weight:700;cursor:pointer}.btn-g{background:#22C55E;color:#fff}.field{margin-bottom:10px}.field input,.field select{width:100%;padding:10px;border:1px solid #ddd;border-radius:10px}</style></head><body><div id="app"></div><script>
let currentUser=null;
function load(){const s=localStorage.getItem('client');if(!s){location.href='/login.html';return}currentUser=JSON.parse(s);refreshData()}
function refreshData(){
  document.getElementById('app').innerHTML='<div class="card"><h3>مرحبا '+currentUser.name+'</h3><p>الباقة: '+currentUser.plan+' - الرصيد: '+(currentUser.ai_credits-currentUser.used_credits)+'</p><button class="btn btn-g" onclick="logout()">خروج</button></div><div class="card"><h3>⚙️ اعدادات المتجر - رقم الواتساب لتفعيل البوت</h3><div class="field"><label>🏪 اسم المتجر / المؤسسة <span style="color:#e53935">*</span></label><input id="setStoreName" placeholder="مثال: متجر فهد للجوالات"></div><div class="field"><label>📱 رقم واتساب المتجر / المؤسسة / الشركة</label><input id="setWhatsapp" placeholder="9665xxxxxxxx"></div><div class="field"><label>💬 متوسط العملاء اليومي</label><select id="setClients" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd;background:#fff;font-size:12px"><option value="1-20">1 - 20 عميل</option><option value="20-50">20 - 50 عميل</option><option value="50-100">50 - 100 عميل</option><option value="100-300">100 - 300 عميل</option><option value="300+">اكثر من 300 عميل</option></select></div><button class="btn btn-g" onclick="saveSettings()">حفظ الاعدادات ✅</button></div>';
  document.getElementById('setWhatsapp').value = currentUser.whatsapp || '';
  document.getElementById('setStoreName').value = currentUser.name || '';
  if(document.getElementById('setClients')) document.getElementById('setClients').value = currentUser.dailyClients || currentUser.clients || '20-50';
}
function saveSettings(){ const newStore=document.getElementById('setStoreName').value.trim(); if(!newStore){ alert('ادخل اسم المتجر'); return; } currentUser.whatsapp = document.getElementById('setWhatsapp').value.trim(); currentUser.name = newStore; currentUser.dailyClients = document.getElementById('setClients').value; saveClient(); alert('تم الحفظ ✅ - المتجر: ' + currentUser.name + ' - واتساب: ' + currentUser.whatsapp); }
function saveClient(){localStorage.setItem('client', JSON.stringify(currentUser))}
function logout(){localStorage.removeItem('client');location.href='/login.html'}
load();
</script></body></html>`);
});
app.post('/api/client/login', (req,res)=>{
  const {phone,password} = req.body;
  const u = users.find(x=>x.phone===phone && x.password===password);
  if(!u) return res.status(401).json({success:false});
  res.json({success:true, user:u});
});
app.get('/az-admin-secure-2026', (req,res)=>{
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin Secure</title><style>body{background:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui}.box{background:#fff;padding:24px;border-radius:16px;width:360px}input{width:100%;padding:11px;border:1px solid #ddd;border-radius:10px;margin:8px 0}button{width:100%;padding:12px;background:#22C55E;color:#fff;border:none;border-radius:10px;font-weight:800}</style></head><body><div class="box"><h3>دخول الادمن السري</h3><input id="email" placeholder="الايميل"><input id="pass" type="password" placeholder="الباسورد"><button onclick="login()">دخول</button></div><script>async function login(){const email=document.getElementById('email').value;const password=document.getElementById('pass').value;const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(d.success){document.cookie='admin_token='+d.token+';path=/';location.href='/admin'}else alert('خطأ')}</script></body></html>`);
});
app.post('/api/admin/login', (req,res)=>{
  const {email,password}=req.body;
  if(email===ADMIN_EMAIL && password===ADMIN_PASS){ res.json({success:true, token:ADMIN_TOKEN}); } else res.status(401).json({success:false});
});
app.get('/admin/logout', (req,res)=>{ res.setHeader('Set-Cookie','admin_token=; Max-Age=0; path=/'); res.redirect('/az-admin-secure-2026'); });
app.post('/api/users', (req,res)=>{ if(!isAuth(req)) return res.status(401).json({}); const u=req.body; u.id=Date.now(); users.push(u); res.json({success:true, users}); });
app.delete('/api/users/delete/:id', (req,res)=>{ if(!isAuth(req)) return res.status(401).json({message:'غير مصرح'}); users = users.filter(u=>u.id!=req.params.id); res.json({success:true, users}); });
app.get('/admin', (req,res)=>{
  if(!isAuth(req)) return res.redirect('/az-admin-secure-2026');
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin</title><style>body{background:#f6f8f6;font-family:system-ui;padding:16px}.card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px}.btn{padding:8px 14px;border:none;border-radius:8px;font-weight:700;cursor:pointer}.btn-g{background:#22C55E;color:#fff}</style></head><body><div class="card"><h3>لوحة الادمن - مرحبا ابو فهد</h3><p>عدد العملاء: \${users.length}</p><button class="btn btn-g" onclick="location.href='/admin/logout'">خروج</button> <a href="/" class="btn" style="background:#eee">الرئيسية</a></div><div class="card"><h3>العملاء</h3><div id="list"></div></div><script>async function load(){const r=await fetch('/api/admin/users');const d=await r.json();const list=document.getElementById('list');list.innerHTML=d.users.map(u=>'<div style="padding:8px;border-bottom:1px solid #eee;display:flex;justify-content:space-between"><span>🏪 '+u.name+' | 📱 '+u.phone+' | 💬 '+(u.dailyClients||u.clients||'')+' | 📦 '+u.plan+'</span><button onclick="del('+u.id+')">حذف</button></div>').join('')}async function del(id){if(!confirm('حذف؟'))return;await fetch('/api/users/delete/'+id,{method:'DELETE'});load()}load()</script></body></html>`);
});
app.get('/api/admin/users', (req,res)=>{ if(!isAuth(req)) return res.status(401).json({}); res.json({users}); });
app.listen(PORT, ()=> console.log('Running '+PORT));
