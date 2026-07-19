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
<title>WhatsBot - wsbot.me | بوت واتساب احترافي</title>
<meta name="description" content="WhatsBot - نظام واتساب بوت احترافي لخدمة العملاء والرد التلقائي">
<link rel="icon" href="/logo.png">
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,sans-serif}
body{background:#0a0a0a;color:#fff;min-height:100vh}
nav{display:flex;justify-content:space-between;align-items:center;padding:20px 5%;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);position:sticky;top:0;z-index:10}
.logo{display:flex;align-items:center;gap:12px;font-weight:900;font-size:24px}
.logo span{color:#25D366}
.hero{padding:80px 5%;text-align:center;max-width:900px;margin:auto}
.hero h1{font-size:52px;line-height:1.2;margin-bottom:20px}
.hero h1 span{color:#25D366}
.hero p{font-size:20px;color:#aaa;margin-bottom:40px;line-height:1.6}
.btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn{padding:16px 32px;border-radius:50px;font-weight:700;text-decoration:none;display:inline-block;transition:0.3s}
.btn-green{background:#25D366;color:#000}
.btn-white{background:#fff;color:#000}
.btn:hover{transform:translateY(-3px)}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;padding:40px 5%}
.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:30px}
.card h3{margin-bottom:12px;color:#25D366}
.card p{color:#aaa;line-height:1.6}
.pricing{padding:60px 5%;text-align:center}
.pricing h2{font-size:36px;margin-bottom:40px}
.plans{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}
.plan{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:30px;min-width:280px;flex:1;max-width:340px}
.plan.featured{border-color:#25D366;transform:scale(1.05)}
.plan h3{font-size:22px;margin-bottom:10px}
.plan .price{font-size:36px;font-weight:900;margin:16px 0}
.plan .price span{font-size:16px;color:#aaa}
.plan ul{list-style:none;text-align:right;margin:20px 0}
.plan li{padding:8px 0;color:#ccc}
.plan li::before{content:"✓ ";color:#25D366;font-weight:bold}
footer{padding:40px 5%;text-align:center;color:#666;border-top:1px solid rgba(255,255,255,0.1);margin-top:40px}
a{color:#25D366}
</style>
</head>
<body>
<nav>
  <div class="logo">💬 <span>W</span>Sbot.me</div>
  <div>wsbot.me</div>
</nav>
<section class="hero">
  <h1>بوت واتساب يحول عملائك الى <span>مبيعات تلقائية</span></h1>
  <p>WhatsBot نظام ذكي للرد التلقائي، تحويل المحادثات، ومتابعة العملاء على واتساب - بدون ما تحتاج مبرمج</p>
  <div class="btns">
    <a href="" class="btn btn-green">ابدأ الآن - واتساب</a>
    <a href="#pricing" class="btn btn-white">شاهد الباقات</a>
  </div>
  <p style="margin-top:20px;font-size:14px;color:#555">شغال الآن على ${DOMAIN}</p>
</section>

<section class="features">
  <div class="card"><h3>🤖 رد تلقائي ذكي</h3><p>يرد على العملاء 24/7 حتى وانت نايم، يفهم الأسئلة ويجاوب باحترافية</p></div>
  <div class="card"><h3>👥 تحويل للموظفين</h3><p>يحول المحادثة تلقائياً للموظف المناسب حسب الطلب</p></div>
  <div class="card"><h3>📊 لوحة تحكم</h3><p>تابع كل المحادثات والطلبات والتحويلات من مكان واحد</p></div>
</section>

<section id="pricing" class="pricing">
  <h2>باقات WhatsBot</h2>
  <div class="plans">
    <div class="plan">
      <h3>أفراد</h3>
      <div class="price">109 <span>ريال/شهر</span></div>
      <ul><li>رقم واتساب واحد</li><li>1000 محادثة شهرية</li><li>رد تلقائي</li><li>دعم فني</li></ul>
      <a href="" class="btn btn-white" style="width:100%;text-align:center;margin-top:10px">اشترك</a>
    </div>
    <div class="plan featured">
      <h3>احترافي 🔥</h3>
      <div class="price">199 <span>ريال/شهر</span></div>
      <ul><li>3 أرقام واتساب</li><li>5000 محادثة</li><li>تحويل تلقائي</li><li>تقارير متقدمة</li></ul>
      <a href="" class="btn btn-green" style="width:100%;text-align:center;margin-top:10px">الأكثر طلباً</a>
    </div>
    <div class="plan">
      <h3>شركات</h3>
      <div class="price">399 <span>ريال/شهر</span></div>
      <ul><li>أرقام غير محدودة</li><li>محادثات غير محدودة</li><li>API كامل</li><li>مدير حساب خاص</li></ul>
      <a href="" class="btn btn-white" style="width:100%;text-align:center;margin-top:10px">للشركات</a>
    </div>
  </div>
</section>

<footer>
  <p>© 2026 WhatsBot - wsbot.me</p>
  <p>تواصل: <a href="">${SUPPORT_NUMBER}</a> | ${DOMAIN}</p>
  <p style="margin-top:8px;font-size:12px">نحن لا نطلب تحويل بنكي، الاشتراك يتم عبر واتساب فقط</p>
</footer>
</body>
</html>
  `);
});

app.get('/health', (req,res)=> res.json({status:'ok', domain:'wsbot.me'}));

app.listen(PORT, ()=> console.log('WhatsBot running on', PORT, 'domain wsbot.me'));
