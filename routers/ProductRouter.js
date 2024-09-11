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



app.get('/all', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        db.query('SELECT * FROM books', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('all', { 
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


app.get('/all', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        db.query('SELECT * FROM books', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('all', { 
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


app.get('/search', (req, res) => {
    const username = req.session.username;
    const keyword = '%' + req.query.keyword + '%';
    
    // Thực hiện câu truy vấn
    db.query('SELECT * FROM books WHERE title LIKE ? OR author LIKE ?', [keyword,keyword], (error, results) => {
      if (error) {
        throw error;
      }
      res.render('search', 
                {user: username,
                books:results});
    });
  });


  // Xử lý yêu cầu lọc giá
  app.post('/filter', (req, res) => {
    const query = req.body.query;
    const params = req.body.params;
  
   
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error executing database query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      
      res.json(results);
    });
  });
app.get('/sach-kinh-doanh', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        // Thay đổi truy vấn SQL ở đây để chỉ lấy các sách có category_id = 1
        db.query('SELECT * FROM books WHERE category_id = 1', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('sach-kinh-doanh', { 
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

app.get('/sach-ky-nang', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        // Thay đổi truy vấn SQL ở đây để chỉ lấy các sách có category_id = 1
        db.query('SELECT * FROM books WHERE category_id = 2', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('sach-ky-nang', { 
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

app.get('/sach-tam-ly-hoc', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        // Thay đổi truy vấn SQL ở đây để chỉ lấy các sách có category_id = 1
        db.query('SELECT * FROM books WHERE category_id = 3', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('sach-tam-ly-hoc', { 
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

app.get('/sach-van-hoc', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        // Thay đổi truy vấn SQL ở đây để chỉ lấy các sách có category_id = 1
        db.query('SELECT * FROM books WHERE category_id = 4', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('sach-van-hoc', { 
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

app.get('/tai-chinh', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        // Thay đổi truy vấn SQL ở đây để chỉ lấy các sách có category_id = 1
        db.query('SELECT * FROM books WHERE category_id = 5', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('tai-chinh', { 
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

app.get('/thieu-nhi', (req, res) => {
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        // Thay đổi truy vấn SQL ở đây để chỉ lấy các sách có category_id = 1
        db.query('SELECT * FROM books WHERE category_id = 6', (error, bookResults) => {
            if (error) {
                throw error;
            }

            res.render('thieu-nhi', { 
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

app.get('/:title', (req, res) => {
    const decodedTitle = decodeURIComponent(req.params.title);
    const username = req.session.username;

    db.query('SELECT * FROM users WHERE username = ?', username, (error, userResults) => {
        if (error) {
            throw error;
        }

        db.query('SELECT * FROM books WHERE title = ?', decodedTitle, (error, results, fields) => {
            if (error) {
                console.error('Error querying database:', error);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (results.length === 0) {
                res.status(404).send('Product not found');
                return;
            }

            const categoryId = results[0].category_id;

            db.query('SELECT * FROM books WHERE category_id = ? AND title != ?', [categoryId, decodedTitle], (error, relatedBooks) => {
                if (error) {
                    console.error('Error querying database:', error);
                    res.status(500).send('Internal Server Error');
                    return;
                }

             
                res.render('product-details', {
                    user: userResults[0],
                    book: results[0],
                    relatedBooks: relatedBooks
                });
            });
        });
    });
});

app.post('/:title', (req, res) => {
   
    const title = decodeURIComponent(req.params.title);

    
    const productId = req.body.productId;
    const userId = req.body.userId;
    const quantity = req.body.quanity;
    
    db.query('INSERT INTO cart (book_id, user_id,quantity) VALUES (?, ?, ?)', [productId, userId,quantity], (error, results) => {
        if (error) {
            console.error('Error inserting into cart:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        res.status(200).send('Đã thêm vào giỏ hàng thành công');
    });
});



module.exports = app;