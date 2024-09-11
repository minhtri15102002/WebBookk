const express = require('express');
const app = express.Router();
const fs = require('fs');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../db');
const path = require('path');
const async = require('async');

const { error } = require('console');
app.use(express.urlencoded());

// Cấu hình Multer để lưu file vào thư mục 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


const isAdmin = (req, res, next) => {
    const username = req.session.username;
    if (username !== 'admin') {
        return res.status(403).send('Bạn không có quyền truy cập');
    }
    next();
};
app.get('/dashboard', isAdmin, (req, res) => {
    const username = req.session.username;

    // Lấy số lượng khách hàng
    db.query('SELECT COUNT(*) AS total_customers FROM users ', [false], (error, customerCountResults) => {
        if (error) {
            throw error;
        }

        // Lấy doanh thu
        db.query('SELECT SUM(total_amount) AS total_revenue FROM orders', (error, revenueResults) => {
            if (error) {
                throw error;
            }

            // Lấy số đơn hàng
            db.query('SELECT COUNT(*) AS total_orders FROM orders', (error, orderCountResults) => {
                if (error) {
                    throw error;
                }

                // Lấy số lượng sách bạn được
                db.query('SELECT COUNT(*) AS total_books FROM books', (error, bookCountResults) => {
                    if (error) {
                        throw error;
                    }
                    
                    // Render trang dashboard và truyền dữ liệu vào view
                    res.render('dashboard', {
                        username: username,
                        totalCustomers: customerCountResults[0].total_customers,
                        totalRevenue: revenueResults[0].total_revenue || 0,
                        totalOrders: orderCountResults[0].total_orders,
                        totalBooks: bookCountResults[0].total_books,
                        jsonData: JSON.stringify({
                            totalCustomers: customerCountResults[0].total_customers,
                            totalRevenue: revenueResults[0].total_revenue || 0,
                            totalOrders: orderCountResults[0].total_orders,
                            totalBooks: bookCountResults[0].total_books
                        })
                    });
                });
            });
        });
    });
});


app.get('/products',isAdmin, (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        db.query('SELECT * FROM books', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('products', { 
                user: userResults[0],
                books: bookResults,
                jsonData: JSON.stringify({ 
                    user: userResults[0],
                    books: bookResults
                })
            });
        });
    });
});

app.get('/add_products',isAdmin, (req, res) => {
    const username = req.session.username;

    res.render('add_products',{username});
})

