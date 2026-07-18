const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DOMAIN = 'https://wsbot.me';
const SUPPORT_NUMBER = process.env.SUPPORT_NUMBER || '966510015157';

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WhatsBot - wsbot.me</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,sans-serif}
body{background:#0a0a0a;color:#fff;min-height:100vh}
nav{display:flex;justify-content:space-between;align-items:center;padding:20px 5%;background:rgba(255,255,255,0.05);position:sticky;top:0}
.logo{font-weight:900;font-size:24px} .logo span{color:#25D366}
.hero{padding:80px 5%;text-align:center;max-width:900px;margin:auto}
.hero h1{font-size:52px;margin-bottom:20px} .hero h1 span{color:#25D366}
.hero p{font-size:20px;color:#aaa;margin-bottom:40px}
.btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn{padding:16px 32px;border-radius:50px;font-weight:700;text-decoration:none;display:inline-block}
.btn-green{background:#25D366;color:#000} .btn-white{background:#fff;color:#000}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;padding:40px 5%}
.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px}
.card h3{color:#25D366;margin-bottom:12px} .card p{color:#aaa}
.pricing{padding:60px 5%;text-align:center} .pricing h2{font-size:36px;margin-bottom:40px}
.plans{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}
.plan{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:30px;min-width:280px;max-width:340px}
.plan.featured{border-color:#25D366;transform:scale(1.05)}
.plan .price{font-size:36px;font-weight:900;margin:16px 0} .plan .price span{font-size:16px;color:#aaa}
.plan ul{list-style:none;text-align:right;margin:20px 0} .plan li{padding:8px 0;color:#ccc} .plan li::before{content:"✓ ";color:#25D366}
footer{padding:40px 5%;text-align:center;color:#666;border-top:1px solid rgba(255,255,255,0.1);margin-top:40px} a{color:#25D366}
</style>
</head>
<body>
<nav><div class="logo">💬 <span>W</span>Sbot.me</div><div>wsbot.me</div></nav>
<section class="hero">
  <h1>بوت واتساب يحول عملائك الى <span>مبيعات تلقائية</span></h1>
  <p>WhatsBot نظام ذكي للرد التلقائي وتحويل المحادثات على واتساب</p>
  <div class="btns">
    <a href="https://wa.me/${SUPPORT_NUMBER}?text=مرحبا اريد الاشتراك" class="btn btn-green">ابدأ الآن - واتساب</a>
    <a href="#pricing" class="btn btn-white">شاهد الباقات</a>
  </div>
  <p style="margin-top:20px;font-size:14px;color:#555">شغال على ${DOMAIN}</p>
</section>
<section class="features">
  <div class="card"><h3>🤖 رد تلقائي ذكي</h3><p>يرد على العملاء 24/7</p></div>
  <div class="card"><h3>👥 تحويل للموظفين</h3><p>يحول المحادثة للموظف المناسب</p></div>
  <div class="card"><h3>📊 لوحة تحكم</h3><p>تابع كل المحادثات من مكان واحد</p></div>
</section>
<section id="pricing" class="pricing">
  <h2>باقات WhatsBot</h2>
  <div class="plans">
    <div class="plan"><h3>أفراد</h3><div class="price">109 <span>ريال/شهر</span></div><ul><li>رقم واحد</li><li>1000 محادثة</li><li>رد تلقائي</li></ul><a href="https://wa.me/${SUPPORT_NUMBER}?text=باقة 109" class="btn btn-white" style="width:100%;text-align:center;margin-top:10px">اشترك</a></div>
    <div class="plan featured"><h3>احترافي 🔥</h3><div class="price">199 <span>ريال/شهر</span></div><ul><li>3 أرقام</li><li>5000 محادثة</li><li>تحويل تلقائي</li></ul><a href="https://wa.me/${SUPPORT_NUMBER}?text=باقة 199" class="btn btn-green" style="width:100%;text-align:center;margin-top:10px">الأكثر طلباً</a></div>
    <div class="plan"><h3>شركات</h3><div class="price">399 <span>ريال/شهر</span></div><ul><li>أرقام غير محدودة</li><li>API كامل</li></ul><a href="https://wa.me/${SUPPORT_NUMBER}?text=باقة 399" class="btn btn-white" style="width:100%;text-align:center;margin-top:10px">للشركات</a></div>
  </div>
</section>
<footer><p>© 2026 WhatsBot - wsbot.me | ${SUPPORT_NUMBER}</p><p style="font-size:12px;margin-top:8px">بدون تحويل بنكي - الاشتراك عبر واتساب فقط</p></footer>
</body></html>
  `);
});

app.get('/admin', (req,res)=>{
 res.send(`
<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin - wsbot.me</title>
<style>*{box-sizing:border-box;font-family:Segoe UI} body{margin:0;background:#0f0f0f;color:#fff;display:flex;min-height:100vh}
.sidebar{width:260px;background:#111;border-left:1px solid #222;padding:20px} .sidebar h2{color:#25D366}
.sidebar a{display:block;padding:12px;color:#aaa;text-decoration:none;border-radius:10px;margin-bottom:6px} .sidebar a.active,.sidebar a:hover{background:#1a1a1a;color:#fff}
.main{flex:1;padding:30px} .card{background:#1a1a1a;border:1px solid #222;border-radius:16px;padding:20px;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px} .kpi{font-size:32px;font-weight:900} .muted{color:#888;font-size:13px}</style></head><body>
<div class="sidebar"><h2>wsbot.me</h2><a class="active">📊 لوحة التحكم</a><a>💬 المحادثات</a><a>👥 العملاء</a><a>💳 الاشتراكات</a>
<div style="margin-top:40px;font-size:12px;color:#555">Domain: wsbot.me<br>Version 5.0 - بدون بنك</div></div>
<div class="main"><h1>لوحة التحكم - wsbot.me</h1><br>
<div class="grid"><div class="card"><div class="muted">محادثات اليوم</div><div class="kpi">0</div></div>
<div class="card"><div class="muted">عملاء نشطين</div><div class="kpi">0</div></div>
<div class="card"><div class="muted">حالة السيرفر</div><div class="kpi" style="color:#25D366">Online</div></div></div>
<div class="card"><h3>✅ تم حذف صفحة البنك</h3><p>الاشتراك الآن عبر واتساب فقط على ${SUPPORT_NUMBER}</p><p>الدومين الجديد: ${DOMAIN}</p></div>
<div class="card"><p>الموقع: <a href="/" style="color:#25D366">${DOMAIN}</a> | فحص: <a href="/health" style="color:#25D366">/health</a></p></div></div></body></html>`);
});

app.get('/health', (req,res)=> res.json({status:'ok', domain:'wsbot.me'}));

app.listen(PORT, ()=> console.log('WhatsBot wsbot.me running on', PORT));
