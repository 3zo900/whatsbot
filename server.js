const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ===== واتساب دائم - حقك =====
const PHONE_NUMBER_ID = "1237839659414830";
const WHATSAPP_TOKEN = "EAAZANPLTRVtcBSMJY9UBibAVcNiwWn7VszabKxsiC7UtyiYUIDvmOCdNmP2TdVNmhcksnS6Eq4tmilL3mVex8Pi2DohxD1MSyaZAIaf0ZAoUGPVeD2tZAJIwzTEzZBsHBlt8ZBDs7RbVKWtZBXhXZCBWLwYDtMRsKCdyFzEt9XMiQzJTDGhsp3mPsiwA7AB6iwZDZD";
const VERIFY_TOKEN = "wsbot_verify_2024";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({dest:'uploads/'});

let proofs = [];
let users = [];

// ===== 1. Webhook Verify - لازم يكون فوق كل شي =====
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('✅ Webhook Verified!');
    return res.status(200).send(req.query['hub.challenge']);
  }
  return res.sendStatus(403);
});

// ===== 2. استقبال رسائل واتساب =====
app.post('/webhook', async (req, res) => {
  try {
    if (req.body.object === 'whatsapp_business_account') {
      for (const entry of req.body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const m of change.value.messages) {
              const from = m.from;
              const text = m.text?.body || '';
              console.log(`📩 من ${from}: ${text}`);
              
              let reply = `هلا والله! 👋\nانا WhatsBot AI - واتس بوت ذكي يرد 24/7\n\nوصلتني رسالتك: "${text}"`;
              if(text.includes('سلام') || text.includes('هلا')) reply = "هلا والله حياك! 👋\nانا WhatsBot.sa 🤖 جاهز ارد على عملاءك 24 ساعة";

              await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ messaging_product: 'whatsapp', to: from, type: 'text', text: { body: reply } })
              });
            }
          }
        }
      }
    }
    res.sendStatus(200);
  } catch(e){ res.sendStatus(200); }
});

// ===== 3. رفع الإيصال (الطريقة الحالية) =====
app.post('/api/payment-proof', upload.single('receipt'), (req,res)=>{
 const data = {
  id: Date.now().toString(),
  fullName: req.body.companyName,
  phone: req.body.customerPhone,
  email: req.body.customerEmail,
  company: req.body.company,
  file: req.file?.originalname||'',
  status:'pending',
  createdAt: new Date().toISOString()
 };
 proofs.push(data);
 console.log('📥 New proof:', data.email);
 res.json({success:true, id:data.id});
});

app.get('/api/payment-proofs', (req,res)=>{ res.json(proofs.reverse()); });
app.post('/api/admin/approve', (req,res)=>{
 const p = proofs.find(x=>x.id===req.body.id);
 if(p){ p.status='approved'; users.push(p); }
 res.json({success:true});
});
app.post('/api/admin/reject', (req,res)=>{
 const p = proofs.find(x=>x.id===req.body.id);
 if(p) p.status='rejected';
 res.json({success:true});
});

app.get('/.well-known/apple-developer-merchantid-domain-association', (req,res)=>{
 res.sendFile(path.join(__dirname, 'public', 'apple-developer-merchantid-domain-association'));
});

// ===== مهم جداً: هذا السطر يكون آخر سطر =====
app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, ()=> console.log(`🚀 WhatsBot Running on ${PORT} - Webhook Ready`));
