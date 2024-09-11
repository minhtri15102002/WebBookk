
    var sortCheckboxes = document.querySelectorAll('input[name="sort"]');
    sortCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            sortItemsByPrice();
        });
    });

  function sortItemsByPrice() {
    var sortCheckboxes = document.getElementsByName('sort');
    var minPrice, maxPrice;
    var sortType;

    // Lặp qua tất cả các checkbox sắp xếp
    sortCheckboxes.forEach(function (checkbox) {
        if (checkbox.checked) {
            // Lấy giá trị min và max từ thuộc tính data của checkbox được chọn
            minPrice = parseInt(checkbox.getAttribute('data-min-price'));
            maxPrice = parseInt(checkbox.getAttribute('data-max-price'));
            // Lấy giá trị sắp xếp từ thuộc tính value của checkbox được chọn
            sortType = checkbox.value;
        }
    });

    // Lọc sản phẩm theo giá
    var books = document.getElementsByClassName('book');
    var booksArray = Array.from(books);

    var filteredBooks = booksArray.filter(function (book) {
        var priceElement = book.querySelector('.book-info p');
        var price = parseInt(priceElement.innerText.replace('₫', '').replace(',', ''));

        if (minPrice && maxPrice) {
            return price >= minPrice && price <= maxPrice;
        } else if (minPrice && !maxPrice) {
            return price >= minPrice;
        } else if (!minPrice && maxPrice) {
            return price <= maxPrice;
        } else {
            return true;
        }
    });

    // Sắp xếp mảng các phần tử theo giá
    if (sortType === 'ascending') {
        filteredBooks.sort(function (a, b) {
            var priceA = parseInt(a.querySelector('.book-info p').innerText.replace('₫', '').replace(',', ''));
            var priceB = parseInt(b.querySelector('.book-info p').innerText.replace('₫', '').replace(',', ''));
            return priceA - priceB;
        });
    } else if (sortType === 'descending') {
        filteredBooks.sort(function (a, b) {
            var priceA = parseInt(a.querySelector('.book-info p').innerText.replace('₫', '').replace(',', ''));
            var priceB = parseInt(b.querySelector('.book-info p').innerText.replace('₫', '').replace(',', ''));
            return priceB - priceA;
        });
    }

    // Xóa các phần tử hiện tại
    while (books[0]) {
        books[0].parentNode.removeChild(books[0]);
    }

    // Thêm lại các phần tử đã được lọc và sắp xếp vào danh sách
    filteredBooks.forEach(function (book) {
        document.querySelector('.book-list').appendChild(book);
    });
}
    
    var checkboxes = document.querySelectorAll('input[name="cc"]');
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            filterPrice();
        });
    });

    function filterPrice() {
      var checkboxes = document.getElementsByName('cc');
      var minPrice, maxPrice;
    
      // Lặp qua tất cả các checkbox lọc giá
      checkboxes.forEach(function(checkbox) {
          if (checkbox.checked) {
              // Lấy giá trị min và max từ data attribute của checkbox được chọn
              minPrice = parseInt(checkbox.getAttribute('data-min-price'));
              maxPrice = parseInt(checkbox.getAttribute('data-max-price'));
          }
      });
    
      // Lọc sản phẩm theo giá
      var books = document.getElementsByClassName('book');
      for (var i = 0; i < books.length; i++) {
          var book = books[i];
          var priceElement = book.querySelector('.book-info p');
          var price = parseInt(priceElement.innerText.replace('₫', '').replace(',', ''));
        
          // Kiểm tra giá của sách và ẩn/hiển thị tùy theo giá trị min và max
          if (minPrice && maxPrice) {
              if (price >= minPrice && price <= maxPrice) {
                  book.style.display = 'block';
              } else {
                  book.style.display = 'none';
              }
          } else if (minPrice && !maxPrice) {
              if (price >= minPrice) {
                  book.style.display = 'block';
              } else {
                  book.style.display = 'none';
              }
          } else if (!minPrice && maxPrice) {
              if (price <= maxPrice) {
                  book.style.display = 'block';
              } else {
                  book.style.display = 'none';
              }
          } else {
              book.style.display = 'block';
          }
      }
  }
    
    //Search-bar

    $(document).ready(function() {
      $('#search-btn').click(function() {
        search();
      });
    
      $('#search-input').keypress(function(event) {
        if (event.which === 13) {
          search();
        }
      });
    
      function search() {
        var keyword = $('#search-input').val();
        // check if it includes the 'book:' keyword
        if (keyword.includes('book:')) {
          // extract book title from the search query
          var index = keyword.indexOf('book:') + 5;
          var bookTitle = keyword.substring(index);
          window.location.href = '/products/search?book=' + encodeURIComponent(bookTitle);
        } else {
        
          window.location.href = '/products/search?keyword=' + encodeURIComponent(keyword);
        }
      }
    });

    function redirectToCart() {
      window.location.href = "/user/gio-hang";
    }
    $(document).ready(function () {
      function nextSlide() {
        var $carouselInner = $(".carousel-inner");
        $carouselInner.animate(
          { marginLeft: "-33.33%" },
          1000,
          function () {
            $carouselInner.css("margin-left", "0");
            $(".carousel-item:first").appendTo($carouselInner);
          }
        );
      }

      setInterval(nextSlide, 3000);
    });

    document.addEventListener("DOMContentLoaded", function() {
  var searchBtn = document.getElementById("search-btn");
  var searchInput = document.getElementById("search-input");
  
  searchBtn.addEventListener("click", function(event) {
    event.preventDefault();
    performSearch();
  });
  
  searchInput.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      performSearch();
    }
  });
  
  function performSearch() {
    var searchTerm = searchInput.value;
    console.log("Tìm kiếm: " + searchTerm);
    // Thực hiện các hành động tìm kiếm khác tại đây
    }
  });
  const cartButton = document.getElementById('cartIcon');
  cartButton.addEventListener('click', () => {
    console.log('Nút giỏ hàng được bấm!');
  });

  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarMenu = document.querySelector('.navbar-nav');

  




   

    function redirectToCart() {
        window.location.href = "/user/gio-hang";
    }
    // Khai báo biến đếm cho số lượng sản phẩm đã hiển thị
    var displayedCount = 12;

    // Lấy ra danh sách tất cả các sản phẩm
    var allBooks = document.querySelectorAll('.book');

    // Ẩn tất cả các sản phẩm
    allBooks.forEach(function(book) {
        book.style.display = 'none';
    });

    // Hiển thị các sản phẩm đầu tiên (12 sản phẩm)
    for (var i = 0; i < displayedCount; i++) {
        allBooks[i].style.display = 'block';
    }

    // Xử lý sự kiện khi nhấn vào nút "Xem thêm sản phẩm"
    document.getElementById('loadMoreButton').addEventListener('click', function() {
        // Hiển thị thêm 8 sản phẩm mỗi lần
        for (var i = displayedCount; i < displayedCount + 8 && i < allBooks.length; i++) {
            allBooks[i].style.display = 'block';
        }

        // Tăng số lượng sản phẩm đã hiển thị
        displayedCount += 8;

        // Ẩn nút "Xem thêm sản phẩm" nếu đã hiển thị hết tất cả sản phẩm
        if (displayedCount >= allBooks.length) {
            document.getElementById('loadMoreButton').style.display = 'none';
        }
    });
