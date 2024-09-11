require('dotenv').config()
const express = require('express')
const flash = require('express-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const db = require('./db')
const { Server } = require('socket.io');
const AdminRouters = require('./routers/AdminRouter')
const UserRouters = require('./routers/UserRouters') 
const ProductRouters = require('./routers/ProductRouter')
const fs = require('fs');
const app = express()
const http = require('http')
const httpServer = http.createServer(app);
app.set('view engine', 'ejs')
app.use(cookieParser('123'))
app.use(session({ cookie: { maxAge: 1000 * 60 * 20 * 10000 } }));
app.use(flash());
app.use(express.static('uploads'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
    if (!req.session.username) {
      return res.redirect('/user/login');
    }
  
    const username = req.session.username;
    const password = req.session.password;
  
    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, userResults) => {
      if (err) {
        throw err;
      }
  
      db.query('SELECT * FROM books', (err, bookResults) => {
        if (err) {
          throw err;
        }
  
    
        const books = bookResults;
  
        res.render('index', { username, books });
      });
    });
  });

app.use('/admin',AdminRouters)
app.use('/user', UserRouters)
app.use('/products', ProductRouters)

const port = process.env.PORT || 8080;
httpServer.listen(port, () => console.log(`http://localhost:${port}`));