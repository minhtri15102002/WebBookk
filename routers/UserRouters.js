    const express = require('express');
    const app = express.Router();
    const fs = require('fs');
    const multer = require('multer');
    const { check, validationResult } = require('express-validator');
    const bcrypt = require('bcrypt');
    const db = require('../db');
    
    app.use(express.urlencoded());

    const storage = multer.diskStorage({
        destination: function(req, file, cb) {
            const destinationPath = './uploads';
            fs.mkdirSync(destinationPath, { recursive: true });
            cb(null, destinationPath);
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname);
        }
    });
    const uploadAvatar = multer({ storage: storage });

    app.get('/login', (req, res) => {
        const error = req.flash('error') || '';
        const password = req.flash('password') || '';
        const username = req.flash('username') || '';
        res.render('login', { error, password, username });
    });
    

    app.get('/register', (req, res) => {
        const error = req.flash('error') || '';
        const password = req.flash('password') || '';
        const username = req.flash('username') || '';

        res.render('register', { error, password, username });
    });



    app.get('/profile', (req, res) => {
        const username = req.session.username;
        db.query('SELECT * FROM users WHERE username = ?',username , (error, results) => {
            if (error) {
                throw error
            }
            res.render('profile', { user: results[0] })
        })
    })

    app.get('/lien-he', (req, res) => {
        const username = req.session.username;
        db.query('SELECT * FROM users WHERE username = ?',username , (error, results) => {
            if (error) {
                throw error
            }
            res.render('lien-he', { user: results[0] })
        })
    })


    

    const loginValidator = [
        check('username').exists().withMessage('Vui lòng nhập username').notEmpty().withMessage('Không được để trống username'),
        check('password').exists().withMessage('Vui lòng nhập mật khẩu').notEmpty().withMessage('Không được để trống mật khẩu ').isLength({ min: 6 }).withMessage(" Mật khẩu phải từ 6 ký tự "),
    ];

    const registerValidator = [
        check('name').exists().withMessage('Vui lòng nhập tên người dùng').notEmpty().withMessage('Không được để trống tên người dùng').isLength({ min: 6 }).withMessage("Tên người dùng phải từ 6 ký tự "),
        check('email').exists().withMessage('Vui lòng nhập Email').notEmpty().withMessage('Không được để trống username'),
        check('password').exists().withMessage('Vui lòng nhập mật khẩu').notEmpty().withMessage('Không được để trống mật khẩu ').isLength({ min: 6 }).withMessage(" Mật khẩu phải từ 6 ký tự "),
        check('confirmPassword').exists().withMessage('Vui lòng nhập xác nhận mật khẩu').notEmpty().withMessage('Vui lòng nhập xác nhận mật khẩu').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu không khớp');
            }
            return true;
        })
    ];

    

    app.post('/login', loginValidator, (req, res) => {
        let result = validationResult(req);
        if (result.errors.length === 0) {
            const { username, password } = req.body;
    
            db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
                if (err) {
                    req.flash('error', err.message);
                    req.flash('username', username);
                    res.redirect('/user/login');
                } else {
                    if (rows.length > 0) {
                        const user = rows[0];
                        if (username === 'admin') {
                            if (password === user.password) {
                                req.session.username = username;
                                res.redirect('/'); // Redirect to dashboard route
                            } else {
                                req.flash('error', 'Tên người dùng hoặc mật khẩu không chính xác.');
                                req.flash('username', username);
                                req.flash('password', password);
                                res.redirect('/user/login');
                            }
                        } else {
                            // Đối với user thông thường, so sánh hash mật khẩu
                            bcrypt.compare(password, user.password, (bcryptErr, bcryptRes) => {
                                if (bcryptErr) {
                                    req.flash('error', 'Lỗi khi xác minh mật khẩu');
                                    req.flash('username', username);
                                    res.redirect('/user/login');
                                } else {
                                    if (bcryptRes) {
                                        req.session.username = username;
                                        res.redirect('/'); // Redirect to dashboard route
                                    } else {
                                        req.flash('error', 'Tên người dùng hoặc mật khẩu không chính xác.');
                                        req.flash('username', username);
                                        req.flash('password', password);
                                        res.redirect('/user/login');
                                    }
                                }
                            });
                        }
                    } else {
                        req.flash('error', 'Tên người dùng hoặc mật khẩu không chính xác.');
                        req.flash('username', username);
                        req.flash('password', password);
                        res.redirect('/user/login');
                    }
                }
            });
        }
    });
    

