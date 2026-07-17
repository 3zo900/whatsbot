
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const OpenAI = require('openai');
const fs = require('fs');
const multer = require('multer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
if(!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
  destination: (req,file,cb)=> cb(null,'uploads/'),
  filename: (req,file,cb)=> cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10*1024*1024 } });

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'whatsbot_verify_123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPPORT_NUMBER = process.env.SUPPORT_NUMBER || '966510015157';

const BANK_DETAILS = {
  bankName: 'مصرف الراجحي',
  iban: 'SA95 8000 0498 6080 1001 6706',
  accountNumber: '498608010016706',
  swiftCode: 'RJHISARI',
  beneficiary: 'واتس بوت',
  supportWhatsApp: '966510015157'
};

const PRICING = [
  { id: 'individuals', name: 'باقة أفراد', price: 109, features: ['500 رسالة / شهر','رد تلقائي أساسي','لوحة تحكم بسيطة','دعم عبر الواتساب'] },
  { id: 'pro', name: 'باقة احترافي', price: 199, popular: true, features: ['2000 رسالة / شهر','رد تلقائي ذكي AI','5 موظفين دعم','تحويل تلقائي للأقل ضغطا','تخصيص اسم الشركة','سجل محادثات كامل','دعم فني مميز'] },
  { id: 'companies', name: 'باقة شركات ومؤسسات', price: 399, features: ['رسائل غير محدودة','كل مميزات الاحترافي','عدد موظفين غير محدود','تقارير متقدمة','API مفتوح','مدير حساب خاص','تفعيل فوري خلال ساعة','دعم 24/7'] }
];

let companySettings = { companyName: 'واتس بوت - WhatsBot', supportNumber: '966510015157', autoAssign: true };
try { if(fs.existsSync('./company.json')) companySettings = JSON.parse(fs.readFileSync('./company.json')); } catch(e){}
function saveCompany(){ fs.writeFileSync('./company.json', JSON.stringify(companySettings, null, 2)); }
function replaceCompanyVars(t){ return t.replaceAll('{companyName}', companySettings.companyName).replaceAll('{company}', companySettings.companyName); }

let employees = [];
try { if(fs.existsSync('./employees.json')) employees = JSON.parse(fs.readFileSync('./employees.json')); } catch(e){}
if(employees.length===0){
  employees = [
    { id: 1, name: 'أحمد - دعم فني', phone: '966500000001', active: true, status: 'online', maxChats: 5, assignedChats: ['966512345678'], totalReplies: 24 },
    { id: 2, name: 'سارة - مبيعات', phone: '966500000002', active: true, status: 'online', maxChats: 5, assignedChats: [], totalReplies: 18 }
  ];
}
employees = employees.map(e=> ({ status: e.active ? (e.status||'online') : 'offline', maxChats: e.maxChats||5, active: e.active!==undefined?e.active:true, assignedChats: e.assignedChats||[], totalReplies: e.totalReplies||0, ...e }));
function saveEmployees(){ fs.writeFileSync('./employees.json', JSON.stringify(employees, null, 2)); }
function getLeastLoadedEmployee(){
  const available = employees.filter(e=> e.active && e.status==='online' && e.assignedChats.length < (e.maxChats||5));
  if(available.length===0) return null;
  available.sort((a,b)=> a.assignedChats.length - b.assignedChats.length);
  return available[0];
}

let chatLogs = [];
try { if(fs.existsSync('./chat_logs.json')) chatLogs = JSON.parse(fs.readFileSync('./chat_logs.json')); } catch(e){}
function saveLogs(){ fs.writeFileSync('./chat_logs.json', JSON.stringify(chatLogs.slice(-2000), null, 2)); }
function addLog(entry){ chatLogs.push({ time: new Date().toISOString(), ...entry }); saveLogs(); }

let humanRequests = new Set();
try { if(fs.existsSync('./human_requests.json')) humanRequests = new Set(JSON.parse(fs.readFileSync('./human_requests.json'))); } catch(e){}
function saveHumanRequests(){ fs.writeFileSync('./human_requests.json', JSON.stringify([...humanRequests])); }

const HUMAN_KEYWORDS = ['موظف','بشري','انسان','كلم','تواصل مع','دعم فني','خدمة عملاء','ابي اكلم','ابغى اكلم','human','support','agent'];