app.post('/add_products',isAdmin, upload.single('image'), (req, res) => {
  // Lấy dữ liệu từ yêu cầu POST
  if (!req.file) {
    res.status(400).send('No file uploaded');
    return;
  }

  const { title, author, category, price, description} = req.body;
  const image = req.file.filename;
  const imagePath = path.join(__dirname, 'uploads', image);

  // Thực hiện truy vấn để thêm sản phẩm vào cơ sở dữ liệu
  const query = `INSERT INTO books (title, author, category_id, other_book_info, price, img) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(query, [title, author, category, description, price, image], (err, results) => {
    if (err) {
      console.error('Lỗi thêm sản phẩm: ', err);
      res.status(500).send('Lỗi thêm sản phẩm');
      return;
    }

    console.log('Sản phẩm đã được thêm thành công');
    res.status(200).send('Sản phẩm đã được thêm thành công');
  });
});

// Route để hiển thị form chỉnh sửa thông tin sản phẩm
app.get('/edit_product/:id',isAdmin, (req, res) => {
    const productId = req.params.id;
    const username = req.session.username;

    db.query('SELECT * FROM books WHERE book_id = ?', productId, (error, productResult) => {
        if (error) {
            throw error;
        }

        // Render form chỉnh sửa thông tin sản phẩm và truyền thông tin sản phẩm cũ vào view
        res.render('edit_product', 
        { book: productResult[0] , username});
    });
});

// Route để xử lý việc cập nhật thông tin sản phẩm vào cơ sở dữ liệu
app.post('/edit_product/:id',isAdmin, upload.single('image'), (req, res) => {
    const productId = req.params.id;

    // Lấy dữ liệu từ yêu cầu POST
    const { title, author, category, price, description} = req.body;
    let image = req.body.oldImage; // Giữ nguyên tên file ảnh nếu không có file mới được tải lên

    if (req.file) {
        image = req.file.filename;
        const imagePath = path.join(__dirname, 'uploads', image);
        fs.renameSync(req.file.path, imagePath);
    }

    // Thực hiện truy vấn để cập nhật thông tin sản phẩm vào cơ sở dữ liệu
    const query = `UPDATE books SET title=?, author=?, category_id=?, other_book_info=?, price=?, img=? WHERE book_id=?`;
    db.query(query, [title, author, category, description, price, image, productId], (err, results) => {
        if (err) {
            console.error('Lỗi cập nhật thông tin sản phẩm: ', err);
            res.status(500).send('Lỗi cập nhật thông tin sản phẩm');
            return;
        }

        console.log('Thông tin sản phẩm đã được cập nhật thành công');
        res.redirect('/admin/products'); 
    });
});

// Route để xóa sản phẩm từ cơ sở dữ liệu
app.post('/delete_book/:id',isAdmin, (req, res) => {
    const bookId = req.params.id;

    // Thực hiện truy vấn để xóa các dòng từ bảng cart trước
    const deleteCartQuery = `DELETE FROM cart WHERE book_id = ?`;
    db.query(deleteCartQuery, [bookId], (cartErr, cartResults) => {
        if (cartErr) {
            console.error('Lỗi xóa dữ liệu từ bảng cart: ', cartErr);
            res.status(500).send('Lỗi xóa sản phẩm');
            return;
        }

        
        const deleteBookQuery = `DELETE FROM books WHERE id = ?`;
        db.query(deleteBookQuery, [bookId], (bookErr, bookResults) => {
            if (bookErr) {
                console.error('Lỗi xóa sản phẩm từ bảng books: ', bookErr);
                res.status(500).send('Lỗi xóa sản phẩm');
                return;
            }

            console.log('Sản phẩm đã được xóa thành công');
            res.redirect('/admin/products');
        });
    });
});

app.get('/orders', isAdmin, (req, res) => {
    const username = req.session.username;

    // Thực hiện truy vấn để lấy dữ liệu từ bảng orders
    db.query('SELECT * FROM orders', (error, orderResults) => {
        if (error) {
            console.error('Lỗi truy vấn orders: ', error);
            res.status(500).send('Lỗi truy vấn dữ liệu');
            return;
        }

        // Duyệt qua mỗi đơn hàng và thực hiện truy vấn để lấy thông tin người dùng từ user_id
        async.each(orderResults, (order, callback) => {
            const userId = order.user_id;
            db.query('SELECT * FROM users WHERE user_id = ?', userId, (userError, userResults) => {
                if (userError) {
                    callback(userError);
                    return;
                }
                // Gán thông tin người dùng vào đơn hàng
                order.user = userResults[0];
                callback();
            });
        }, (asyncError) => {
            if (asyncError) {
                console.error('Lỗi truy vấn thông tin người dùng: ', asyncError);
                res.status(500).send('Lỗi truy vấn dữ liệu người dùng');
                return;
            }
            // Render trang và truyền dữ liệu từ bảng orders
            res.render('orders', { 
                username: username,
                orders: orderResults
            });
        });
    });
});


// Route để hiển thị chi tiết đơn hàng
app.get('/order_detail/:id', isAdmin, (req, res) => {
    const orderId = req.params.id;
    const username = req.session.username;


    db.query('SELECT * FROM orders WHERE order_id = ?', orderId, (error, orderResult) => {
        if (error) {
            console.error('Lỗi truy vấn thông tin đơn hàng: ', error);
            return res.status(500).send('Lỗi truy vấn dữ liệu đơn hàng');
        }

        
        if (orderResult.length === 0) {
            return res.status(404).send('Không tìm thấy đơn hàng');
        }

        
        db.query('SELECT * FROM order_details WHERE order_id = ?', orderId, (detailError, detailResults) => {
            if (detailError) {
                console.error('Lỗi truy vấn chi tiết đơn hàng: ', detailError);
                return res.status(500).send('Lỗi truy vấn chi tiết đơn hàng');
            }

           
            const bookIds = detailResults.map(detail => detail.book_id);
            console.log(bookIds);
           
            if (bookIds.length === 0) {
                console.log('Không có chi tiết đơn hàng');
                return res.status(404).send('Không có chi tiết đơn hàng');
            }

           
            db.query('SELECT * FROM books WHERE book_id IN (?)', [bookIds], (bookError, bookResults) => {
                if (bookError) {
                    console.error('Lỗi truy vấn thông tin sách: ', bookError);
                    return res.status(500).send('Lỗi truy vấn thông tin sách');
                }

                
                db.query('SELECT * FROM users WHERE user_id = ?', [orderResult[0].user_id], (userError, userResult) => {
                    if (userError) {
                        console.error('Lỗi truy vấn thông tin người dùng: ', userError);
                        return res.status(500).send('Lỗi truy vấn thông tin người dùng');
                    }

                    
                    res.render('order_detail', {
                        username: username,
                        order: orderResult[0],
                        user: userResult[0], 
                        details: detailResults,
                        books: bookResults
                    });
                });
            });
        });
    });
});

app.get('/customers', isAdmin, (req, res) => {
    const username = req.session.username;

    // Thực hiện truy vấn để lấy danh sách khách hàng từ bảng users
    db.query('SELECT * FROM users', (error, customerResults) => {
        if (error) {
            console.error('Lỗi truy vấn danh sách khách hàng: ', error);
            return res.status(500).send('Lỗi truy vấn dữ liệu khách hàng');
        }

        // Truy vấn để tính tổng số hóa đơn và tổng total_amount cho mỗi khách hàng
        const query = `
            SELECT 
                users.user_id,
                users.username,
                users.email,
                users.city,
                COUNT(orders.order_id) AS total_orders,
                SUM(orders.total_amount) AS total_amount
            FROM 
                users
            LEFT JOIN 
                orders ON users.user_id = orders.user_id
            GROUP BY 
                users.user_id, users.username, users.email,users.city
        `;
        db.query(query, (orderError, orderResults) => {
            if (orderError) {
                console.error('Lỗi truy vấn số hóa đơn và tổng total_amount: ', orderError);
                return res.status(500).send('Lỗi truy vấn dữ liệu hóa đơn');
            }
            

            // Render trang và truyền danh sách khách hàng, số hóa đơn và tổng total_amount vào view
            res.render('customers', {
                username: username,
                customers: customerResults,
                orderDetails: orderResults
            });
        });
    });
});


module.exports = app;
