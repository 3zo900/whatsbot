const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// واتساب دائم
const PHONE_NUMBER_ID = "1237839659414830";
const WHATSAPP_TOKEN = "EAAZANPLTRVtcBSMJY9UBibAVcNiwWn7VszabKxsiC7UtyiYUIDvmOCdNmP2TdVNmhcksnS6Eq4tmilL3mVex8Pi2DohxD1MSyaZAIaf0ZAoUGPVeD2tZAJIwzTEzZBsHBlt8ZBDs7RbVKWtZBXhXZCBWLwYDtMRsKCdyFzEt9XMiQzJTDGhsp3mPsiwA7AB6iwZDZD";
const VERIFY_TOKEN = "wsbot_verify_2024";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// تأكد مجلد الرفع موجود
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({dest:'uploads/'});

let proofs = [];
let users = [];

// 1. Webhook Verify
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log('✅ Webhook Verified');
    return res.status(200).send(req.query['hub.challenge']);
  }
  return res.sendStatus(403);
});

// 2. استقبال الرسائل
app.post('/webhook', async (req, res) => {
  try {
    if (req.body.object === 'whatsapp_business_account') {
      for (const entry of req.body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const m of change.value.messages) {
              const from = m.from;
              const text = m.text?.body || '';
              console.log('📩 من ' + from + ': ' + text);
              let reply = 'هلا والله حياك! انا WhatsBot.sa جاهز 24/7';
              if (text) reply = 'هلا! وصلتني: "' + text + '" - انا بوت WhatsBot.sa ارد تلقائيا';
              await fetch('https://graph.facebook.com/v19.0/' + PHONE_NUMBER_ID + '/messages', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
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

// 3. رفع الايصال
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
 res.json({success:true, id:data.id});
});

app.get('/api/payment-proofs', (req,res)=>{ res.json(proofs.slice().reverse()); });
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

// 4. Apple Pay
app.get('/.well-known/apple-developer-merchantid-domain-association', (req,res)=>{
 const p = path.join(__dirname, 'public', 'apple-developer-merchantid-domain-association');
 if (fs.existsSync(p)) res.sendFile(p); else res.sendStatus(404);
});

// 5. اخر سطر - مصحح للـ Express 5 (بدل '*')
app.use((req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, ()=> console.log('🚀 WhatsBot Running on ' + PORT));
