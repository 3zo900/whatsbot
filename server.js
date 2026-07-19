const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

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
app.get('/pay.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'pay.html')));
app.get('/receipt.html', (req,res)=> res.sendFile(path.join(__dirname, 'public', 'receipt.html')));

app.get('/health', (req,res)=> res.json({ok:true, version:'V13_FINAL'}));

app.listen(PORT, ()=> console.log('WhatsBot V13 FINAL running on '+PORT));