function getAutoReplies(){
  const name = companySettings.companyName;
  return {
    default: replaceCompanyVars(`مرحبا! أنا مساعد *{companyName}*`),
    "السعر": `💰 باقات ${name}: أفراد 109 ريال، احترافي 199 ريال، شركات 399 ريال`
  };
}
function isHumanRequest(t){ return HUMAN_KEYWORDS.some(k=> t.toLowerCase().includes(k)); }
function getKeywordReply(msg){
  const replies = getAutoReplies(); const m = msg.toLowerCase().trim();
  for(let k in replies){ if(k==='default') continue; if(m.includes(k.toLowerCase())) return replies[k]; }
  return null;
}

let openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;
async function getAIReply(userMessage){
  if(!openai) return null;
  try{
    const c = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `أنت مساعد شركة "${companySettings.companyName}"، ترد باللهجة السعودية باختصار.` },
        { role: "user", content: userMessage }
      ],
      max_tokens: 300, temperature: 0.7
    });
    return c.choices[0].message.content;
  }catch(e){ return null; }
}

async function sendWhatsApp(to, text){
  if(!WHATSAPP_TOKEN || !PHONE_NUMBER_ID){ console.log('MOCK SEND to', to, text); return; }
  await axios.post(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } },
    { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
  );
}

app.get('/api/bank-details', (req,res)=> res.json(BANK_DETAILS));
app.get('/api/pricing', (req,res)=> res.json(PRICING));
app.get('/api/company', (req,res)=> res.json(companySettings));
app.post('/api/company', (req,res)=>{
  if(req.body.companyName) companySettings.companyName = req.body.companyName;
  if(req.body.autoAssign!==undefined) companySettings.autoAssign = req.body.autoAssign;
  saveCompany(); res.json({ success:true, settings: companySettings });
});
app.get('/api/employees', (req,res)=>{
  const enriched = employees.map(e=> ({
    ...e,
    available: e.status==='online' && e.active && e.assignedChats.length < (e.maxChats||5),
    availabilityText: e.status!=='online' || !e.active ? 'غير متصل' : e.assignedChats.length >= (e.maxChats||5) ? 'مشغول' : 'متاح الآن',
    loadPercent: Math.round((e.assignedChats.length/(e.maxChats||5))*100)
  }));
  res.json(enriched);
});
app.post('/api/employees', (req,res)=>{
  if(employees.length >=5) return res.status(400).json({ error: 'الحد الأقصى 5 موظفين' });
  const emp = { id: Date.now(), name: req.body.name||`موظف ${employees.length+1}`, phone: req.body.phone||'', active: true, status: 'online', maxChats: 5, assignedChats: [], totalReplies: 0 };
  employees.push(emp); saveEmployees(); res.json(emp);
});
app.put('/api/employees/:id', (req,res)=>{
  const emp = employees.find(e=> e.id==req.params.id || e.id==parseInt(req.params.id));
  if(!emp) return res.status(404).json({ error: 'not found' });
  Object.assign(emp, req.body); saveEmployees(); res.json(emp);
});
app.delete('/api/employees/:id', (req,res)=>{
  employees = employees.filter(e=> e.id != req.params.id && e.id != parseInt(req.params.id)); saveEmployees(); res.json({ success:true });
});
app.post('/api/assign', (req,res)=>{
  let { customerPhone, employeeId, auto } = req.body;
  let emp = null;
  if(auto){
    emp = getLeastLoadedEmployee();
    if(!emp) return res.status(400).json({ error: 'لا يوجد موظف متاح حاليا' });
  } else {
    emp = employees.find(e=> e.id==employeeId || e.id==parseInt(employeeId));
    if(!emp) return res.status(404).json({ error: 'موظف غير موجود' });
  }
  employees.forEach(e=> e.assignedChats = e.assignedChats.filter(c=> c!=customerPhone));
  emp.assignedChats.push(customerPhone); emp.assignedChats = [...new Set(emp.assignedChats)];
  addLog({ type: auto?'auto_assign':'assign', customerPhone, employeeId: emp.id, employeeName: emp.name });
  saveEmployees(); res.json({ success:true, employee: emp });
});
app.post('/api/auto-assign/:phone', (req,res)=>{
  const customerPhone = req.params.phone;
  const emp = getLeastLoadedEmployee();
  if(!emp) return res.status(400).json({ error: 'لا يوجد موظف متاح' });
  employees.forEach(e=> e.assignedChats = e.assignedChats.filter(c=> c!=customerPhone));
  emp.assignedChats.push(customerPhone); emp.assignedChats = [...new Set(emp.assignedChats)];
  humanRequests.add(customerPhone); saveHumanRequests();
  addLog({ type: 'auto_assign', customerPhone, employeeId: emp.id, employeeName: emp.name });
  saveEmployees();
  res.json({ success:true, employee: emp });
});

