const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

const ADMIN_EMAIL = 'az.behlal@gmail.com';
const ADMIN_PASS = '0510015157qQ@';

app.get('/', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/index.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Order - يعالج /order و /order?plan=xxx
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
app.get('/dashboard', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/dashboard.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/login', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/login.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'login.html')));

app.get('/api/health', (req,res)=> res.json({ok:true}));

app.post('/api/employee-reply', (req,res)=>{
  res.json({ok:true});
});

app.post('/api/admin/login', (req,res)=>{
  const {email, pass} = req.body || {};
  if((email===ADMIN_EMAIL && pass===ADMIN_PASS) || (email==='admin' && pass==='Letsbot@2026')){
    return res.json({ok:true});
  }
  res.status(401).json({ok:false});
});

// Fallback لأي html
app.use((req,res,next)=>{
  if(req.path.startsWith('/order')){
    return res.sendFile(path.join(__dirname, 'public', 'order.html'));
  }
  if(req.path.endsWith('.html')){
    const full = path.join(__dirname, 'public', req.path.replace(/^\//,'').replace(/^public\//,''));
    if(fs.existsSync(full)) return res.sendFile(full);
  }
  next();
});

app.listen(PORT, ()=> console.log('Running '+PORT));