//Register user     
app.post('/register', registerValidator, (req, res) => {
    let result = validationResult(req);

    if (result.errors.length === 0) {
        const { name, email, password } = req.body;

        // Hash mật khẩu trước khi lưu vào cơ sở dữ liệu
        bcrypt.hash(password, 10, (hashErr, hash) => {
            if (hashErr) {
                req.flash('error', 'Lỗi khi mã hóa mật khẩu');
                req.flash('name', name);
                req.flash('email', email);
                res.redirect("/user/register");
            } else {
                const sql = 'INSERT INTO users(username, email, password) VALUES (?, ?, ?)';
                const params = [name, email, hash];

                db.query(sql, params, (insertErr, result, fields) => {
                    if (insertErr) {
                        req.flash('error', insertErr.message);
                        req.flash('name', name);
                        req.flash('email', email);
                        res.redirect("/user/register");
                    } else {
                        req.flash('name', name);
                        req.flash('email', email);
                        req.flash('success', 'Đăng ký thành công');
                        res.redirect("/user/login");
                    }
                });
            }
        });
    } else {
        // Xử lý khi có lỗi từ express-validator
        result = result.mapped();

        let message;
        for (fields in result) {
            message = result[fields].msg;
            break;
        }

        const { name, email, password } = req.body;
        req.flash('error', message);
        req.flash('name', name);
        req.flash('email', email);

        res.redirect("/user/register");
    }
});

    

    
    app.get('/gio-hang', (req, res) => {
        const username = req.session.username; // Lấy username từ session
        if (!username) {
            res.status(401).send('Unauthorized'); // Kiểm tra xem người dùng đã đăng nhập chưa
            return;
        }
    
        // Truy vấn để lấy userId từ username
        db.query('SELECT user_id FROM users WHERE username = ?', [username], (error, userResults) => {
            if (error) {
                console.error('Error querying user table:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            if (userResults.length === 0) {
                res.status(404).send('User not found');
                return;
            }
    
            const userId = userResults[0].user_id; // Lấy userId từ kết quả truy vấn
        
            db.query('SELECT * FROM cart WHERE user_id = ?', [userId], (error, cartItems) => {
                if (error) {
                    console.error('Error querying cart table:', error);
                    res.status(500).send('Internal Server Error');
                    return;
                }
               
                const bookQueries = cartItems.map(cartItem => {
                    return new Promise((resolve, reject) => {
                        db.query('SELECT * FROM books WHERE book_id = ?', [cartItem.book_id], (error, bookResults) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(bookResults[0]);
                        });
                    });
                });
                
                // Tiếp tục với Promise.all và render template giống như bạn đã làm
                Promise.all(bookQueries)
                    .then(bookDetails => {
                        res.render('gio-hang', { 
                            user: username,
                            cartItems: cartItems, 
                            bookDetails: bookDetails
                        });
                    })
                    .catch(error => {
                        console.error('Error querying book table:', error);
                        res.status(500).send('Internal Server Error');
                    });
            });
        });
    });
    

    app.get('/check-out', (req, res) => {
        const username = req.session.username; // Lấy username từ session
        if (!username) {
            res.status(401).send('Unauthorized'); // Kiểm tra xem người dùng đã đăng nhập chưa
            return;
        }
    
        // Truy vấn để lấy userId từ username
        db.query('SELECT user_id FROM users WHERE username = ?', [username], (error, userResults) => {
            if (error) {
                console.error('Error querying user table:', error);
                res.status(500).send('Internal Server Error');
                return;
            }
    
            if (userResults.length === 0) {
                res.status(404).send('User not found');
                return;
            }
    
            const userId = userResults[0].user_id; // Lấy userId từ kết quả truy vấn
        
            db.query('SELECT * FROM cart WHERE user_id = ?', [userId], (error, cartItems) => {
                if (error) {
                    console.error('Error querying cart table:', error);
                    res.status(500).send('Internal Server Error');
                    return;
                }
               
                const bookQueries = cartItems.map(cartItem => {
                    return new Promise((resolve, reject) => {
                        db.query('SELECT * FROM books WHERE book_id = ?', [cartItem.book_id], (error, bookResults) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(bookResults[0]);
                        });
                    });
                });
                
                // Tiếp tục với Promise.all và render template giống như bạn đã làm
                Promise.all(bookQueries)
                    .then(bookDetails => {
                        res.render('check-out', { 
                            user: username,
                            cartItems: cartItems, 
                            bookDetails: bookDetails
                        });
                    })
                    .catch(error => {
                        console.error('Error querying book table:', error);
                        res.status(500).send('Internal Server Error');
                    });
            });
        });
    });

    app.post('/check-out', (req, res) => {
        const username = req.session.username;
        if (!username) {
          res.status(401).send('Unauthorized');
          return;
        }
      
        // Truy vấn để lấy userId từ username
        db.query('SELECT user_id FROM users WHERE username = ?', [username], (error, userResults) => {
          if (error) {
            console.error('Error querying user table:', error);
            res.status(500).send('Internal Server Error');
            return;
          }
      
          if (userResults.length === 0) {
            res.status(404).send('User not found');
            return;
          }
      
          const userId = userResults[0].user_id; // Lấy userId từ kết quả truy vấn
      
          // Lấy dữ liệu từ yêu cầu POST
          const { firstname, email, address, city, state, zip, cardname, cardnumber, expmonth, expyear, cvv ,totalPrice,bookIds,prices,quantities} = req.body;
      
          // Cập nhật dữ liệu người dùng trong bảng users
          const userQuery = "UPDATE users SET full_name = ?, email = ?, address = ?, city = ?, state = ?, zip = ? WHERE user_id = ?";
          db.query(userQuery, [firstname, email, address, city, state, zip, userId], (error, result) => {
            if (error) {
              console.error('Error updating user data:', error);
              return res.status(500).send('Error updating user data');
            }
      
           
            const orderQuery = "INSERT INTO orders (user_id, order_date, total_amount) VALUES (?, CURDATE(), ?)";
            const totalAmount = totalPrice; 
            const values = [userId, totalAmount, cardname, cardnumber, expmonth, expyear, cvv];
            db.query(orderQuery, values, (error, result) => {
              if (error) {
                console.error('Error creating order:', error);
                return res.status(500).send('Error creating order');
              }
              const orderId = result.insertId;

                // Chuẩn bị các dòng dữ liệu để chèn vào bảng order_details
                const orderDetails = [];
                for (let i = 0; i < bookIds.length; i++) {
                const bookId = bookIds[i];
                const quantity = quantities[i];
                const price = prices[i];
                const orderDetail = [orderId, bookId, quantity, price];
                orderDetails.push(orderDetail);
                }

                // Chèn dữ liệu vào bảng order_details
                const orderDetailsQuery = "INSERT INTO order_details (order_id, book_id, quantity, price) VALUES ?";
                db.query(orderDetailsQuery, [orderDetails], (error, result) => {
                if (error) {
                    console.error('Error inserting order details:', error);
                    return res.status(500).send('Error inserting order details');
                }
                console.log('đặt hàng thành công')
                res.redirect('/');
            
                });
              
            });
          });
        });
      });

 // Xử lý yêu cầu xoá sản phẩm
app.post('/delete-product/:id', (req, res) => {
    const productId = req.params.id; 
    db.query(`DELETE FROM cart WHERE cart_id = ?`,[productId], (error, result) => {
      if (error) {
        // Xử lý lỗi
        console.log(error);
        res.status(500).send('Lỗi khi xoá sản phẩm');
      } else {
        // Phản hồi thành công
        res.sendStatus(200);
      }
    });
  });







    
module.exports = app;