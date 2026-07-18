const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// بيانات الدخول
const ADMIN_EMAIL = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';
const ADMIN_TOKEN = 'wsbot_secure_token_2026';

let users = [
  {id:1, phone:'966510015157', name:'ابو فهد - مالك', plan:'companies', ai_credits:10000, used_credits:120, expiry:'2026-12-31', status:'active'},
  {id:2, phone:'966500000001', name:'عميل تجريبي', plan:'pro', ai_credits:5000, used_credits:340, expiry:'2026-08-19', status:'pending'}
];

function isAuth(req){ 
  const c = req.headers.cookie || '';
  return c.includes('admin_token='+ADMIN_TOKEN); 
}

app.get('/', (req,res)=>{
 res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>wsbot.me</title>
 <style>*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI}body{background:#0a0a0a;color:#fff}nav{display:flex;justify-content:space-between;padding:18px 5%;background:#111;border-bottom:1px solid #222}.hero{padding:80px 5%;text-align:center}h1{font-size:48px}h1 span{color:#25D366}.btn{display:inline-block;padding:14px 28px;border-radius:30px;text-decoration:none;font-weight:700;margin:10px}.g{background:#25D366;color:#000}.w{background:#fff;color:#000}</style></head>
 <body><nav><div style="font-weight:900"><span style="color:#25D366">W</span>B wsbot.me</div><a href="/admin-login" style="color:#25D366">دخول الادمن</a></nav>
 <div class="hero"><h1>بوت واتساب يحول عملائك الى <span>مبيعات تلقائية</span></h1><p style="color:#888;margin:20px 0">wsbot.me شغال ✅</p><a href="/admin-login" class="btn g">دخول لوحة الادمن</a></div></body></html>`);
});

app.get('/admin-login', (req,res)=>{
 res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دخول الادمن</title>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI}body{background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}.box{background:#141414;border:1px solid #222;border-radius:24px;padding:32px;width:100%;max-width:400px;text-align:center}.logo{width:80px;height:80px;background:#25D366;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#000;margin:0 auto 20px}h2{margin-bottom:6px}p{color:#888;font-size:13px;margin-bottom:24px}.field{margin-bottom:14px;text-align:right}.field label{color:#888;font-size:13px;display:block;margin-bottom:6px}.field input{width:100%;padding:14px;border-radius:12px;border:1px solid #333;background:#111;color:#fff}.btn{width:100%;padding:14px;border-radius:12px;border:none;background:#25D366;color:#000;font-weight:800;font-size:16px;cursor:pointer;margin-top:10px}.err{background:rgba(255,68,68,0.1);border:1px solid rgba(255,68,68,0.2);color:#ff6b6b;padding:12px;border-radius:12px;font-size:13px;margin-bottom:14px;display:none}a{color:#25D366}</style></head><body>
<div class="box"><div class="logo">WB</div><h2>دخول لوحة التحكم</h2><p>wsbot.me - Admin</p><div class="err" id="err"></div>
<form onsubmit="login(event)"><div class="field"><label>البريد</label><input type="email" id="email" value="az.behlal@gmail.com" required></div><div class="field"><label>كلمة المرور</label><input type="password" id="pass" placeholder="••••••••" required></div><button class="btn" type="submit">دخول 🔐</button></form></div>
<script>
async function login(e){
  e.preventDefault();
  const email=document.getElementById('email').value.trim();
  const pass=document.getElementById('pass').value;
  const err=document.getElementById('err');
  err.style.display='none';
  try{
    const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pass})});
    const data=await res.json();
    if(data.success){location.href='/admin';}
    else{err.innerText=data.message; err.style.display='block';}
  }catch(e){err.innerText='خطأ'; err.style.display='block';}
}
</script></body></html>`);
});

