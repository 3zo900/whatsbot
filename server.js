const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Ensure orders file exists
if(!fs.existsSync(ORDERS_FILE)){
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}

function getOrders(){
  try{ return JSON.parse(fs.readFileSync(ORDERS_FILE,'utf8')); }catch{ return []; }
}
function saveOrders(orders){
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// API: Create order - from public/order.html
app.post('/api/orders', (req,res)=>{
  try{
    const {storeName, customerName, whatsapp, email, plan, price} = req.body;
    if(!storeName || !customerName || !whatsapp || !plan){
      return res.status(400).json({ok:false, error:'Missing fields'});
    }
    const orders = getOrders();
    const newOrder = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2,5),
      storeName, customerName, whatsapp, email: email||'', plan, price: price||0,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    saveOrders(orders);
    console.log('New order:', newOrder.id, plan, price);
    res.json({ok:true, id:newOrder.id});
  }catch(e){
    console.error(e);
    res.status(500).json({ok:false, error:e.message});
  }
});

// API: Get orders - for admin-dashboard
app.get('/api/orders', (req,res)=>{
  try{
    const orders = getOrders();
    res.json({ok:true, orders});
  }catch(e){
    res.status(500).json({ok:false, error:e.message});
  }
});

// API: Update order status
app.post('/api/orders/:id/status', (req,res)=>{
  try{
    const {status} = req.body;
    const orders = getOrders();
    const idx = orders.findIndex(o=>o.id===req.params.id);
    if(idx>=0){
      orders[idx].status = status;
      saveOrders(orders);
    }
    res.json({ok:true});
  }catch(e){ res.status(500).json({ok:false}); }
});

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

app.get('/health', (req,res)=> res.json({ok:true}));

app.listen(PORT, ()=> console.log('WhatsBot V13 FINAL with Orders API running on '+PORT));