let paymentProofs = [];
try { if(fs.existsSync('./payment_proofs.json')) paymentProofs = JSON.parse(fs.readFileSync('./payment_proofs.json')); } catch(e){}
function saveProofs(){ fs.writeFileSync('./payment_proofs.json', JSON.stringify(paymentProofs, null, 2)); }

app.post('/api/payment-proof', upload.single('receipt'), async (req,res)=>{
  try{
    const { companyName, plan, amount, customerPhone, customerName } = req.body;
    const file = req.file;
    if(!file) return res.status(400).json({ error: 'يرجى ارفاق صورة من الحوالة' });
    const proof = { id: Date.now(), time: new Date().toISOString(), companyName, plan, amount, customerPhone, customerName, fileName: file.filename, filePath: `/uploads/${file.filename}`, status: 'pending' };
    paymentProofs.push(proof); saveProofs();
    const adminMsg = `💰 حوالة جديدة!\n🏢 ${companyName||'-'}\n📦 ${plan||'-'}\n💵 ${amount||''}\n👤 ${customerName||''}\n📱 ${customerPhone||''}`;
    if(SUPPORT_NUMBER) await sendWhatsApp(SUPPORT_NUMBER, adminMsg);
    if(customerPhone){
      const customerConfirm = `✅ تم استلام صورة الحوالة بنجاح\n\nشكرا لك ${customerName||''} من ${companyName||''} 🙏\n\n📌 الباقة: ${plan}\n💵 المبلغ: ${amount}\n🔖 المرجع: ${proof.id}\n\nسيتم تفعيل اشتراكك خلال ساعتين كحد أقصى وسيتواصل معك فريق الدعم.\n\nلأي استفسار: ${SUPPORT_NUMBER}`;
      await sendWhatsApp(customerPhone, customerConfirm);
    }
    addLog({ type: 'payment_proof', companyName, plan, customerPhone });
    res.json({ success: true, proof });
  }catch(e){ console.error(e); res.status(500).json({ error: 'خطأ' }); }
});

app.get('/webhook', (req,res)=>{
  const mode=req.query['hub.mode']; const token=req.query['hub.verify_token']; const challenge=req.query['hub.challenge'];
  if(mode==='subscribe' && token===VERIFY_TOKEN) res.status(200).send(challenge); else res.sendStatus(403);
});
app.post('/webhook', async (req,res)=>{
  try{
    const entry=req.body.entry?.[0]; const changes=entry?.changes?.[0]; const value=changes?.value; const message=value?.messages?.[0]; const contact=value?.contacts?.[0];
    if(message){
      const from=message.from; const text=message.text?.body||''; const name=contact?.profile?.name||from;
      addLog({ type: 'incoming', customerPhone: from, customerName: name, message: text });
      if(humanRequests.has(from)){
        if(text.toLowerCase().includes('رجع البوت')){ humanRequests.delete(from); saveHumanRequests(); await sendWhatsApp(from, replaceCompanyVars(`تم ✅ رجعت لك مساعد {companyName}`)); }
        return res.sendStatus(200);
      }
      if(isHumanRequest(text)){
        if(companySettings.autoAssign){
          const least = getLeastLoadedEmployee();
          if(least){
            humanRequests.add(from); saveHumanRequests();
            employees.forEach(e=> e.assignedChats = e.assignedChats.filter(c=> c!=from));
            least.assignedChats.push(from); least.assignedChats = [...new Set(least.assignedChats)]; saveEmployees();
            await sendWhatsApp(from, `تمام، حولتك تلقائيا لـ ${least.name} 👨‍💼 في ${companySettings.companyName}`);
            return res.sendStatus(200);
          }
        }
        humanRequests.add(from); saveHumanRequests();
        await sendWhatsApp(from, `تمام، حولتك لموظف الدعم في ${companySettings.companyName} 👨‍💼`); 
        return res.sendStatus(200);
      }
      let reply = getKeywordReply(text) || await getAIReply(text) || getAutoReplies().default;
      await sendWhatsApp(from, reply);
    }
    res.sendStatus(200);
  }catch(e){ res.sendStatus(200); }
});

app.get('/', (req,res)=> res.send(`🤖 ${companySettings.companyName} بوت يعمل!`));
app.get('/stats', (req,res)=> res.json({ company: companySettings, bank: BANK_DETAILS, pricing: PRICING, employees }));

const PORT=process.env.PORT||3000;
app.listen(PORT, ()=> console.log(`🚀 ${companySettings.companyName} على ${PORT}`));