app.post('/api/admin/login', (req,res)=>{
  const {email, pass} = req.body;
  if(email===ADMIN_EMAIL && pass===ADMIN_PASS){
    res.setHeader('Set-Cookie', `admin_token=${ADMIN_TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return res.json({success:true});
  }
  return res.status(401).json({success:false, message:'البريد او كلمة المرور غير صحيحة'});
});

app.get('/admin/logout', (req,res)=>{ res.setHeader('Set-Cookie','admin_token=; Path=/; Max-Age=0'); res.redirect('/admin-login'); });

app.get('/admin', (req,res)=>{
  if(!isAuth(req)) return res.redirect('/admin-login');
  res.send(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Admin - wsbot.me</title>
<style>
:root{--green:#25D366;--bg:#0a0a0a;--card:#141414;--border:#222}
*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI}body{background:var(--bg);color:#fff;display:flex;min-height:100vh}
.sidebar{width:280px;background:#111;border-left:1px solid var(--border);padding:20px;position:fixed;height:100vh;overflow:auto}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:30px} .brand b{font-size:20px} .brand span{color:var(--green)}
.menu a{display:block;padding:12px 14px;border-radius:12px;color:#888;text-decoration:none;margin-bottom:6px} .menu a.active,.menu a:hover{background:#1c1c1c;color:#fff}
.main{flex:1;margin-right:280px;padding:28px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:22px}
.kpi{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:18px}
.kpi .label{color:#888;font-size:13px} .kpi .val{font-size:28px;font-weight:900;margin:6px 0} .kpi.green{border-color:rgba(37,211,102,0.3);background:linear-gradient(135deg,#141414,#132616)}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-left:6px} .online{background:var(--green)}
.card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:20px;margin-bottom:18px}
table{width:100%;border-collapse:collapse} th{color:#666;font-size:12px;text-align:right;padding:12px;border-bottom:1px solid var(--border)} td{padding:14px 12px;border-bottom:1px solid #1a1a1a;font-size:14px}
.badge{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700} .b-active{background:rgba(37,211,102,0.15);color:var(--green)} .b-pending{background:rgba(255,193,7,0.15);color:#ffc107} .b-exp{background:rgba(255,68,68,0.15);color:#ff4444}
.btn{padding:8px 14px;border-radius:20px;border:none;cursor:pointer;font-weight:700;font-size:12px} .btn-g{background:var(--green);color:#000} .btn-w{background:#fff;color:#000} .btn-d{background:#222;color:#fff} .btn-r{background:#ff4444;color:#fff}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99;align-items:center;justify-content:center;padding:20px} .modal.show{display:flex} .modal-box{background:#1a1a1a;border:1px solid #333;border-radius:20px;padding:24px;width:100%;max-width:440px}
.field{margin-bottom:12px} .field label{display:block;color:#888;font-size:13px;margin-bottom:6px} .field input,.field select{width:100%;padding:12px;border-radius:12px;border:1px solid #333;background:#111;color:#fff}
.progress{height:6px;background:#222;border-radius:10px;overflow:hidden;margin-top:6px} .progress i{display:block;height:100%;background:var(--green)}
@media(max-width:900px){.sidebar{display:none} .main{margin-right:0}}
</style></head><body>
<div class="sidebar">
  <div class="brand"><div style="width:48px;height:48px;background:var(--green);border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#000">WB</div><div><b><span>W</span>Sbot.me</b><div style="font-size:11px;color:#666">Admin v7</div></div></div>
  <div class="menu"><a class="active">📊 لوحة التحكم</a><a onclick="document.querySelector('table').scrollIntoView({behavior:'smooth'})">👥 العملاء</a><a href="/admin/logout" style="color:#ff6b6b;margin-top:20px">🚪 خروج</a></div>
  <div class="card" style="margin-top:20px"><div style="font-size:12px;color:#888">رصيد AI</div><div style="font-size:22px;font-weight:900;margin:6px 0">84,750 <span style="font-size:12px;color:#888">/ 100k</span></div><div class="progress"><i style="width:84%"></i></div><div style="font-size:11px;color:#666;margin-top:8px">az.behlal@gmail.com</div></div>
</div>
<div class="main">
  <div class="top"><div><h1>لوحة تحكم wsbot.me</h1><p style="color:#888;font-size:13px">مرحبا ابو فهد 👋</p></div><div style="display:flex;gap:10px"><button class="btn btn-w" onclick="location.reload()">🔄</button><button class="btn btn-g" onclick="openM()">+ اضافة عميل</button></div></div>
  <div class="kpis">
    <div class="kpi green"><div class="label"><span class="dot online"></span>حالة السيرفر</div><div class="val">Online</div><div style="font-size:12px;color:#888">whatsbot-4vkk.onrender.com</div></div>
    <div class="kpi green"><div class="label"><span class="dot online"></span>حالة البوت</div><div class="val">Active</div></div>
    <div class="kpi"><div class="label">رصيد البوت</div><div class="val" style="color:var(--green)">84,750</div></div>
    <div class="kpi"><div class="label">العملاء</div><div class="val" id="total">0</div><div style="font-size:12px;color:#888">اليوزر = رقم الجوال</div></div>
  </div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px"><h3>👥 الاشتراكات</h3><div style="width:260px"><input id="q" placeholder="ابحث برقم الجوال..." oninput="render()" style="padding:12px;border-radius:12px;border:1px solid #333;background:#111;color:#fff;width:100%"></div></div>
    <div style="overflow:auto"><table><thead><tr><th>اليوزر (جوال)</th><th>الاسم</th><th>الباقة</th><th>رصيد AI</th><th>انتهاء</th><th>حالة</th><th>اجراءات</th></tr></thead><tbody id="tb"></tbody></table></div>
  </div>
</div>
<div class="modal" id="modal"><div class="modal-box"><h3 id="mt">اضافة عميل</h3>
<div class="field"><label>رقم الجوال (اليوزر)</label><input id="f_phone" placeholder="9665xxxxxxxx"></div>
<div class="field"><label>الاسم</label><input id="f_name"></div>
<div class="field"><label>الباقة</label><select id="f_plan"><option value="individual">افراد 109</option><option value="pro">احترافي 199</option><option value="companies">شركات 399</option></select></div>
<div class="field"><label>رصيد AI</label><input id="f_cred" type="number" value="1000"></div>
<div class="field"><label>انتهاء</label><input id="f_exp" type="date"></div>
<div class="field"><label>حالة</label><select id="f_st"><option value="active">نشط</option><option value="pending">بانتظار</option><option value="expired">منتهي</option></select></div>
<input type="hidden" id="f_id"><div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-g" style="flex:1" onclick="save()">حفظ ✅</button><button class="btn btn-d" style="flex:1" onclick="closeM()">الغاء</button></div>
</div></div>
<script>
let users = JSON.parse(localStorage.getItem('wsbot_v7')||'null') || [{id:1, phone:'966510015157', name:'ابو فهد - مالك', plan:'companies', ai_credits:10000, used_credits:120, expiry:'2026-12-31', status:'active'},{id:2, phone:'966500000001', name:'عميل تجريبي', plan:'pro', ai_credits:5000, used_credits:340, expiry:'2026-08-19', status:'pending'}];
function saveLocal(){localStorage.setItem('wsbot_v7', JSON.stringify(users))}
function render(){
  const q=document.getElementById('q').value.trim();
  let list=users.filter(u=>!q||u.phone.includes(q)||u.name.includes(q));
  document.getElementById('total').innerText=users.length;
  document.getElementById('tb').innerHTML=list.map(u=>\`
    <tr>
      <td><b style="direction:ltr;display:inline-block">\${u.phone}</b></td>
      <td>\${u.name}</td>
      <td>\${u.plan==='individual'?'افراد 109':u.plan==='pro'?'احترافي 199':'شركات 399'}</td>
      <td><div>\${u.ai_credits-(u.used_credits||0)} / \${u.ai_credits}</div><div class="progress"><i style="width:\${Math.max(5,100*(u.ai_credits-(u.used_credits||0))/u.ai_credits)}%"></i></div></td>
      <td>\${u.expiry}</td>
      <td><span class="badge \${u.status==='active'?'b-active':u.status==='pending'?'b-pending':'b-exp'}">\${u.status==='active'?'نشط':u.status==='pending'?'بانتظار':'منتهي'}</span></td>
      <td style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="btn btn-d" onclick="edit(\${u.id})">تعديل</button>
        <button class="btn btn-d" onclick="addC(\${u.id})">+AI</button>
        <button class="btn \${u.status==='active'?'btn-d':'btn-g'}" onclick="tog(\${u.id})">\${u.status==='active'?'ايقاف':'تفعيل'}</button>
        <button class="btn btn-r" onclick="del(\${u.id})">حذف</button>
      </td>
    </tr>\`).join('')||'<tr><td colspan=7 style="text-align:center;color:#666">لا يوجد</td></tr>';
}
function openM(id){
  document.getElementById('modal').classList.add('show');
  if(!id){document.getElementById('mt').innerText='اضافة عميل'; document.getElementById('f_id').value=''; document.getElementById('f_phone').value=''; document.getElementById('f_name').value=''; document.getElementById('f_cred').value=1000; document.getElementById('f_exp').value=new Date(Date.now()+30*864e5).toISOString().slice(0,10); document.getElementById('f_st').value='pending'; return}
  const u=users.find(x=>x.id===id); document.getElementById('mt').innerText='تعديل'; document.getElementById('f_id').value=u.id; document.getElementById('f_phone').value=u.phone; document.getElementById('f_name').value=u.name; document.getElementById('f_plan').value=u.plan; document.getElementById('f_cred').value=u.ai_credits; document.getElementById('f_exp').value=u.expiry; document.getElementById('f_st').value=u.status;
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
function edit(id){openM(id)}
function del(id){if(!confirm('حذف؟')) return; users=users.filter(x=>x.id!==id); saveLocal(); render()}
function tog(id){const u=users.find(x=>x.id===id); u.status=u.status==='active'?'pending':'active'; saveLocal(); render()}
function addC(id){const v=prompt('كم رصيد؟'); if(!v) return; const u=users.find(x=>x.id===id); u.ai_credits+= +v; saveLocal(); render()}
render();
</script></body></html>
  `);
});

app.get('/health', (req,res)=> res.json({status:'ok'}));
app.listen(PORT, ()=> console.log('wsbot.me v7 running'));
