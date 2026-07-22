const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, delay, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const sessions = new Map();

async function createPairingCode(phoneNumber){
  const clean = phoneNumber.replace(/[^0-9]/g,'').trim();
  console.log(`📱 طلب كود للرقم: ${clean}`);
  
  // امسح مجلدات قديمة لنفس الرقم
  try{
    const files = fs.readdirSync('.');
    files.forEach(f=>{
      if(f.startsWith('auth_'+clean)){
        try{ fs.rmSync(f, {recursive:true, force:true}); }catch(e){}
      }
    });
  }catch(e){}

  const folder = `auth_${clean}_${Date.now()}`;
  const { state, saveCreds } = await useMultiFileAuthState(folder);

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'}))
    },
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser: ["WhatsBot.sa","Chrome","110.0.0.0"],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
  });

  sock.ev.on('creds.update', saveCreds);

  return new Promise(async (resolve, reject)=>{
    let resolved = false;
    
    // تايمر 25 ثانية
    const timeout = setTimeout(()=>{
      if(!resolved){
        resolved = true;
        try{ sock.end(); }catch(e){}
        reject(new Error('Timeout - حاول مرة ثانية'));
      }
    }, 25000);

    sock.ev.on('connection.update', async (update)=>{
      const { connection, lastDisconnect } = update;
      if(connection === 'close'){
        const reason = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output.statusCode : 0;
        console.log(`❌ اتصال مغلق ${clean} - سبب: ${reason}`);
        if(!resolved && reason !== 401){
          // لا نرفض هنا - نخلي الكود يكمل
        }
      }
      if(connection === 'open'){
        console.log(`✅ متصل ${clean}`);
      }
    });

    try{
      await delay(2000);
      if(!state.creds.registered){
        const code = await sock.requestPairingCode(clean);
        console.log(`🔑 كود ${clean}: ${code}`);
        if(!resolved){
          resolved = true;
          clearTimeout(timeout);
          sessions.set(clean, {sock, code, folder, created: Date.now()});
          // لا نغلق السوكت - نخليه مفتوح
          resolve(code);
        }
      } else {
        if(!resolved){
          resolved = true;
          clearTimeout(timeout);
          resolve('ALREADY_REGISTERED');
        }
      }
    }catch(e){
      console.error(`Pair error ${clean}:`, e.message);
      if(!resolved){
        resolved = true;
        clearTimeout(timeout);
        try{ sock.end(); }catch(err){}
        try{ fs.rmSync(folder, {recursive:true, force:true}); }catch(err){}
        reject(e);
      }
    }
  });
}

app.post('/api/pair-whatsapp', async (req,res)=>{
  try{
    const { waNumber, phone, clientId } = req.body;
    const num = (waNumber || phone || clientId || '').toString();
    if(!num || num.length < 9) return res.status(400).json({success:false, error:'رقم غير صحيح'});
    
    const code = await createPairingCode(num);
    
    res.json({
      success:true,
      code: code,
      pairingCode: code,
      pairing_code: code,
      pending_code: code,
      expiresIn: 90
    });
  }catch(e){
    console.error('API pair error:', e.message);
    let msg = e.message;
    if(msg.includes('Connection Closed') || msg.includes('428') || msg.includes('Connection')){
      msg = 'Connection Closed - Render يحاول يتصل، انتظر 10 ثواني وحاول مرة ثانية';
    }
    res.status(500).json({success:false, error: msg});
  }
});

app.get('/api/whatsapp-status/:phone', (req,res)=>{
  const clean = req.params.phone.replace(/[^0-9]/g,'');
  const s = sessions.get(clean);
  if(!s) return res.json({status:'not_found'});
  res.json({status:'pending', code:s.code, pairingCode:s.code, age: (Date.now()-s.created)/1000});
});

app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('*', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, ()=> console.log(`🚀 FIXED WhatsApp v3 running on ${PORT}`));
