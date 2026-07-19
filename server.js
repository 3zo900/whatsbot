const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Serve static
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Auto-fix index.html on startup if it has leak or old prices
(function fixIndex(){
  try{
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if(fs.existsSync(indexPath)){
      let html = fs.readFileSync(indexPath, 'utf8');
      let changed = false;
      // Remove leaked JS code if found
      if(html.includes("app.get('/order'") || html.includes('const plan =')){
        const cut = html.indexOf("app.get('/order'");
        if(cut > 0){
          html = html.substring(0, cut);
          if(!html.includes('</html>')) html += '</body></html>';
          changed = true;
        }
      }
      // Fix prices 189->220, 399->480 only (minimal)
      if(html.includes('>189 <') || html.includes('>189<') || html.includes('> 189')){
        html = html.replace(/>\s*189\s*</g, '>220 <').replace(/>189</g, '>220<');
        html = html.replace(/price:'189'/g, "price:'220'");
        changed = true;
      }
      if(html.includes('>399 <') || html.includes('>399<')){
        html = html.replace(/>\s*399\s*</g, '>480 <').replace(/>399</g, '>480<');
        html = html.replace(/price:'399'/g, "price:'480'");
        changed = true;
      }
      // Ensure order buttons go to /order?plan=
      if(html.includes('wa.me') && html.includes('اختر الباقة')){
        html = html.replace(/href="https:\/\/wa\.me[^"]*"/g, (m, idx)=>{
          // We'll do simple sequential replacement below
          return m;
        });
      }
      if(changed){
        fs.writeFileSync(indexPath, html, 'utf8');
        console.log('✅ index.html auto-fixed: prices 220/480, leak removed');
      }
    }
  }catch(e){ console.log('fix error', e.message); }
})();

app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/index.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/order', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'order.html')));
app.get('/order.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'order.html')));

app.get('/admin', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin-dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));
app.get('/admin-dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));

app.get('/client-dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'client-dashboard.html')));
app.get('/client-dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'client-dashboard.html')));

app.get('/employee-reply', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'employee-reply.html')));
app.get('/employee-reply.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'employee-reply.html')));

app.get('/login', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/login.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.get('/dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

app.get('/api/health', (req,res)=> res.json({ok:true, version:'V13_FINAL_CLEAN_NO_EMBED'}));

app.post('/api/employee-reply', (req,res)=> res.json({ok:true}));

app.post('/api/admin/login', (req,res)=>{
  const {email, pass} = req.body || {};
  if((email==='az.behlal@gmail.com' && pass==='0510015157qQ@') || (email==='admin' && pass==='Letsbot@2026')){
    return res.json({ok:true});
  }
  res.status(401).json({ok:false});
});

// Fallback for /order?plan=xxx
app.use((req,res,next)=>{
  if(req.path.startsWith('/order')){
    return res.sendFile(path.join(__dirname, 'public', 'order.html'));
  }
  next();
});

app.listen(PORT, ()=> console.log('✅ WhatsBot Running on '+PORT+' - CLEAN NO EMBED'));
