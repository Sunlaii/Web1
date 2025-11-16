// Ensure only authenticated admin can access this page.
(function ensureAdminAuth() {
    try {
    // read admin session from sessionStorage so admin sign-in does not
    // interfere with public user session on the main site and is cleared
    // when admin closes the browser tab/window
    const userLogin = JSON.parse(sessionStorage.getItem('adminLogin')) || null;
        if (!userLogin || userLogin.role !== 'admin') {
            // Replace page with an error message and link to admin login
            document.documentElement.innerHTML = `
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>Access Denied</title>
                    <style>
                        body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial,Helvetica,sans-serif;background:#111;color:#fff}
                        .box{background:#fff;color:#111;padding:28px;border-radius:10px;max-width:600px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.4)}
                        a{display:inline-block;margin-top:12px;padding:8px 14px;background:#1976d2;color:#fff;border-radius:6px;text-decoration:none}
                    </style>
                </head>
                <body>
                    <div class="box">
                        <h2>Không có quyền truy cập</h2>
                        <p>Bạn phải đăng nhập qua trang quản trị để truy cập khu vực này.</p>
                        <a href="admin-login.html">Đi đến trang Admin Login</a>
                    </div>
                </body>`;
            return ;
        }
    } catch (e) {
        // If parsing localStorage fails, block access as well
        document.documentElement.innerHTML = `<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial,Helvetica,sans-serif;background:#111;color:#fff"><div style="text-align:center"><h2>Không có quyền truy cập</h2><p>Vui lòng đăng nhập qua <a style='color:#4fc3f7' href='admin-login.html'>Admin Login</a></p></div></body>`;
        return ;
    }
})();

/**
 * ensureAdminAuth
 * Kiểm tra session admin (từ sessionStorage). Nếu không tồn tại hoặc không có
 * role === 'admin' thì sẽ thay thế toàn bộ DOM bằng trang thông báo không có
 * quyền truy cập và yêu cầu điều hướng tới trang đăng nhập admin.
 * Lý do: tránh việc người dùng không phải admin truy cập khu vực quản trị.
 */

// Lightweight alert helpers (used across pages). Admin page previously called
// showAlertSuccess/showAlertFailure but didn't include the file that defines
// them. Define minimal versions here so the Add Shoes flow can show alerts.
let alertTimeout;
function showAlert() {
    const el = document.getElementById('alert');
    if (!el) return;
    el.classList.add('active');
    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(closeAlert, 2000);
}
function closeAlert() {
    const el = document.getElementById('alert');
    if (!el) return;
    el.classList.remove('active');
}
function showAlertSuccess(message) {
    const msgEl = document.getElementById('alertMessage');
    const titleEl = document.querySelector('.alertTitle');
    const root = document.getElementById('alert');
    if (msgEl) msgEl.innerText = message || '';
    if (titleEl) titleEl.innerText = 'Success';
    if (root) root.classList.add('alertSuccess');
    showAlert();
    if (root) setTimeout(() => root.classList.remove('alertSuccess'), 2000);
}
function showAlertFailure(message) {
    const msgEl = document.getElementById('alertMessage');
    const titleEl = document.querySelector('.alertTitle');
    const root = document.getElementById('alert');
    if (msgEl) msgEl.innerText = message || '';
    if (titleEl) titleEl.innerText = 'Fail';
    if (root) root.classList.add('alertFailure');
    showAlert();
    if (root) setTimeout(() => root.classList.remove('alertFailure'), 2000);
}

const Content = document.getElementById('Content');
const Contentcontainer = document.getElementById('Content-Container');

let LOW_STOCK_THRESHOLD = 5;
let currentPage = 1;
const itemsPerPage = 8;
// If localStorage 'Products' is empty, load initial data from product.json
/**
 * initProductsIfEmpty
 * Nếu localStorage chưa có key 'Products', đọc file product.json một lần và
 * lưu dữ liệu khởi tạo vào localStorage để trang admin có dữ liệu mẫu.
 * Trả về Promise để caller có thể await trước khi render giao diện.
 */
const initProductsIfEmpty = () => {
    return new Promise((resolve) => {
        try {
            const products = JSON.parse(localStorage.getItem('Products')) || [];
            if (products.length > 0) return resolve();
            // fetch the product.json from parent folder
            fetch('../product.json')
                .then(res => res.json())
                .then(data => {
                    // ensure numeric Price and Id fields are consistent types
                    const normalized = data.map(p => ({
                        ...p,
                        Id: p.Id,
                        Price: typeof p.Price === 'string' ? parseFloat(p.Price) : p.Price
                    }));
                    localStorage.setItem('Products', JSON.stringify(normalized));
                    resolve();
                }).catch(err => {
                    console.warn('Could not load product.json into localStorage:', err);
                    resolve();
                });
        } catch (e) {
            console.warn('initProductsIfEmpty error', e);
            resolve();
        }
    });
};

window.onload = async ()=> {
    await initProductsIfEmpty();
    const defaultItem = document.querySelector('.Action .TongHop');
    removeActiveClass(); 
    defaultItem.classList.add('active'); 
    RenderTongHop(); 
};
document.querySelector('.Action').addEventListener('click', (e) => {
    const target = e.target.closest('li');
    if (!target) return;

    // Remove active class from all
    document.querySelectorAll('.Action li').forEach(item => {
        item.classList.remove('active');
    });
    target.classList.add('active');

    // Render content based on clicked item
    switch (true) {
        case target.classList.contains('TongHop'):
            RenderTongHop();
            break;
        case target.classList.contains('SanPham'):
            RenderSanPham();
            break;
        case target.classList.contains('KhachHang'):
            RenderKhachHang();
            break;
        case target.classList.contains('DonHang'):
            RenderDonHang();
            break;
        case target.classList.contains('NhapHang'):
            RenderNhapHang();
            break;
        case target.classList.contains('GiaBan'):
            RenderGiaBan();
            break;
        case target.classList.contains('TonKho'):
            RenderTonKho();
            break;

        case target.classList.contains('ThongKe'):
                RenderThongKe();
                break;
    }
}); 
const removeActiveClass = () => {
    document.querySelectorAll('.SideBar li').forEach(item => {
        item.classList.remove('active');
    });
};
/**
 * RenderTongHop
 * Hiển thị dashboard tổng hợp (số lượng khách hàng, sản phẩm, đơn hàng, doanh thu).
 * Gọi các hàm tính toán để cập nhật số liệu và ẩn phần phân trang khi cần.
 */
const RenderTongHop = () => {
    Content.innerHTML = `
        <div class="trangTongQuan" style="width: 100%;">
            <div class="header-admin">
                <h1>TỔNG HỢP</h1>
            </div>
            <div style="display: flex; position: relative;width: 100%; ">
                <div class="cards">
                    <!-- Khach Hang -->
                    <div class="card-single">
                        <div class="box">
                            <h2 class="display-user-count" id="soLuongKhach"></h2>
                            <div class="on-box">
                                <img src="../anh/image-TH/users.png" alt="" style="width: 120px;">
                                <h3>KHÁCH HÀNG</h3>
                            </div>
                        </div>
                    </div>
                    <!-- San Pham -->
                    <div class="card-single">
                        <div class="box">
                            <div class="on-box">
                                <h2 class="display-product-count" id="soLuongSanPham"></h2>
                                <img src="../anh/image-TH/product.png" alt="" style="width: 120px;">
                                <h3>SẢN PHẨM</h3>
                            </div>
                        </div>
                    </div>
                    <!-- Don Hang (Updated) -->
                    <div class="card-single">
                        <div class="box">
                            <h2 class="display-total-income" id="soLuongDon"></h2>
                            <div class="on-box">
                                <img src="../anh/image-TH/order.png" alt="" left="100px"style="width: 120px;">
                                <h3>ĐƠN HÀNG</h3>
                            </div>
                        </div>
                    </div>
                    <!-- Doanh Thu -->
                    <div class="card-single">
                        <div class="box">
                            <h2 class="display-total-income" id="DoanhThuTong"></h2>
                            <div class="on-box">
                                <img src="../anh/image-TH/income.png" alt="" style="width: 120px;">
                                <h3>DOANH THU</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    SoluongSanPhamTong();
    DoanhThuTong();
    SoLuongDonTong();
    SoluongKhachHang();
    document.getElementById('pagination-controls').style.display="none"
    Contentcontainer.style.display="none";
};
const SoluongKhachHang =()=>{
    const user = JSON.parse(localStorage.getItem('Users'))||[];
    let temp = user.length;
    document.getElementById('soLuongKhach').innerText = temp;
}
const DoanhThuTong = () => {
    const CheckOut = JSON.parse(localStorage.getItem('CheckOut')) || [];
    let temp = 0; // Initialize temp to 0
    CheckOut.forEach(p => {
        temp += p.totalprice ; // Ensure totalPrice is valid
    });
    document.getElementById('DoanhThuTong').innerText = `${temp} $`; // Format as a localized string
};

// =============== LOẠI SẢN PHẨM: CHỈ LƯU TÊN, THÊM / SỬA / XÓA ===============
const CATEGORY_KEY = 'Categories';
let categories = JSON.parse(localStorage.getItem(CATEGORY_KEY)) || [];

function saveCategories() {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function renderCategories() {
    const tbody = document.getElementById('category-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!categories || categories.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align:center;">Chưa có loại nào</td>
            </tr>
        `;
        return;
    }

    categories.forEach((name, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${name}</td>
            <td>
                <button type="button" onclick="editCategory(${index})">Sửa</button>
                <button type="button" onclick="deleteCategory(${index})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
function renderCategoryOptions() {
    const filterSelect = document.getElementById('ShoesProduct'); // combobox lọc trên cùng
    const modalSelect  = document.getElementById('Category');     // combobox trong modal thêm sp

    // Cập nhật combobox lọc
    if (filterSelect) {
        filterSelect.innerHTML =
            '<option value="All">All</option>' +
            categories.map(name => `<option value="${name}">${name}</option>`).join('');
    }

    // Cập nhật combobox trong modal thêm giày
    if (modalSelect) {
        modalSelect.innerHTML =
            categories
                .map((name, idx) =>
                    `<option value="${name}" ${idx === 0 ? 'selected' : ''}>${name}</option>`
                )
                .join('');
    }
}


function initCategoryUI() {
    const btnSave = document.getElementById('btn-category-save');
    const btnCancel = document.getElementById('btn-category-cancel');
    const inputName = document.getElementById('category-name-input');
    const hiddenIndex = document.getElementById('category-edit-index');

    if (!btnSave || !inputName || !hiddenIndex) return;

    // Thêm / Lưu
    btnSave.onclick = function () {
        const name = inputName.value.trim();
        if (!name) {
            alert('Tên loại không được rỗng');
            return;
        }

        const idx = Number(hiddenIndex.value);

        if (idx >= 0) {
            // đang sửa
            categories[idx] = name;
        } else {
            // thêm mới
            categories.push(name);
        }

        saveCategories();
        renderCategories();
        renderCategoryOptions();  

        // reset form
        inputName.value = '';
        hiddenIndex.value = -1;
        btnSave.textContent = 'Thêm / Lưu';
        if (btnCancel) btnCancel.style.display = 'none';
    };

    // Hủy
    if (btnCancel) {
        btnCancel.onclick = function () {
            inputName.value = '';
            hiddenIndex.value = -1;
            btnSave.textContent = 'Thêm / Lưu';
            btnCancel.style.display = 'none';
        };
    }
}

function editCategory(index) {
    const inputName = document.getElementById('category-name-input');
    const hiddenIndex = document.getElementById('category-edit-index');
    const btnSave = document.getElementById('btn-category-save');
    const btnCancel = document.getElementById('btn-category-cancel');

    if (!inputName || !hiddenIndex || !btnSave || !btnCancel) return;

    inputName.value = categories[index];
    hiddenIndex.value = index;
    btnSave.textContent = 'Lưu';
    btnCancel.style.display = 'inline-block';
}

function deleteCategory(index) {
    if (!confirm('Xóa loại này?')) return;

    categories.splice(index, 1);
    saveCategories();
    renderCategories();
    renderCategoryOptions(); 
}
function ensureDefaultCategories() {
    if (!categories || categories.length === 0) {
        categories = [
            'Basketball',
            'Football',
            'Running',
            'Gym',
            'Skateboarding'
        ];
        saveCategories();
    }
}

//===== QUẢN LÝ NHẬP HÀNG =====
const IMPORT_KEY = 'ImportReceipts'; // Mảng các phiếu nhập hàng

function getImportReceipts() {
    return JSON.parse(localStorage.getItem(IMPORT_KEY)) || [];
}

function saveImportReceipts(list) {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(list));
}
//===== QUẢN LÝ GIÁ BÁN =====
const PROFIT_CATEGORY_KEY = 'ProfitByCategory'; // { "Basketball": 20, "Running": 25, ... }

function loadProfitCategory() {
    return JSON.parse(localStorage.getItem(PROFIT_CATEGORY_KEY)) || {};
}

function saveProfitCategory(obj) {
    localStorage.setItem(PROFIT_CATEGORY_KEY, JSON.stringify(obj));
}




/**
 * RenderSanPham
 * Hiển thị giao diện quản lý sản phẩm: combobox lọc, ô tìm kiếm, nút New Shoes,
 * bảng quản lý loại sản phẩm, và modal thêm sản phẩm (modal được render tĩnh
 * trong template này). Gọi UpLoadImage và SearchAndRender để kích hoạt logic.
 */
const RenderSanPham = () => {
    Content.innerHTML = `
    <div class="trangSanpham" style="position: relative; left: 50px; height:50px;">
        <div style="display:flex;margin-top: 20px;justify-content: space-between;align-items:center;width:85%;margin-left:40px">
            <select name="Shoes" id="ShoesProduct" class="Shoes">
                <option value="All">All</option>
                <option value="Basketball">BasketBall</option>
                <option value="FootBall">FootBall</option>
                <option value="Running">Running</option>
                <option value="Gym">Gym</option>
                <option value="Skateboarding">Skateboarding</option>
            </select>
            <div class="Find">
                <input type="text" id="inputProduct" placeholder="Tim Kiem Ten Giay..."/>
                <i class="fa fa-magnifying-glass"></i>
            </div>
            <div>
                <button onClick="Reset()"><i class="fa fa-arrow-rotate-right"></i> Làm mới</button>
                <button type="button" data-toggle="modal" data-target="#exampleModal"><i class="fa fa-plus"></i> New Shoes</button>
            </div>
        </div>
    </div>

    <!-- QUẢN LÝ LOẠI SẢN PHẨM (CHỈ TÊN + THÊM / SỬA / XÓA) -->
    <div class="box" id="category-box" style="position: relative; left: 50px; width:85%; margin-top:20px;">
        <h3>Loại sản phẩm</h3>

        <div class="form-inline" style="margin-bottom: 10px;">
            <input type="hidden" id="category-edit-index" value="-1">
            <input type="text" id="category-name-input" class="form-control" placeholder="Nhập tên loại" style="width: 250px; margin-right: 8px;">
            <button type="button" id="btn-category-save" class="btn btn-primary btn-sm">Thêm / Lưu</button>
            <button type="button" id="btn-category-cancel" class="btn btn-secondary btn-sm" style="display:none;margin-left:4px;">Hủy</button>
        </div>

        <table class="table table-bordered table-sm">
            <thead>
                <tr>
                    <th style="width: 10%;">#</th>
                    <th>Tên loại</th>
                    <th style="width: 25%;">Hành động</th>
                </tr>
            </thead>
            <tbody id="category-tbody">
                <!-- JS render -->
            </tbody>
        </table>
    </div>

    <!-- PHẦN MODAL SẢN PHẨM CŨ GIỮ NGUYÊN -->
    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-headerr">
            <button type="button" style="box-shadow:none;width:50px;" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form class="row g-3 modal-form">
              <div style="border-right:2px solid;width:300px;display:flex;justify-content:center;align-items:center;flex-direction: column;padding-right:10px;row-gap:20px;height:380px;"> 
                <div class="img-preview" id="imgPreview">
                    <span style="display: block;" id="Span">No image uploaded</span>
                    <img style="display: none;" id="imagePreview" alt="Image Preview"/>
                </div>
                <div>
                    <label class="form-label label-upload" for="labelUpload">
                        Upload File Image
                    </label>
                    <input type="file" id="labelUpload" hidden />
                </div>
              </div>       
              <div style="width:440px;">
                <div class="col-md-6">
                  <label class="form-label">Product Name</label>
                  <input type="text" id="Product-name" class="form-control" style="width:350px" placeholder="Nhập tên Giày" />
                </div>
                <div class="col-md-6 Color">
                  <label class="form-label">Phân Loại: </label>
                  <select class="form-select" id="Category">
                    <option defaultValue="Basketball">Basketball</option>
                    <option value="Football">Football</option>
                    <option value="Running">Running</option>
                    <option value="Gym">Gym</option>
                    <option value="Skateboarding">Skateboarding</option>
                  </select>
                </div>
               <div class="col-md-6">
                <label class="form-label">Sizes</label>
                <div id="sizeContainer" style="display: flex; flex-wrap: wrap; gap: 5px;" class="Size">
                    <!-- Các button size từ 35 đến 45 -->
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="35">35</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="36">36</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="37">37</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="38">38</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="39">39</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="40">40</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="41">41</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="42">42</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="43">43</button>
                    <button type="button" class="btn btn-outline-primary size-btn" data-size="44">44</button>
                </div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Price</label>
                  <input type="text" id="Price" class="form-control" style="width:350px" placeholder="Nhập Giá Tiền"/>
                </div>
                <div class="col-md-6 Color">
                  <label class="form-label">Color: </label>
                  <select class="form-select" id="Color">
                    <option defaultValue="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="White">White</option>
                    <option value="Blue">Blue</option>
                    <option value="Gray">Gray</option>
                    <option value="Green">Green</option>
                  </select>
                </div>
              </div>
            </form>
            
          <div class="col-md-12 ImageSmall">
            ${[...Array(4).keys()].map(i => `
              <div class="image-container"> 
                <div class="img-preview">
                  <span id="Span${i + 1}">No Image ${i + 1}</span>
                  <img id="imagePreview${i + 1}" alt="Image Preview ${i + 1}" style="display:none;" />
                </div>
                <label class="form-label label-upload" for="labelUpload${i + 1}">
                  Upload File Image
                </label>
                <input type="file" id="labelUpload${i + 1}" />
              </div>
            `).join('')}
          </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="SaveChange">Add Shoes</button>
          </div>
        </div>
      </div>
    </div>
  `;

    UpLoadImage();                               
    SearchAndRender('Products',currentPage,itemsPerPage); 

    // khởi tạo UI loại
    ensureDefaultCategories(); 
    renderCategories();
    initCategoryUI();
    renderCategoryOptions();
};


const RenderKhachHang = () => {
    Content.innerHTML = `<div class="trangKhachHang" style="position: relative; left: 70px; height:50px;">
    <div style="display:flex;margin-top: 20px;justify-content: space-between;align-items:center;width:85%;margin-left:40px">
        <select name="Shoes" id="UsersSelect" class="Shoes">
            <option value="All">All</option>
            <option value="Hoat Dong"">Online</option>
            <option value="Da Khoa">Offline</option>
          </select>
            <div class="Find">
                <input type="text" id="inputUsers" placeholder="Tim Kiem Ten Khach..."/>
                <i class="fa-sharp-duotone fa-solid fa-magnifying-glass"></i>
            </div>
             <div class="KhachHangAction">
             <span>Từ  </span>
             <input style='padding:5px 5px 5px 10px;border-radius:10px;font-size:17px;' id="UserA1" type="date"/>
             <span>Đến  </span>
             <input style='padding:5px 5px 5px 10px;border-radius:10px;font-size:17px;' id="UserA2" type="date"/>
            <button type="button" style="width:50px;" id="dangky"><i class="fa fa-plus"></i> </button>
            <button onClick="ResetUser()" style="width:50px "><i class="fa-sharp fa-solid fa-arrow-rotate-right"></i> </button>
            </div>
    </div>
    </div>`;

    Contentcontainer.innerHTML = `<table class="Table " style="width:100%;left:50px;position:relative; border-collapse: collapse; font-family: Arial, sans-serif; transition: all 0.5s;">
   <thead>
    <tr style="background-color: #800020;color: white; text-align: left;">
            <th style="width:12%; padding: 12px;">Id</th>
            <th style="width:20%; padding: 12px;">Name</th>
            <th style="width:15%; padding: 12px;">SDT</th>
            <th style="width:15%; padding: 12px;">Date in</th>
            <th style="width:15%; padding-left: 30px;">Status</th>
            <th style="padding-left: 65px;">Action</th>
        </tr>
    </thead>
    <tbody id="UserTable">
    </tbody>
    </table>`;
    AddUser();
    SearchAndRender('Users',currentPage,itemsPerPage);
};
const AddUser = ()=>{
    const dangKy = document.querySelector('#dangky');
    const close = document.querySelector('.icon-close');
    let users = JSON.parse(localStorage.getItem("Users")) || [];
    const fullname = document.querySelector('#register-username');
    const phone = document.querySelector('#register-phone');
    const password = document.querySelector('#register-password');
    const confirmPassword = document.querySelector('#cf-password');
    const registerForm = document.querySelector('#form-register');
    dangKy.addEventListener('click', (e) => {
        e.preventDefault();
        // Open the same modal used for editing, but in Add mode
        ModalUser(null, 'Add');
    });
    close.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.classList.remove('active-popup');
        document.body.classList.remove('no-scroll');
        document.getElementById('overlay').style.display = 'none';
    });
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isEmptyError = checkEmptyError([fullname, phone, password, confirmPassword]);
        let isFullnameLengthError = checkLengthError(fullname, 3, 10);
        let isPasswordLengthError = checkLengthError(password, 3, 10);
        let isConfirmPasswordError;
        let isPhoneLengthError = checkPhoneLengthError(phone);
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        const user = {
                    userId: Math.ceil(Math.random() *100000), 
                    date: formattedDate,
                    username: fullname.value,
                     phone: phone.value, 
                     password: password.value, 
                     email: "", 
                     address: "",
                     status: "Hoat Dong",
                     role:"admin",
                     Cart: [],
                     ProductBuy:[]
                    }
        // Kiểm tra mật khẩu xác nhận
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Mật khẩu xác nhận không khớp!');
            isConfirmPasswordError = true;
        } else {
            showSuccess(confirmPassword);
        }
        // Kiểm tra tên đăng nhập đã tồn tại
        if (users.some(user => user.username === fullname.value)) {
            showError(fullname, 'Tên đăng nhập đã tồn tại!');
        } else if (!isEmptyError && !isFullnameLengthError && !isPasswordLengthError && !isPhoneLengthError && !isConfirmPasswordError) {
            // Nếu không có lỗi, lưu thông tin vào mảng users
            users.push(user);
            // alert("Đăng ký thành công!");
            showAlertSuccess("Đăng ký thành công!")
            // Lưu lại danh sách người dùng vào localStorage
            localStorage.setItem("Users", JSON.stringify(users));
            SearchAndRender('Users',currentPage,itemsPerPage);
            console.log("Cập nhật danh sách người dùng:", users);
    
            wrapper.classList.remove('active');
            wrapper.style.display="none"
            overlay.style.display="none"
            // Reset form sau khi đăng ký thành công
            registerForm.reset();
        }
    }
);

}
/**
 * UpLoadImage
 * - Gắn các listener cho input file (ảnh chính + ảnh chi tiết).
 * - Quản lý lựa chọn size, thu thập dữ liệu form.
 * - Đăng ký handler cho nút "Add Shoes" để đọc file tại thời điểm click,
 *   nén/resize ảnh, và lưu sản phẩm mới vào localStorage.
 * Lưu ý: handler đã được harden để chống duplicate listeners và xử lý quota.
 */
const UpLoadImage = () => {
    let btnSave = document.getElementById('SaveChange');

    // Dữ liệu form
    const Productname = document.getElementById('Product-name');
    const Price = document.getElementById('Price');
    const Category = document.getElementById('Category');
    const Color = document.getElementById('Color');
    const ProductLocal = JSON.parse(localStorage.getItem("Products")) || [];

    // Xử lý ảnh chính
    let mainImage = "";
    const mainLabelUpload = document.getElementById('labelUpload');
    const mainImagePreview = document.getElementById('imagePreview');
    const mainSpan = document.getElementById('Span');

    mainLabelUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) {
            mainSpan.style.display = "block";
            mainImagePreview.style.display = "none";
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                mainImage = e.target.result; // Lưu URL ảnh chính
                mainImagePreview.src = e.target.result;
                mainImagePreview.style.display = 'block';
                mainSpan.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // Lưu ảnh nhỏ
    const imgDetail = [];
    for (let i = 1; i <= 4; i++) {
        const inputId = `labelUpload${i}`;
        const previewId = `imagePreview${i}`;
        const spanId = `Span${i}`;

        const labelUpload = document.getElementById(inputId);
        const imagePreview = document.getElementById(previewId);
        const span = document.getElementById(spanId);

        labelUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) {
                span.style.display = "block";
                imagePreview.style.display = "none";
            } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    span.style.display = 'none';
                    imgDetail[i - 1] = e.target.result; // Lưu ảnh vào mảng
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Xử lý chọn kích cỡ
    const selectedSizes = [];
    document.querySelectorAll('.size-btn').forEach(button => {
        button.addEventListener('click', function () {
            const size = this.getAttribute('data-size');

            // Kiểm tra nếu kích cỡ đã được chọn thì loại bỏ, nếu chưa thì thêm vào
            if (selectedSizes.includes(size)) {
                selectedSizes.splice(selectedSizes.indexOf(size), 1); // Xóa khỏi mảng nếu đã chọn
                this.classList.remove('btn-primary-selected'); // Loại bỏ lớp đã chọn
                this.classList.add('btn-outline-primary'); // Thêm lớp chưa chọn
            } else {
                selectedSizes.push(size); // Thêm vào mảng nếu chưa chọn
                this.classList.remove('btn-outline-primary'); // Loại bỏ lớp chưa chọn
                this.classList.add('btn-primary-selected'); // Thêm lớp đã chọn
            }
        });
    });

    // Replace the save button node to avoid duplicate listeners when modal is
    // re-rendered. Then attach a single robust click handler that reads files
    // at click-time (more reliable than depending on earlier FileReader side
    // effects).
    if (btnSave) {
        const replacement = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(replacement, btnSave);
        btnSave = replacement;
    }

    // Read file and resize/compress to reduce storage size. Returns a JPEG dataURL.
    /**
     * readFileAsDataURL
     * Đọc file ảnh, resize/compress xuống kích thước tối đa (maxSize) và trả về
     * một dataURL JPEG. Trả về original dataURL nếu không thể xử lý ảnh.
     * @param {File} file - file ảnh từ input
     * @param {number} maxSize - kích thước cạnh lớn nhất (px)
     * @param {number} quality - chất lượng JPEG (0..1)
     * @returns {Promise<string|undefined>} dataURL hoặc undefined nếu no file
     */
    const readFileAsDataURL = (file, maxSize = 1024, quality = 0.7) => new Promise((resolve, reject) => {
        if (!file) return resolve(undefined);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // calculate new size keeping aspect ratio
                    let { width, height } = img;
                    const maxDim = Math.max(width, height);
                    if (maxDim > maxSize) {
                        const scale = maxSize / maxDim;
                        width = Math.round(width * scale);
                        height = Math.round(height * scale);
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    // convert to jpeg to reduce size
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                } catch (err) {
                    // fallback: return original data URL
                    console.warn('Image resize/compress failed, using original', err);
                    resolve(ev.target.result);
                }
            };
            img.onerror = () => {
                // cannot create image -> fallback
                resolve(ev.target.result);
            };
            img.src = ev.target.result;
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });

    btnSave.addEventListener('click', async () => {
        try {
            if (!Productname.value.trim()) return showAlertFailure("Vui lòng nhập tên sản phẩm!");

            // normalize price (allow comma or dot) and validate
            const rawPrice = (Price.value || '').toString().trim().replace(/,/g, '.');
            const numericPrice = parseFloat(rawPrice);
            if (!rawPrice || Number.isNaN(numericPrice) || numericPrice <= 0) {
                return showAlertFailure("Vui lòng nhập giá tiền hợp lệ (là một số dương)!");
            }

            if (!Category.value.trim()) return showAlertFailure("Vui lòng chọn danh mục sản phẩm!");
            if (selectedSizes.length === 0) return showAlertFailure("Vui lòng chọn kích cỡ!");

            // read current file inputs at click time
            const mainFile = document.getElementById('labelUpload')?.files?.[0];
            if (!mainFile) return showAlertFailure("Vui lòng tải lên ảnh chính!");

            const smallFiles = [];
            for (let i = 1; i <= 4; i++) {
                const f = document.getElementById(`labelUpload${i}`)?.files?.[0];
                smallFiles.push(f);
            }
            if (smallFiles.some(f => !f)) return showAlertFailure("Vui lòng tải lên đủ 4 ảnh nhỏ!");

            // read files to dataURLs
            const [mainDataUrl, ...smallDataUrls] = await Promise.all([
                readFileAsDataURL(mainFile),
                ...smallFiles.map(f => readFileAsDataURL(f))
            ]);

            // build product object
            const newProduct = {
                Id: getNextProductId(),
                ProductName: Productname.value.trim(),
                Colour: Color.value.trim(),
                Price: numericPrice,
                Category: Category.value.trim(),
                image: mainDataUrl,
                imgDetail: smallDataUrls,
                Size: selectedSizes.slice() // copy
            };
            function getNextProductId() {
            const products = JSON.parse(localStorage.getItem('Products')) || [];
            if (!products.length) return 1; // nếu chưa có sản phẩm nào thì bắt đầu từ 1

            const maxId = Math.max(...products.map(p => Number(p.Id) || 0));
            return maxId + 1;               // cộng dần lên
            }
            

            // save (guard against storage quota)
            ProductLocal.push(newProduct);
            try {
                localStorage.setItem('Products', JSON.stringify(ProductLocal));
            } catch (quotaErr) {
                console.error('Saving Products failed (quota exceeded):', quotaErr);
                // revert in-memory push
                ProductLocal.pop();
                // Suggest alternatives to the user
                showAlertFailure('Không đủ dung lượng lưu trữ trình duyệt. Hãy xoá bớt sản phẩm/ảnh hoặc chuyển sang giải pháp lưu trữ khác (IndexedDB hoặc server).');
                return;
            }
            showAlertSuccess("Thêm Giày Thành Công!");

            // Reset UI
            Productname.value = "";
            Color.value = "";
            Price.value = "";
            mainImage = "";
            mainImagePreview.src = "";
            mainImagePreview.style.display = 'none';
            mainSpan.style.display = 'block';

            for (let i = 1; i <= 4; i++) {
                const imagePreview = document.getElementById(`imagePreview${i}`);
                const span = document.getElementById(`Span${i}`);
                if (imagePreview) imagePreview.src = "";
                if (imagePreview) imagePreview.style.display = 'none';
                if (span) span.style.display = 'block';
                const fileInput = document.getElementById(`labelUpload${i}`);
                if (fileInput) fileInput.value = ""; // clear file input
            }

            selectedSizes.length = 0;
            document.querySelectorAll('.size-btn').forEach(button => {
                button.classList.remove('btn-primary-selected');
                button.classList.add('btn-outline-primary');
            });

            SearchAndRender('Products', currentPage, itemsPerPage);
        } catch (err) {
            console.error('Error adding product:', err);
            showAlertFailure('Lỗi khi thêm sản phẩm. Kiểm tra console.');
        }
    });
};
const Reset = ()=>{
    document.getElementById('ShoesProduct').value = "All";
    document.getElementById('inputProduct').value = "";
    SearchAndRender('Products',currentPage,itemsPerPage)
}
const ResetUser = ()=>{
    document.getElementById('UsersSelect').value = "All";
    document.getElementById('inputUsers').value = "";
    document.getElementById('UserA1').value = "";
    document.getElementById('UserA2').value = ""
    SearchAndRender('Users',currentPage,itemsPerPage)
}
const ResetDon = ()=>{
    document.getElementById('Shoes').value = "All";
    document.getElementById('city-select').value ="";
    document.getElementById('ward-select').value ="";
    document.getElementById('district-select').value = ""
    document.getElementById('DonHangA1').value="";
    document.getElementById('DonHangA2').value="";
    SearchAndRender('CheckOut',currentPage,itemsPerPage)
}
    /**
     * renderPage
     * Render các item cho một kiểu dữ liệu (Products, Users, CheckOut) trên
     * trang hiện tại. Sử dụng createRowForType để tạo từng block/row và gọi
     * renderPaginationControls để hiển thị điều khiển phân trang.
     */
    const renderPage = (dataType, page, itemsPerPage, filterRender) => {
    const container = document.getElementById('Content-Container');
    const userTable = document.getElementById('UserTable');
    const CheckOutTable = document.getElementById('CheckOutTable');
    const totalPages = Math.ceil(filterRender.length / itemsPerPage);

    // Giới hạn trang
    page = Math.max(1, Math.min(page, totalPages));

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = filterRender.slice(start, end);

    // Hiển thị dữ liệu
    if (dataType === 'Products') {
        container.innerHTML = "";
        currentItems.forEach((item) => {
            const row = createRowForType(dataType, item);
            container.insertAdjacentHTML('beforeend', row);
        });
    } else if (dataType === 'Users') {
        userTable.innerHTML = "";
        currentItems.forEach((item) => {
            const row = createRowForType(dataType, item);
            userTable.insertAdjacentHTML('beforeend', row);
        });
    }
    else if(dataType === 'CheckOut'){
        CheckOutTable.innerHTML="";
        currentItems.forEach((item)=>{
            const row = createRowForType(dataType,item);
            CheckOutTable.insertAdjacentHTML('beforeend',row);
        })
    }

    // Render phân trang
    renderPaginationControls(dataType, page, totalPages, filterRender, itemsPerPage);
};
/**
 * createRowForType
 * Tạo HTML block/row cho từng đối tượng theo kiểu dataType. Trả về chuỗi
 * HTML để được chèn vào DOM bởi renderPage.
 */
const createRowForType = (dataType, item) => {
    switch (dataType) {
        case 'Products':
            return `
                 <div class="Shopping-item" style="position:relative;left:30px;background:#fff;margin-top:10px;border:1px #fff;">
                <div class="Shopping-image">
                    <img src="${item.image}" alt=""/>
                </div>
                <div class="Item-content">
                    <div class="Shopping-Start">
                        <span class="Title" style='display: block;color: #424141;font-size: 25px;font-weight:600'>${item.ProductName}</span>
                        <div class="Price" style="font-size: 20px;font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;font-weight: 500;color: #dc3545;">${item.Price} $</div>
                    </div>
                    <div class="Category">Category: ${item.Category}</div>
                    <div class="Color d-flex">
                        <span>Color: ${item.Colour}</span>
                    </div>
                    <div class="Actions">
                        <i class="fa-thin fa-pen-to-square" style="font-weight:400;" onclick="ModalProduct(${item.Id},'Update')"></i>
                        <i class="fa-solid fa-trash-can" style="font-weight:400;" onclick="ModalProduct(${item.Id},'Delete')"></i>
                    </div>
                </div>
            </div>`;
        case 'Users':
    return `  <tr  style="border-bottom: 1px solid #ddd; background-color: #fff;">
        <td style="padding: 10px;">${item.userId}</td>
        <td style="padding: 10px;">${item.username}</td>
        <td style="padding: 10px;">${item.phone}</td>
        <td style="padding: 10px;">${item.date}</td>
        <td style="padding: 10px;">
            ${item.status=="Hoat Dong"
                ? `<button style="width: 100px; background-color: green; color: white; border: none; padding: 8px; border-radius: 4px;">Online</button>`
                : `<button style="width: 100px; background-color: red; color: white; border: none; padding: 8px; border-radius: 4px;">Offline</button>`
            }
        </td>
        <td style="padding: 10px; display: flex; gap: 10px;">
            <button onClick="ModalUser(${item.userId},'Edit')" style="width: 80px; border: none; background-color: #2196F3; color: white; padding: 8px; border-radius: 4px;">Edit</button>
            <button onClick="ModalUser(${item.userId},'Delete')" style="width: 80px; border: none; background-color: #ffc107; color: black; padding: 8px; border-radius: 4px;">Delete</button>
            <button onClick="resetUserPassword(${item.userId})" style="width: 110px; border: none; background-color: #6f42c1; color: #fff; padding: 8px; border-radius: 4px;">Reset PW</button>
            <button onClick="toggleUserStatus(${item.userId})"
                style="width: 90px; border: none; background-color: ${item.status=='Hoat Dong' ? '#dc3545' : '#198754'}; color: #fff; padding: 8px; border-radius: 4px;">
                ${item.status=='Hoat Dong' ? 'Khóa' : 'Mở'}
            </button>
        </td>
    </tr>`;

        case 'CheckOut':
            return `
        <tr style="border-bottom: 1px solid #ddd; background-color: #fff; color: black;">
            <td style="padding: 10px;">${item.orderId}</td>
            <td style="padding: 10px;">${item.fullname}</td>
            <td style="padding: 10px;">${item.totalprice}</td>
            <td style="padding: 10px;">${item.date}</td>
            <td style="padding: 10px;">
            ${
                typeof item.status === "number"
                    ? item.status === 0
                        ? `<button style="width: 120px; background-color: #d8e218ca; color: black; border: none; padding: 8px; border-radius: 20px;">Processing</button>`
                        : item.status === 2
                        ? `<button style="width: 120px; background-color: #f8450fca; color: black; border: none; padding: 8px; border-radius: 20px;">Cancel</button>`
                        : item.status === 1
                        ? `<button style="width: 120px; background-color: #0f9408ca; color: black; border: none; padding: 8px; border-radius: 20px;">Received</button>`
                        : `<button style="width: 120px; background-color: #5bc2e4ca; color: black; border: none; padding: 8px; border-radius: 20px;">Delivering</button>`
                    : `<button style="width: 120px; background-color: gray; color: black; border: none; padding: 8px; border-radius: 4px;">Invalid</button>`
            }
            </td>
            <td style="padding: 10px; display: flex; gap: 10px;">
                <button style="width: 120px; height: 48px; border: none; background: linear-gradient(90deg, #2196F3, #1E88E5); color: #ffff; font-size: 16px; font-weight: bold; padding: 5px; border-radius: 25px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); cursor: pointer; transition: all 0.4s ease-in-out;position:relative;left:40px;" onClick="showOrderDetail(${item.orderId})">
                    <i style="font-size: 15px;" class="fa-sharp fa-solid fa-eye"></i> Detail
                </button>
            </td>
        </tr>`;
        default:
            return `<div class="item">Unknown Data Type</div>`;
    }
};
/**
 * renderPaginationControls
 * Hiển thị các nút phân trang dựa trên tổng số trang và trang hiện tại.
 * Có xử lý cho nút Prev/Next và hiển thị dấu '...' khi cần.
 */
const renderPaginationControls = (dataType, currentPage, totalPages, filterRender, itemsPerPage) => {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    if (totalPages <= 1) {
        container.innerHTML = ''; // Clear the pagination container
        return;
    }
    const maxVisiblePages = 2; // Số trang tối đa hiển thị xung quanh trang hiện tại
    const pageNumbers = [];

    // Hàm hỗ trợ để thêm trang vào mảng nếu nó hợp lệ
    const addPageNumber = (page) => {
        if (page > 0 && page <= totalPages && !pageNumbers.includes(page)) {
            pageNumbers.push(page);
        }
    };

    // Luôn hiển thị trang đầu tiên
    addPageNumber(1);

    if (totalPages <= maxVisiblePages + 2) {
        // Nếu tổng số trang nhỏ hơn hoặc bằng maxVisiblePages + 2, hiển thị tất cả
        for (let i = 2; i <= totalPages; i++) {
            addPageNumber(i);
        }
    } else {
        // Hiển thị các trang gần trang hiện tại

        // Thêm dấu "..." nếu trang hiện tại cách xa trang 1
        if (currentPage > 2) {
            pageNumbers.push('...');
        }

        // Hiển thị trang gần trang hiện tại
        if (currentPage - 1 > 1) addPageNumber(currentPage - 1); // Trang trước đó
        addPageNumber(currentPage); // Trang hiện tại
        if (currentPage + 1 < totalPages) addPageNumber(currentPage + 1); // Trang kế tiếp

        // Thêm dấu "..." nếu trang hiện tại cách xa trang cuối
        if (currentPage < totalPages - 1) {
            pageNumbers.push('...');
        }
    }

    // Luôn hiển thị trang cuối
    if (currentPage !== totalPages) {
        addPageNumber(totalPages);
    }

    // Render các số trang và nút
    const renderPageNumbers = pageNumbers.map(pageNum => {
        if (pageNum === '...') {
            return `<span>...</span>`;
        } else {
            return `<button class="page-btn" style="background-color: ${pageNum === currentPage ? '#800020' : '#fff'}; color:black;" data-page="${pageNum}">${pageNum}</button>`;
        }
    }).join(' ');

    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px">
            <button class="page-btn" style="background-color: #fff;color:black;" ${currentPage === 1 ? 'disabled' : ''} data-action="prev">&lt;&lt;</button>
            ${renderPageNumbers}
            <button class="page-btn" style="background-color: #fff;color:black;" ${currentPage === totalPages ? 'disabled' : ''} data-action="next">&gt;&gt;</button>
        </div>
    `;

    // Thêm sự kiện cho các nút
    const buttons = container.querySelectorAll('.page-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const button = event.target;
            if (button.hasAttribute('data-action')) {
                // Xử lý nút Next/Prev
                const action = button.getAttribute('data-action');
                if (action === 'prev' && currentPage > 1) {
                    changePage(dataType, currentPage - 1, filterRender, itemsPerPage);
                } else if (action === 'next' && currentPage < totalPages) {
                    changePage(dataType, currentPage + 1, filterRender, itemsPerPage);
                }
            } else if (button.hasAttribute('data-page')) {
                // Xử lý khi nhấn vào các trang số
                const page = parseInt(button.getAttribute('data-page'), 10);
                changePage(dataType, page, filterRender, itemsPerPage);
            }
        });
    });
};
const changePage = (dataType, page, filterRender, itemsPerPage) => {
    const totalPages = Math.ceil(filterRender.length / itemsPerPage);

    if (page < 1 || page > totalPages) return; // Kiểm tra xem trang có hợp lệ không

    renderPage(dataType, page, itemsPerPage, filterRender);
};
// Hàm chuyển đổi ngày từ chuỗi 'dd/MM/yyyy' thành đối tượng Date
const convertToDateStart = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day+1); // month - 1 vì tháng trong Date bắt đầu từ 0
};
const convertToDateEnd = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day); // month - 1 vì tháng trong Date bắt đầu từ 0
};
/**
 * SearchAndRender
 * Tải dữ liệu từ localStorage theo dataType, áp dụng bộ lọc (theo category,
 * tên, ngày, địa lý...), và gọi renderPage để hiển thị kết quả. Đăng ký các
 * listener của input/filter trên giao diện để làm mới kết quả khi người dùng
 * tương tác.
 */
const SearchAndRender = (dataType, page, itemsPerPage = 8) => {
    const data = JSON.parse(localStorage.getItem(dataType)) || [];
    let filterRender = [...data]; // Tạo một bản sao của dữ liệu gốc
    let category = "All";
    let namee = "";
    let startDate = "";
    let endDate = "";
    let selectedCity = "";
    let selectedDistrict = "";
    let selectedWard = "";

    if (dataType === 'Products') {
        document.getElementById('ShoesProduct').addEventListener('change', (event) => {
            category = event.target.value;
            applyFilters();
        });

        document.getElementById('inputProduct').addEventListener('input', (event) => {
            namee = event.target.value;
            applyFilters();
        });

    } else if (dataType === 'Users') {
        document.getElementById('UsersSelect').addEventListener('change', (event) => {
            category = event.target.value;
            console.log("Selected category:", category);
            applyFilters();
        });

        document.getElementById('inputUsers').addEventListener('input', (event) => {
            namee = event.target.value;
            applyFilters();
        });

        document.querySelector('.KhachHangAction input[type="date"]:nth-of-type(1)')
            .addEventListener('change', (event) => {
                startDate = event.target.value ? new Date(event.target.value) : null;
                applyFilters();
            });

        document.querySelector('.KhachHangAction input[type="date"]:nth-of-type(2)')
            .addEventListener('change', (event) => {
                endDate = event.target.value ? new Date(event.target.value) : null;
                applyFilters();
            });
    }
    else  if (dataType === 'CheckOut') {
          document.getElementById('Shoes').addEventListener('change', (event) => {
        category = event.target.value;
        applyFilters();
    });

    document.querySelector('.DonHangAction input[type="date"]:nth-of-type(1)').addEventListener('change', (event) => {
        startDate = event.target.value ? new Date(event.target.value) : null;
        applyFilters();
    });

    document.querySelector('.DonHangAction input[type="date"]:nth-of-type(2)').addEventListener('change', (event) => {
        endDate = event.target.value ? new Date(event.target.value) : null;
        applyFilters();
    });

    document.getElementById('city-select').addEventListener('change', (event) => {
        selectedCity = event.target.value;
        selectedDistrict = ""; // Reset quận khi thành phố thay đổi
        selectedWard = ""; // Reset phường khi thành phố thay đổi
        applyFilters();
    });

    document.getElementById('district-select').addEventListener('change', (event) => {
        selectedDistrict = event.target.value;
        selectedWard = ""; // Reset phường khi quận thay đổi
        applyFilters();
    });

    document.getElementById('ward-select').addEventListener('change', (event) => {
        selectedWard = event.target.value;
        applyFilters();
    });
    }

    const applyFilters = () => {
        filterRender = [...data];

        if (category !== "All") {
            if (dataType === 'Products') {
                filterRender = filterRender.filter(item => item.Category.toLowerCase() === category.toLowerCase());
            } else if (dataType === 'Users') {
                filterRender = filterRender.filter(item => item.status.toLowerCase() === category.toLowerCase());
            }
            else if(dataType === 'CheckOut'){
                filterRender = filterRender.filter(order => order.status === parseInt(category));
            }
        }

        if (namee) {
            if (dataType === 'Products') {
                filterRender = filterRender.filter(item => 
                    item.ProductName.toLowerCase().includes(namee.toLowerCase())
                );
            } else if (dataType === 'Users') {
                filterRender = filterRender.filter(item => 
                    item.username.toLowerCase().includes(namee.toLowerCase())
                );
            }
        }

        if (dataType === 'Users') {
            if (startDate) {
                filterRender = filterRender.filter(item => {
                    const itemDate = convertToDateStart(item.date); // Chuyển đổi ngày trong dữ liệu thành Date
                    return itemDate >= startDate;
                });
            }

            if (endDate) {
                filterRender = filterRender.filter(item => {
                    const itemDate = convertToDateEnd(item.date); // Chuyển đổi ngày trong dữ liệu thành Date
                    return itemDate <= endDate;
                });
            }
        }
        if(dataType ==='CheckOut'){
    
            // Lọc theo thành phố
            if (selectedCity) {
                filterRender = filterRender.filter(order => order.city === selectedCity);
            }
    
            // Lọc theo quận
            if (selectedDistrict) {
                filterRender = filterRender.filter(order => order.district === selectedDistrict);
            }
    
            // Lọc theo phường
            if (selectedWard) {
                filterRender = filterRender.filter(order => order.ward === selectedWard);
            }
    
            // Lọc theo khoảng thời gian
            if (startDate) {
                filterRender = filterRender.filter(item => {
                    const itemDate = convertToDateStart(item.date); // Chuyển đổi ngày trong dữ liệu thành Date
                    return itemDate >= startDate;
                });
            }

            if (endDate) {
                filterRender = filterRender.filter(item => {
                    const itemDate = convertToDateEnd(item.date); // Chuyển đổi ngày trong dữ liệu thành Date
                    return itemDate <= endDate;
                });
            }
        }

        const errorMessageElement = document.getElementById('ErrorMessage');
        const container = document.getElementById('Content-Container');
        const paginate = document.getElementById('pagination-controls');

        if (!errorMessageElement || !container || !paginate) {
            return renderPage(dataType, page, itemsPerPage, filterRender);
    }

        if (filterRender.length === 0) {
            errorMessageElement.style.display = "block";
            container.style.display = "none";
            paginate.style.display = "none";
        } else {
            errorMessageElement.style.display = "none";
            container.style.display = "block";
            paginate.style.display = "block";
        }

        // Render lại trang với filterRender đã lọc
        renderPage(dataType, page, itemsPerPage, filterRender);
    };

    applyFilters(); // Gọi bộ lọc ngay khi tải trang
};
/**
 * ModalProduct
 * Tạo và hiển thị modal cho các thao tác sản phẩm: Update hoặc Delete.
 * - Update: render form edit và gọi btnUpdateProduct để gán logic cập nhật.
 * - Delete: render modal xác nhận và gọi btnDeleteProduct khi xác nhận.
 */
const ModalProduct = (id,dataType) => {
    if(dataType==='Update'){
        const modalUpdateHTML=` <div class="modal fade" id="UpdateModal" tabindex="-1" role="dialog" aria-labelledby="UpdateModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-headerr">
              <button id="close-btn2" type="button" style="box-shadow:none;" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
              <p><strong style="text-align: center;font-size: 20px;font-family: Georgia, 'Times New Roman', Times, serif;color: #162938;margin-left: 20px">INFORMATION PRODUCT</strong></p>
            </div>
            <div class="modal-body">
              <form class="row g-3 modal-form">
                <div style="border-right:2px solid;width:300px;display:flex;justify-content:center;align-items:center;flex-direction: column;padding-right:10px;row-gap:20px"> 
                  <div class="img-preview" id="imgPreview">
                      <img style="display: none;" id="ImagePreview" alt="Image Preview"/>
                  </div>
                </div>       
                <div style="width:440px;">
                  <div class="col-md-6">
                    <label class="form-label">Product Name</label>
                    <input type="text" id="Productname" class="form-control" style="width:350px" placeholder="Nhập tên Giày" />
                  </div>
                  <div class="col-md-6 Color">
                    <label class="form-label">Phân Loại: </label>
                    <select class="form-select" id="category">
                      <option defaultValue="Basketball">Basketball</option>
                      <option value="Football">Football</option>
                      <option value="Running">Running</option>
                      <option value="Gym">Gym</option>
                      <option value="Skateboarding">Skateboarding</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Price</label>
                    <input type="text" id="price" class="form-control" style="width:350px" placeholder="Nhập Giá Tiền"/>
                  </div>
                  <div class="col-md-6 Color">
                  <label class="form-label">Color: </label>
                  <select class="form-select" id="color">
                    <option defaultValue="Black">Black</option>
                    <option value="Red">Red</option>
                    <option value="White">White</option>
                    <option value="Blue">Blue</option>
                    <option value="Gray">Gray</option>
                    <option value="Green">Green</option>
                  </select>
                </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" id="close-btn1" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" class="close" data-dismiss="modal" aria-label="Close" id="saveChange">Update Shoes</button>
            </div>
          </div>
        </div>
      </div>`;
      document.body.insertAdjacentHTML('beforeend',modalUpdateHTML);
      const modalUpdateElement = document.getElementById('UpdateModal');
      const bootstrapModalUpdate = new bootstrap.Modal(modalUpdateElement);
      bootstrapModalUpdate.show();
      document.getElementById('close-btn1').addEventListener('click', () => {
        bootstrapModalUpdate.hide();
    }); 
    document.getElementById('close-btn2').addEventListener('click', () => {
        bootstrapModalUpdate.hide();
    }); 
      modalUpdateElement.addEventListener('hidden.bs.modal', () => {
        modalUpdateElement.remove();
    });
    btnUpdateProduct(id);
    }
    else if (dataType === 'Delete') {
        const modalDeleteHTML = `
        <div class="modal fade" id="customDeleteModal" tabindex="-1" role="dialog" aria-labelledby="customDeleteModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <p><strong style="font-size:20px">CONFIRM DELETE</strong></p>

                        <button id="close-btn2" type="button" style="box-shadow: none;position:relative;left:50px;bottom:15px" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true" >&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this product?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="close-btn1" class="btn btn-secondary" class="close" data-dismiss="modal" aria-label="Close">Cancel</button>
                        <button type="button" id="confirmDeleteButton" class="btn btn-danger" class="close" data-dismiss="modal" aria-label="Close">Delete</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    
        // Thêm modal vào body
        document.body.insertAdjacentHTML('beforeend', modalDeleteHTML);
    
        // Hiển thị modal
        const modalDeleteElement = document.getElementById('customDeleteModal');
        const bootstrapModalDelete = new bootstrap.Modal(modalDeleteElement);
        bootstrapModalDelete.show();
        document.getElementById('close-btn1').addEventListener('click', () => {
            bootstrapModalDelete.hide();
        }); 
        document.getElementById('close-btn2').addEventListener('click', () => {
            bootstrapModalDelete.hide();
        }); 
        // Gán sự kiện xóa cho nút "Delete"
        const confirmDeleteButton = document.getElementById('confirmDeleteButton');
        confirmDeleteButton.addEventListener('click', () => btnDeleteProduct(id));
    
        // Gỡ modal sau khi đóng để tránh lặp
        modalDeleteElement.addEventListener('hidden.bs.modal', () => {
            modalDeleteElement.remove();
        });
    }
  
};
/**
 * btnUpdateProduct
 * Tìm product theo id, điền giá trị vào form modal Update và khi bấm
 * "Update Shoes" sẽ lưu thay đổi vào localStorage và render lại danh sách.
 */
const btnUpdateProduct = (id) => {
    const ProductLocal = JSON.parse(localStorage.getItem("Products")) || [];
    const product = ProductLocal.find((p) => p.Id === id);
    const index=ProductLocal.findIndex(p=>p.Id==id);
    if (!product) {
        showAlertFailure("Product not found!");
        return;
    }

    // Truy xuất các phần tử trong modal
    const Productname = document.getElementById('Productname');
    const Price = document.getElementById('price');
    const Category = document.getElementById('category');
    const Color = document.getElementById('color');
    const labelUpload = document.getElementById('labelUpload');
    const imagePreview = document.getElementById('ImagePreview');
    const Span = document.getElementById('Span');
    const saveChange = document.getElementById('saveChange');

    // Gán giá trị hiện tại của sản phẩm vào form
    Productname.value = product.ProductName;
    Price.value = product.Price;
    Category.value = product.Category;
    Color.value = product.Colour;
    // Hiển thị ảnh nếu có
    if (product.image) {
    if (imagePreview) {
        imagePreview.src = product.image;
        imagePreview.style.display = "block";
    }
    if (Span) Span.style.display = "none";
} else {
    if (imagePreview) imagePreview.style.display = "none";
    if (Span) Span.style.display = "block";
}


    

   saveChange.onclick = () => {
   
    ProductLocal[index].ProductName= Productname.value;
    // Ensure Price is stored as a number (not a string)
    const parsedPrice = parseFloat((Price.value || '').toString().replace(/,/g, '.'));
    ProductLocal[index].Price = Number.isFinite(parsedPrice) ? Math.round(parsedPrice * 100) / 100 : ProductLocal[index].Price;
    ProductLocal[index].Category=Category.value;
    ProductLocal[index].Colour=Color.value;

    localStorage.setItem("Products", JSON.stringify(ProductLocal));
     SearchAndRender("Products", currentPage, itemsPerPage);
};

};


/**
 * btnDeleteProduct
 * Xóa product theo id khỏi localStorage và cập nhật lại giao diện với
 * phân trang được điều chỉnh nếu cần.
 */
const btnDeleteProduct = (id) => {
    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const index = products.findIndex(p => p.Id === id); 

    if (index !== -1) {
        products.splice(index, 1);
        localStorage.setItem('Products', JSON.stringify(products)); 
    }

    const currentPageElement = document.querySelector(".current-page");
    const currentPage = currentPageElement ? parseInt(currentPageElement.textContent.split(" ")[1], 10) : 1;

    const itemsPerPage = 4;
    const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
    const adjustedPage = Math.max(1, Math.min(currentPage, totalPages)); 

    SearchAndRender('Products', adjustedPage, itemsPerPage);
};
/**
 * ModalUser
 * Tạo modal cho các thao tác với người dùng: Add / Edit / Delete. Modal này
 * dùng chung template nhỏ để thu thập thông tin và gọi các hàm btnCreateUser,
 * btnEditUser, btnDeleteUser tương ứng.
 */
const ModalUser = (id,dataType)=>{
    if (dataType === 'Delete') {
        const modalDeleteHTML = `
        <div class="modal fade" id="customDeleteModalUser" tabindex="-1" role="dialog" aria-labelledby="customDeleteModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button id="close-btn2" type="button" style="box-shadow: none;" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete this user?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" class="close" data-dismiss="modal" aria-label="Close" id="close-btn3">Cancel</button>
                        <button type="button" id="confirmDeleteButtonUser" class="btn btn-danger" aria-label="Close" data-bs-dismiss="modal">Delete</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalDeleteHTML);
        const modalDeleteElement = document.getElementById('customDeleteModalUser');
        const bootstrapModalDelete = new bootstrap.Modal(modalDeleteElement);
        bootstrapModalDelete.show();
        const confirmDeleteButtonUser = document.getElementById('confirmDeleteButtonUser');
        confirmDeleteButtonUser.addEventListener('click', () => {
            btnDeleteUser(id);
            bootstrapModalDelete.hide(); 
        });
        document.getElementById('close-btn2').addEventListener('click', () => {
            bootstrapModalDelete.hide();
        }); 
        document.getElementById('close-btn3').addEventListener('click', () => {
            bootstrapModalDelete.hide();
        }); 
        
        modalDeleteElement.addEventListener('hidden.bs.modal', () => {
            modalDeleteElement.remove();
        });
    }
    else if (dataType === 'Edit') {
        const modalUpdateHTML = `
            <div class="modal fade" id="EditModal" tabindex="-1" role="dialog" aria-labelledby="EditModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document" style="width:380px;">
                    <div class="modal-content" style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);">
                        <div class="modal-headerr">
                            <span style="font-size:20px;margin-left:15px;font-weight:600;">Chỉnh Sửa Thông Tin</span>
                            <button class="close" data-dismiss="modal" aria-label="Close" id="close-btn1" type="button" style="box-shadow:none;width:50px;border:none;" >
<span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form action="" class="signup-form">
                                <div class="form-group">
                                    <label for="fullname" class="form-label">Tên đầy đủ</label>
                                    <input id="fullname" name="fullname" type="text" placeholder="VD: Thanh Phat" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="phone" class="form-label">Số điện thoại</label>
                                    <input id="phone" name="phone" type="text" placeholder="Nhập số điện thoại" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="email" class="form-label">Email</label>
                                    <input id="email" name="email" type="text" placeholder="Nhập email" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="adress" class="form-label">Địa chỉ</label>
                                    <input id="adress" name="adress" type="text" placeholder="Nhập địa chỉ" class="form-control">
                                </div>
                                <div class="form-group edit-account-e">
                                    <label for="user-status" class="form-label">Trạng thái</label>
                                    <input type="checkbox" id="user-status" class="switch-input">
                                    <label for="user-status" class="switch"></label>
                                </div>
                                <button type="button" style="margin-left:76px" class="form-submit btn btn-primary"  class="close" data-dismiss="modal" aria-label="Close" onClick="btnEditUser(${id})">
                                    <i class="fa-regular fa-floppy-disk"></i> Lưu thông tin
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
    
        // Thêm modal vào DOM
        document.body.insertAdjacentHTML('beforeend', modalUpdateHTML);
        const modalEditElement = document.getElementById('EditModal');
        const bootstrapModalEdit = new bootstrap.Modal(modalEditElement);
        const statu=document.getElementById('user-status');
        // Lấy thông tin người dùng và hiển thị trong form
        const userLocal = JSON.parse(localStorage.getItem('Users')) || [];
        const user = userLocal.find(p => p.userId === id);
    
        if (user) {
document.getElementById('fullname').value = user.username || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('adress').value = user.address || '';
            let temp = user.status;
            if (temp === 'Hoat Dong') {
                statu.checked = true; 
            } else {
                statu.checked = false; 
            }
        }
        document.getElementById('close-btn1').addEventListener('click', () => {
            bootstrapModalEdit.hide();
        }); 
        // Hiển thị modal
        bootstrapModalEdit.show();
        // Đóng modal và render lại danh sách
        
        // Xóa modal khỏi DOM sau khi đóng
        modalEditElement.addEventListener('hidden.bs.modal', () => {
            SearchAndRender('Users', currentPage, itemsPerPage);
            modalEditElement.remove();
        });
    }
    else if (dataType === 'Add') {
        // Reuse the same form layout as Edit but for creating a new user
        const modalAddHTML = `
            <div class="modal fade" id="EditModal" tabindex="-1" role="dialog" aria-labelledby="EditModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document" style="width:380px;">
                    <div class="modal-content" style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);">
                        <div class="modal-headerr">
                            <span style="font-size:20px;margin-left:15px;font-weight:600;">Thêm Khách Hàng</span>
                            <button class="close" data-dismiss="modal" aria-label="Close" id="close-btn1" type="button" style="box-shadow:none;width:50px;border:none;" >
<span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form action="" class="signup-form">
                                <div class="form-group">
                                    <label for="fullname" class="form-label">Tên đầy đủ</label>
                                    <input id="fullname" name="fullname" type="text" placeholder="VD: Thanh Phat" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="phone" class="form-label">Số điện thoại</label>
                                    <input id="phone" name="phone" type="text" placeholder="Nhập số điện thoại" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="email" class="form-label">Email</label>
                                    <input id="email" name="email" type="text" placeholder="Nhập email" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label for="adress" class="form-label">Địa chỉ</label>
                                    <input id="adress" name="adress" type="text" placeholder="Nhập địa chỉ" class="form-control">
                                </div>
                                <div class="form-group edit-account-e">
                                    <label for="user-status" class="form-label">Trạng thái</label>
                                    <input type="checkbox" id="user-status" class="switch-input">
                                    <label for="user-status" class="switch"></label>
                                </div>
                                <button type="button" style="margin-left:76px" class="form-submit btn btn-primary"  class="close" data-dismiss="modal" aria-label="Close" onClick="btnCreateUser()">
                                    <i class="fa-regular fa-floppy-disk"></i> Thêm khách
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalAddHTML);
        const modalAddElement = document.getElementById('EditModal');
        const bootstrapModalAdd = new bootstrap.Modal(modalAddElement);
        // Ensure fields are empty/default
        document.getElementById('fullname').value = '';
        document.getElementById('phone').value = '';
        document.getElementById('email').value = '';
        document.getElementById('adress').value = '';
        document.getElementById('user-status').checked = true;

        document.getElementById('close-btn1').addEventListener('click', () => {
            bootstrapModalAdd.hide();
        });
        bootstrapModalAdd.show();

        modalAddElement.addEventListener('hidden.bs.modal', () => {
            SearchAndRender('Users', currentPage, itemsPerPage);
            modalAddElement.remove();
        });
    }
}
const btnEditUser = (id) => {
    const userLocal = JSON.parse(localStorage.getItem('Users')) || [];
    const user = userLocal.find((p) => p.userId === id);
    const index = userLocal.findIndex((p) => p.userId === id);

    if (!user) {
        showAlertFailure('Không tìm thấy người dùng!');
        return;
    }

    // Lấy giá trị từ form
    const name = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('adress').value.trim();
    const status = document.getElementById('user-status').checked ? 'Hoat Dong' : 'Da Khoa';

    // Kiểm tra tính hợp lệ
    if (!name) {
        showAlertFailure('Tên đầy đủ không được để trống!');
        return;
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
        showAlertFailure('Số điện thoại không hợp lệ! (Yêu cầu 10 chữ số)');
        return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAlertFailure('Email không hợp lệ!');
        return;
    }
    if (!address) {
        showAlertFailure('Địa chỉ không được để trống!');
        return;
    }

    // Cập nhật thông tin
    userLocal[index] = {
        ...userLocal[index],
        username: name,
        phone: phone,
        email: email,
        address: address,
        status: status,
    };

    // Lưu lại vào localStorage
    localStorage.setItem('Users', JSON.stringify(userLocal));
    showAlertSuccess('Chỉnh sửa thông tin thành công!');

    // Đóng modal và xóa khỏi DOM
    const modalEditElement = document.getElementById('EditModal');
    const bootstrapModal = bootstrap.Modal.getInstance(modalEditElement);

    bootstrapModal.hide();

    modalEditElement.addEventListener('hidden.bs.modal', () => {
        modalEditElement.remove();
    });
};
    const btnCreateUser = () => {
        // Lấy danh sách hiện tại
        const users = JSON.parse(localStorage.getItem('Users')) || [];

        // Lấy giá trị từ form
        const name = document.getElementById('fullname').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('adress').value.trim();
        const status = document.getElementById('user-status').checked ? 'Hoat Dong' : 'Da Khoa';

        // Validate
        if (!name) return showAlertFailure('Tên đầy đủ không được để trống!');
        if (!phone || !/^\d{10}$/.test(phone)) return showAlertFailure('Số điện thoại không hợp lệ! (Yêu cầu 10 chữ số)');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAlertFailure('Email không hợp lệ!');
        if (!address) return showAlertFailure('Địa chỉ không được để trống!');

        // Kiểm tra trùng tên hoặc số điện thoại
        if (users.some(u => u.username === name || u.phone === phone)) {
            return showAlertFailure('Người dùng với tên hoặc số điện thoại này đã tồn tại!');
        }

        // Tạo user mới
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        const newUser = {
            userId: Math.ceil(Math.random() * 100000),
            date: formattedDate,
            username: name,
            phone: phone,
            password: '',
            email: email,
            address: address,
            status: status,
            role: 'user',
            Cart: [],
            ProductBuy: []
        };

        users.push(newUser);
        localStorage.setItem('Users', JSON.stringify(users));
        showAlertSuccess('Thêm khách hàng thành công!');

        // Đóng modal
        const modalEditElement = document.getElementById('EditModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modalEditElement);
        bootstrapModal.hide();

        modalEditElement.addEventListener('hidden.bs.modal', () => {
            modalEditElement.remove();
        });
    };
const btnDeleteUser = (id) => {
    const user = JSON.parse(localStorage.getItem('Users')) || []; // Lấy danh sách người dùng từ localStorage
    const index = user.findIndex(p => p.userId === id); // Tìm vị trí người dùng theo ID

    if (index !== -1) {
        user.splice(index, 1); // Xóa người dùng khỏi danh sách
        localStorage.setItem('Users', JSON.stringify(user)); // Cập nhật localStorage với danh sách mới
    }
    console.log(id)
    // Xử lý trang hiện tại và số trang
    const currentPageElement = document.querySelector(".current-page");
    const currentPage = currentPageElement ? parseInt(currentPageElement.textContent.split(" ")[1], 10) : 1;

    const itemsPerPage = 8; // Số lượng phần tử mỗi trang
    const totalPages = Math.ceil(user.length / itemsPerPage) || 1; // Tổng số trang
    const adjustedPage = Math.max(1, Math.min(currentPage, totalPages)); // Điều chỉnh trang hiện tại nếu cần

    // Gọi hàm cập nhật giao diện (SearchAndRender cần được định nghĩa trước đó)
    SearchAndRender('Users', adjustedPage, itemsPerPage);
};
// ========== TỒN KHO ==========
// cảnh báo sắp hết hàng nếu tồn <= ngưỡng này
function getStockWarningThreshold() {
    const select = document.getElementById("threshold");
    if (!select) return 5; 
    return parseInt(select.value, 10);
}


function getImportReceipts() {
    return JSON.parse(localStorage.getItem(IMPORT_KEY)) || [];
}

// lấy danh sách đơn xuất (đơn hàng thành công)
// bạn đang lưu vào 'Sucess' khi status == 1
function getSuccessOrders() {
    return JSON.parse(localStorage.getItem('Sucess')) || [];
}

// tồn tại một thời điểm: tất cả phiếu nhập / đơn xuất có ngày <= atDate
function getStockAtDate(productId, atDate) {
    const imports = getImportReceipts();
    const orders  = getSuccessOrders();
    let totalImport = 0;
    let totalExport = 0;

    imports.forEach(r => {
        if (r.status !== 'completed') return;
        const d = convertToDateEnd(r.date); // dd/MM/yyyy -> Date
        if (d <= atDate) {
            (r.items || []).forEach(it => {
                if (it.productId === productId) {
                    totalImport += Number(it.quantity) || 0;
                }
            });
        }
    });

    orders.forEach(o => {
        const d = convertToDateEnd(o.date);
        if (d <= atDate) {
            (o.cartProduct || []).forEach(it => {
                if (it.product_id === productId) {
                    totalExport += Number(it.quantity) || 0;
                }
            });
        }
    });

    return totalImport - totalExport;
}

// nhập / xuất của 1 sản phẩm trong khoảng [fromDate, toDate]
function getImportExportInRange(productId, fromDate, toDate) {
    const imports = getImportReceipts();
    const orders  = getSuccessOrders();
    let importQty = 0;
    let exportQty = 0;

    imports.forEach(r => {
        if (r.status !== 'completed') return;
        const d = convertToDateEnd(r.date);
        if (d >= fromDate && d <= toDate) {
            (r.items || []).forEach(it => {
                if (it.productId === productId) {
                    importQty += Number(it.quantity) || 0;
                }
            });
        }
    });

    orders.forEach(o => {
        const d = convertToDateEnd(o.date);
        if (d >= fromDate && d <= toDate) {
            (o.cartProduct || []).forEach(it => {
                if (it.product_id === productId) {
                    exportQty += Number(it.quantity) || 0;
                }
            });
        }
    });

    return { importQty, exportQty };
}

const RenderDonHang=()=>{
    Content.innerHTML = `<div class="tdonHnag" style="position: relative; left: 70px; height:50px;">
    <div style="display:flex;margin-top: 20px;justify-content: space-between;align-items:center;width:85%;margin-left:40px">
        <select name="Shoes" id="Shoes" class="Shoes" style="margin-right:5px;width:90px">
            <option value="All">All</option>
            <option value="0">Processing</option>
            <option value="2">Cancel</option>
            <option value="1">Receiving</option>
             <option value="3">Delivering</option>
          </select>
         <div class="address-container">
          <select id="city-select">
        <option value="">Chọn Thành Phố</option>
    </select>
            <select id="district-select" disabled style="font-size: 16px; height: 40px; padding: 8px;">
            <option value="">Chọn Quận</option>
            </select>
            <select id="ward-select" disabled style="font-size: 16px; height: 40px; padding: 8px;">
            <option value="">Chọn Phường</option>
            </select>
        </div>
             <div class="DonHangAction"  style="width:40%">
             <span>Tu  </span>
             <input id="DonHangA1" type="date"/>
             <span>Den  </span>
             <input id="DonHangA2" type="date"/>
            <button onClick="ResetDon()" style="width:50px "><i class="fa-sharp fa-solid fa-arrow-rotate-right"></i> </button>
            </div>
    </div>
    </div>`;
    Contentcontainer.innerHTML=`<table class="Table " style="width:100%; left:50px;color:white; border-collapse: collapse; font-family: Arial, sans-serif; transition: all 0.5s;position:relative;top:20px">
    <thead>
    <tr style="background-color: #800020;color:white; text-align: left;">
        <th style="width:12%; padding: 12px;">Code</th>
        <th style="width:20%; padding: 12px;">Khach Hang</th>
        <th style="width:15%; padding: 12px;">Total Price</th>
        <th style="width:15%; padding: 12px;">Date in</th>
        <th style="width:15%; padding-left: 30px;">Status</th>
        <th style="padding-left: 65px;">Action</th>
    </tr>
    </thead>
    <tbody id="CheckOutTable">
    </tbody>
</table>`
SearchAndRender('CheckOut',currentPage,itemsPerPage);
const cityData = {
    "Hà Nội": {
            "Ba Đình": ["Ba Đình", "Cống Vị", "Đội Cấn", "Giảng Võ", "Kim Mã", "Liễu Giai", "Ngọc Hà", "Ngọc Khánh", "Phúc Xá", "Quán Thánh", "Thành Công", "Trúc Bạch"],
            "Hoàn Kiếm": ["Chương Dương", "Cửa Đông", "Cửa Nam", "Đồng Xuân", "Hàng Bạc", "Hàng Buồm", "Hàng Bông", "Hàng Gai", "Hàng Mã", "Hàng Trống", "Lý Thái Tổ", "Phan Chu Trinh", "Phúc Tân", "Tràng Tiền"],
            "Hai Bà Trưng": ["Bạch Mai", "Cầu Dền", "Đồng Tâm", "Định Công", "Hai Bà Trưng", "Minh Khai", "Quỳnh Mai", "Thanh Lương", "Thanh Nhàn", "Vĩnh Tuy", "Yên Lãng"],
            "Tây Hồ": ["Bọ", "Nhật Tân", "Quảng An", "Phú Thượng", "Tứ Liên", "Xuân La"],
            "Long Biên": ["Gia Thụy", "Ngọc Thụy", "Phúc Lợi", "Thạch Bàn", "Việt Hưng", "Đức Giang", "Bồ Đề", "Giang Biên", "Thượng Thanh"],
            "Thanh Xuân": ["Hạ Đình", "Khương Đình", "Khương Mai", "Láng Hạ", "Lê Trọng Tấn", "Nhân Chính", "Thanh Xuân Trung", "Thanh Xuân Bắc", "Tân Xuân", "Trung Hòa"],
            "Cầu Giấy": ["Dịch Vọng", "Dịch Vọng Hậu", "Mai Dịch", "Nghĩa Đô", "Nghĩa Tân", "Quan Hoa", "Yên Hòa"],
            "Hoàng Mai": ["Đại Kim", "Định Công", "Hoàng Liệt", "Lĩnh Nam", "Mai Động", "Tân Mai", "Thịnh Liệt", "Trần Phú", "Vĩnh Hưng", "Yên Sở"],
            "Nam Từ Liêm": ["Cầu Diễn", "Đại Mỗ", "Mễ Trì", "Mỹ Đình 1", "Mỹ Đình 2", "Phú Đô", "Phương Canh", "Sơn Tây"],
            "Bắc Từ Liêm": ["Cổ Nhuế 1", "Cổ Nhuế 2", "Đông Ngạc", "Minh Khai", "Phú Diễn", "Tây Tựu", "Thụy Phương", "Xuân Đỉnh"],
            "Hà Đông": ["Biên Giang", "Cao Viên", "Dương Nội", "Đồng Mai", "Hạ Cơ", "Kiến Hưng", "Mỗ Lao", "Phú Lương", "Quang Trung", "Vạn Phúc"],
            "Sơn Tây": ["Cổ Loa", "Đảo Cát", "Hoài Thanh", "Hoàng Liệt"]
        
    },
    "Hồ Chí Minh":{
 
            "Quận 1": ["Bến Nghé", "Bến Thành", "Cầu Ông Lãnh", "Cô Giang", "Đa Kao", "Nguyễn Cư Trinh", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Tân Định"],
            "Quận 2": ["An Khánh", "An Lợi Đông", "Bình An", "Bình Trưng Đông", "Bình Trưng Tây", "Cát Lái", "Thạnh Mỹ Lợi", "Thảo Điền", "Tân Phú", "Long Thạnh Mỹ"],
            "Quận 3": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            "Quận 4": ["1", "2", "3", "4", "5"],
            "Quận 5": ["1", "2", "3", "4", "5", "6"],
            "Quận 6": ["1", "2", "3", "4", "5", "6"],
            "Quận 7": ["Bình Thuận", "Hưng Gia", "Hưng Phước", "Tân Kiểng", "Tân Hưng", "Phú Mỹ", "Tân Phong"],
            "Quận 8": ["1", "2", "3", "4", "5", "6", "7", "8"],
            "Quận 9": ["An Phú", "Bình An", "Hiệp Phú", "Long Bình", "Tăng Nhơn Phú A", "Tăng Nhơn Phú B", "Trường Thạnh"],
            "Quận 10": ["1", "2", "3", "4", "5"],
            "Quận 11": ["1", "2", "3", "4", "5"],
            "Quận 12": ["An Phú Đông", "Đông Hưng Thuận", "Hiệp Thành", "Tân Chánh Hiệp", "Tân Hưng Thuận"],
            "Quận Bình Tân": ["Bình Hưng Hòa", "Bình Hưng Hòa A", "Bình Hưng Hòa B", "Bình Trị Đông", "Bình Trị Đông A", "Bình Trị Đông B"],
            "Quận Bình Thạnh": ["1", "2", "3", "4", "5", "6"],
            "Quận Gò Vấp": ["1", "2", "3", "4", "5"],
            "Quận Phú Nhuận": ["1", "2", "3", "4", "5"],
            "Quận Thủ Đức": ["An Lợi Đông", "Bình An", "Bình Trưng Tây", "Long Bình", "Linh Đông", "Linh Trung", "Tam Bình"],
            "Huyện Bình Chánh": ["Bình Chánh", "Bình Hưng", "Bình Lợi", "Bình Tân"],
            "Huyện Củ Chi": ["An Phú", "An Nhơn", "Củ Chi", "Phước Hiệp"],
            "Huyện Hóc Môn": ["Bàu Cò", "Hoà Bình"]
        
    },
    "Đà Nẵng": {

            "Hải Châu": ["Bình Hiên", "Bình Thuận", "Cẩm Lệ", "Đà Nẵng", "Hải Châu"],
            "Thanh Khê": ["An Khê", "Hòa Cường", "Lê Duẩn"],
            "Sơn Trà": ["Thọ Quang", "Thọ Tiền"],
            "Liên Chiểu": ["Bình Dương", "Hoà Phát"],
            "Ngũ Hành Sơn": ["Hòa Hải", "Hòa Quý", "Khuê Mỹ", "Mỹ An", "Mỹ Khê", "Phước Mỹ", "Sơn Trà"],
            "Cẩm Lệ": ["Hòa An", "Hòa Phát", "Khuê Trung", "Phước Lý"],
            "Hòa Vang": ["Hòa Nhơn", "Hòa Phước", "Hòa Tiến", "Hòa Châu", "Hòa Khương", "Hòa Bắc", "Hòa Sơn"]
        
    }
};

const citySelect = document.getElementById('city-select');
const districtSelect = document.getElementById('district-select');
const wardSelect = document.getElementById('ward-select');

// Tạo các option cho mỗi thành phố
Object.keys(cityData).forEach(cityName => {
  const option = document.createElement('option');
  option.value = cityName;  // Gán giá trị cho option
  option.textContent = cityName.charAt(0).toUpperCase() + cityName.slice(1);  // Viết hoa chữ cái đầu
  citySelect.appendChild(option);
});

// Lắng nghe sự kiện thay đổi trên city-select
citySelect.addEventListener('change', (event) => {
  const selectedCity = event.target.value;

  // Clear các quận và phường trước khi cập nhật
  districtSelect.innerHTML = '<option value="">Chọn Quận</option>';
  wardSelect.innerHTML = '<option value="">Chọn Phường</option>';
  wardSelect.disabled = true; // Disable ward select khi chưa chọn quận

  if (selectedCity && cityData[selectedCity]) {
    const districts = Object.keys(cityData[selectedCity]);

    // Cập nhật dropdown quận
    districts.forEach(district => {
      const districtOption = document.createElement('option');
      districtOption.value = district;
      districtOption.textContent = district;
      districtSelect.appendChild(districtOption);
    });

    // Enable district select
    districtSelect.disabled = false;
  }
});

// Lắng nghe sự kiện thay đổi trên district-select
districtSelect.addEventListener('change', (event) => {
  const selectedDistrict = event.target.value;

  // Clear các phường trước khi cập nhật
  wardSelect.innerHTML = '<option value="">Chọn Phường</option>';

  if (selectedDistrict) {
    const selectedCity = citySelect.value;
    const wards = cityData[selectedCity][selectedDistrict];

    // Cập nhật dropdown phường
    wards.forEach(ward => {
      const wardOption = document.createElement('option');
      wardOption.value = ward;
      wardOption.textContent = ward;
      wardSelect.appendChild(wardOption);
    });

    // Enable ward select
    wardSelect.disabled = false;
  }
});

}
const showOrderOptions = (idx)=> {
    const orders = JSON.parse(localStorage.getItem("CheckOut"));
    const order = orders.find(p => p.orderId == idx)
    const orderOptionsHTML = `
                    <div class="order-detail-row">
                        <span><i class="fa-solid fa-hashtag"></i>Order ID: </span>
                        <span>${order.orderId}</span>
                    </div>
                    <div class="order-detail-row">
                        <span><i class="fa-regular fa-calendar"></i>Purchase date: </span>
                        <span>${order.date}</span>
                    </div>
                    <div class="order-detail-row">
                    <span><i class="fa-solid fa-cash-register"></i>Payment method: </span>
                    <span>${order.paymentMethod}</span>
                    </div>
                    <div class="order-detail-row address">
                        <span><i class="fa-solid fa-location-dot"></i>Delivery address: </span>
                        <p>${order.addressdetail}</p>
                    </div>
                    <div class="order-detail-row address">
                        <span><i class="fa-solid fa-map-location-dot"></i>Region: </span>
                        <p> ${order.ward}, ${order.district}, ${order.city}</p>
                    </div>
                    `;

    return orderOptionsHTML;
}
const getProductDetails = (productId) => {
    const products = JSON.parse(localStorage.getItem("Products")) || [];
    return products.find(product => product.id === productId);
};

const showCartDetail = (cartProducts) => {
    let cartHtml = ``;

    cartProducts.forEach(item => {
       


        cartHtml += `
            <div class="modal-container cart-item">
                <div class="img-container">
                    <img src="${item.image}" alt="${item.name}">
                </div>        
                <div class="cart-item-info">
                    <p><b>Product ID:</b> ${item.product_id}</p>
                    <p><b>Name:</b> ${item.name}</p>
                    <p><b>Size:</b> ${item.size}</p>
                    <p><b>Color:</b> ${item.color}</p>
                    <p><b>Quantity:</b> ${item.quantity}</p>
                    <p><b>Price:</b> ${item.price} USD</p>
                </div>
            </div>
        `;
    });

    return cartHtml;
};
const showOrderDetail = (orderIdx) => {
    const orders = JSON.parse(localStorage.getItem("CheckOut")) || [];
    const order = orders.find(p => p.orderId == orderIdx);
    console.log(`showOrderDetail called with index: ${orderIdx}`);
    if (!order) {
        console.error(`Order with index ${orderIdx} not found.`);
        return;
    }

    // Kiểm tra và xóa modal cũ nếu tồn tại
    let existingModal = document.getElementById('UpdateModalOrder');
    if (existingModal) {
        existingModal.remove();
    }

    // Tạo modal mới
    const modalHTML = `
        <div class="modal fade"  id="UpdateModalOrder" tabindex="-1" aria-labelledby="UpdateModalLabelOrder" aria-hidden="true">
            <div class="modal-dialog modal-lg" >
                <div class="modal-content" >
                    <div class="modal-header">
                        <h5 class="modal-title" id="UpdateModalLabel">Order Details</h5>
                        <button id="close-btn2" type="button" style="box-shadow:none;width:50px;" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" >
                    <div style="display: flex;">
                        <div class="cart" style=" max-height: 300px;overflow-y: auto;">
                            ${showCartDetail(order.cartProduct)}
                        </div>
                        <div class="order-detail">
                            ${showOrderOptions(orderIdx)}
                        </div>
                        </div>
                         <div class="form-group edit-account-e" style="display: flex;flex-direction:row; flex-wrap: wrap;">
                                <div class="status-options">
                                    <div>
                                        <input type="radio" id="status-progress" name="order-status" value="0">
                                        <label for="status-progress" class="status-label">Progressing</label>
                                    </div>
                                    <div>
                                        <input type="radio" id="status-canceled" name="order-status" value="2">
                                        <label for="status-canceled" class="status-label">Canceled</label>
                                    </div>
                                    <div>
                                        <input type="radio" id="status-received" name="order-status" value="1">
                                        <label for="status-received" class="status-label">Received</label>
                                    </div>
                                    <div>
                                        <input type="radio" id="status-delivering" name="order-status" value="3">
                                        <label for="status-delivering" class="status-label">Delivering</label>
                                    </div>
                                </div>

                            </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="close-btn1" class="btn btn-secondary" class="close" data-dismiss="modal" aria-label="Close">Close</button>
                        <button type="button" class="btn btn-primary" class="close" data-dismiss="modal" aria-label="Close" onclick="saveOrderDetail(${orderIdx})">Save changes</button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Gán trạng thái hiện tại
    const statusOptions = document.querySelectorAll('input[name="order-status"]');
    const currentStatus = order.status; // 0: Progressing, 1: Received, 2: Canceled, 3: Delivering

    // check & đảm bảo chỉ chọn 1
    statusOptions.forEach(option => {
        const value = parseInt(option.value, 10);

        // check trạng thái hiện tại
        option.checked = value === currentStatus;

        option.addEventListener('change', function () {
            if (this.checked) {
                statusOptions.forEach(opt => {
                    if (opt !== this) opt.checked = false;
                });
            }
        });
    });
    // disable những lựa chọn không được phép
    statusOptions.forEach(option => {
        const value = parseInt(option.value, 10);

        // Nếu đơn đã Received (1) hoặc Canceled (2) => không cho đổi sang trạng thái khác nữa
        if ((currentStatus === 1 || currentStatus === 2) && value !== currentStatus) {
            option.disabled = true;
        }

        // Nếu đang Delivering (3) => không cho quay lại Progressing (0)
        if (currentStatus === 3 && value === 0) {
            option.disabled = true;
        }
    });

    // Hiển thị modal
    const modalElement = document.getElementById('UpdateModalOrder');
    const bootstrapModal = new bootstrap.Modal(modalElement);
    bootstrapModal.show();
    document.getElementById('close-btn1').addEventListener('click', () => {
        bootstrapModal.hide();
    }); 
    document.getElementById('close-btn2').addEventListener('click', () => {
        bootstrapModal.hide();
    }); 
    // Xóa modal khỏi DOM sau khi đóng
    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });
};

    const saveOrderDetail = (idx) => {
    const orders = JSON.parse(localStorage.getItem("CheckOut")) || [];
    const users = JSON.parse(localStorage.getItem('Users')) || [];
    const order = orders.find(p => p.orderId == idx);
    const userLogin = JSON.parse(sessionStorage.getItem('adminLogin'))||[];
    if (!order) {
        console.error(`Order with index ${idx} not found in storage.`);
        return;
    }

    const user = users.find(p => p.userId === order.userId);
    
    const indexx = users.find(p => p.userId === order.userId);
    if (!user) {
        console.error(`User associated with order ${order.orderId} not found.`);
        showAlertFailure(`User associated with this order is missing. Please check the data.`);
        return;
    }

    // Lấy trạng thái được chọn từ checkbox
    const selectedStatus = Array.from(document.querySelectorAll('input[name="order-status"]'))
        .find(option => option.checked);

    if (!selectedStatus) {
        alert("Please select a status.");
        return;
    }

    const currentStatus = order.status;                 // trạng thái hiện tại
    const newStatus = parseInt(selectedStatus.value, 10); // trạng thái mới

    // RULE 1: Đã Received hoặc Canceled thì không cho đổi nữa
    if ((currentStatus === 1 || currentStatus === 2) && newStatus !== currentStatus) {
        showAlertFailure('Đơn hàng đã ở trạng thái cuối (Received/Canceled), không được đổi lại.');
        return;
    }

    // RULE 2: Đang Delivering thì không cho quay về Progressing
    if (currentStatus === 3 && newStatus === 0) {
        showAlertFailure('Không thể chuyển đơn đang giao (Delivering) về trạng thái Processing.');
        return;
    }

    // Nếu qua được rule thì mới cập nhật
    order.status = newStatus;

    // Cập nhật trạng thái trong `ProductBuy` của người dùng
    const userOrder = user.ProductBuy.find(p => p.orderId === order.orderId);
    if (!userOrder) {
        console.error(`Order ${order.orderId} not found in user's ProductBuy.`);
        showAlertFailure(`Order not found in user's purchase history. Please check the data.`);
        return;
    }

    const index = user.ProductBuy.findIndex(p => p.orderId === idx);
    userOrder.status = newStatus;
    user.ProductBuy[index].status = newStatus;
    users[indexx] = user;

    sessionStorage.setItem('adminLogin', JSON.stringify(userLogin));
    localStorage.setItem('CheckOut', JSON.stringify(orders));
    localStorage.setItem('Users', JSON.stringify(users));
    showAlertSuccess('Cap Nhat Thanh Cong')
    SearchAndRender('CheckOut', currentPage, itemsPerPage);

    const modalElement = document.getElementById('UpdateModalOrder');
    const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
    bootstrapModal.hide();
};
/**
 * RenderUserName
 * Hiển thị tên admin hiện đăng nhập trên thanh sidebar (nếu có session).
 * Đọc session admin từ sessionStorage và cập nhật DOM tương ứng.
 */
const RenderUserName = ()=>{
    const userLogin = JSON.parse(sessionStorage.getItem('adminLogin')) || {};
    const username = userLogin.username || '';
    const userLi = document.querySelector('.Back .User');
    const nameSpan = document.getElementById('NameUser');
    if (!userLi || !nameSpan) return;
    if (username) {
        nameSpan.innerText = username;
        userLi.style.display = 'flex';
    } else {
        // Hide the user entry when there's no logged-in user to avoid showing a Guest label
        userLi.style.display = 'none';
    }
}
RenderUserName();
// Homepage navigation disabled for admin pages to prevent admins
// from being redirected to the public site from the admin panel.
const TrangChu = () => {
    // intentionally no-op
    return; 
};
const RenderNhapHang = () => {
    // Header: lọc / tìm / thêm
    Content.innerHTML = `
        <div class="trangNhapHang" style="position: relative; left: 70px; height:50px;">
            <div style="display:flex;margin-top: 20px;justify-content: space-between;align-items:center;width:85%;margin-left:40px">
                
                <div style="display:flex;align-items:center;gap:8px;">
                    <span>Từ</span>
                    <input id="ImportDateFrom" type="date" style="padding:5px 10px;border-radius:8px;font-size:14px;"/>
                    <span>Đến</span>
                    <input id="ImportDateTo" type="date" style="padding:5px 10px;border-radius:8px;font-size:14px;"/>
                </div>

                <div class="Find">
                    <input type="text" id="ImportSearch" placeholder="Tìm mã phiếu nhập..." />
                    <i class="fa fa-magnifying-glass"></i>
                </div>

                <div>
                    <button type="button" id="btnAddImport" style="background:#800020;color:#fff;border:none;padding:8px 14px;border-radius:8px;">
                        <i class="fa fa-plus"></i> Thêm phiếu nhập
                    </button>
                </div>
            </div>
        </div>
    `;

    // Bảng danh sách phiếu nhập
    Contentcontainer.innerHTML = `
        <table class="Table" style="width:100%;left:50px;position:relative;border-collapse: collapse;font-family: Arial, sans-serif;margin-top:20px;">
            <thead>
                <tr style="background-color:#800020;color:white;text-align:left;">
                    <th style="width:12%;padding:12px;">Mã phiếu</th>
                    <th style="width:15%;padding:12px;">Ngày nhập</th>
                    <th style="width:15%;padding:12px;">Trạng thái</th>
                    <th style="width:15%;padding:12px;">Tổng SL</th>
                    <th style="width:20%;padding:12px;">Tổng giá nhập</th>
                    <th style="padding:12px;">Thao tác</th>
                </tr>
            </thead>
            <tbody id="ImportTable"></tbody>
        </table>
    `;

    // Ẩn thông báo lỗi chung, không dùng cho tab này
    document.getElementById('ErrorMessage').style.display = "none";
    document.getElementById('pagination-controls').style.display = "none";
    Contentcontainer.style.display = "block";

    // Gán sự kiện bộ lọc
    document.getElementById('btnAddImport').addEventListener('click', () => openImportModal('Add'));

    const searchInput = document.getElementById('ImportSearch');
    const dateFromInput = document.getElementById('ImportDateFrom');
    const dateToInput = document.getElementById('ImportDateTo');

    const rerender = () => renderImportList();

    if (searchInput) searchInput.addEventListener('input', rerender);
    if (dateFromInput) dateFromInput.addEventListener('change', rerender);
    if (dateToInput) dateToInput.addEventListener('change', rerender);

    // Render lần đầu
    renderImportList();
};
function renderImportList() {
    const tbody = document.getElementById('ImportTable');
    if (!tbody) return;

    const receipts = getImportReceipts();
    const search = (document.getElementById('ImportSearch')?.value || '').trim().toLowerCase();
    const dateFrom = document.getElementById('ImportDateFrom')?.value || '';
    const dateTo = document.getElementById('ImportDateTo')?.value || '';

    let filtered = [...receipts];

    if (search) {
        filtered = filtered.filter(r => String(r.id).toLowerCase().includes(search));
    }

    if (dateFrom) {
        const dFrom = new Date(dateFrom);
        filtered = filtered.filter(r => convertToDateStart(r.date) >= dFrom);
    }
    if (dateTo) {
        const dTo = new Date(dateTo);
        filtered = filtered.filter(r => convertToDateEnd(r.date) <= dTo);
    }

    tbody.innerHTML = '';

    if (!filtered.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:12px;">Chưa có phiếu nhập nào phù hợp</td>
            </tr>
        `;
        return;
    }

    filtered.forEach(r => {
        const totalQty = (r.items || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
        const totalValue = (r.items || []).reduce((sum, it) => sum + (Number(it.importPrice) || 0) * (Number(it.quantity) || 0), 0);

        const statusText = r.status === 'completed' ? 'Đã hoàn thành' : 'Nháp';

        const row = `
            <tr style="border-bottom:1px solid #ddd;background:#fff;">
                <td style="padding:10px;">${r.id}</td>
                <td style="padding:10px;">${r.date}</td>
                <td style="padding:10px;">${statusText}</td>
                <td style="padding:10px;">${totalQty}</td>
                <td style="padding:10px;">${totalValue} $</td>
                <td style="padding:10px;display:flex;gap:8px;">
                    <button 
                        style="border:none;background:#2196F3;color:#fff;padding:6px 10px;border-radius:4px;"
                        onclick="openImportModal('Edit', ${r.id})"
                    >Sửa</button>
                    <button 
                        style="border:none;background:#4CAF50;color:#fff;padding:6px 10px;border-radius:4px;"
                        onclick="completeImportReceipt(${r.id})"
                        ${r.status === 'completed' ? 'disabled' : ''}
                    >Hoàn thành</button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}
function openImportModal(mode, id) {
    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const receipts = getImportReceipts();
    let receipt = null;

    if (mode === 'Edit') {
        receipt = receipts.find(r => r.id === id);
        if (!receipt) {
            showAlertFailure('Không tìm thấy phiếu nhập');
            return;
        }
    }

    // Xóa modal cũ nếu có
    const old = document.getElementById('ImportModal');
    if (old) old.remove();

    // HTML modal
    const modalHTML = `
        <div class="modal fade" id="ImportModal" tabindex="-1" role="dialog" aria-labelledby="ImportModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="ImportModalLabel">
                            ${mode === 'Add' ? 'Thêm phiếu nhập' : 'Sửa phiếu nhập'}
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" id="import-close-x">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom:12px;">
                            <label>Ngày nhập: </label>
                            <input type="date" id="ImportDateInput" style="padding:5px 10px;border-radius:8px;"/>
                        </div>
                        <div style="margin-bottom:8px;">
                            <button type="button" id="btnAddImportRow" class="btn btn-sm btn-secondary">
                                Thêm dòng sản phẩm
                            </button>
                        </div>
                        <table class="table table-bordered table-sm">
                            <thead>
                                <tr>
                                    <th style="width:40%;">Sản phẩm</th>
                                    <th style="width:20%;">Giá nhập</th>
                                    <th style="width:20%;">Số lượng</th>
                                    <th style="width:10%;">Xóa</th>
                                </tr>
                            </thead>
                            <tbody id="ImportItemsBody">
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="import-close-btn" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                        <button type="button" id="btnSaveImport" class="btn btn-primary">
                            Lưu phiếu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalElement = document.getElementById('ImportModal');
    const bootstrapModal = new bootstrap.Modal(modalElement);
    bootstrapModal.show();

    // Set ngày
    const dateInput = document.getElementById('ImportDateInput');
    if (mode === 'Edit' && receipt) {
        // receipt.date đang kiểu dd/MM/yyyy
        const [d, m, y] = receipt.date.split('/').map(Number);
        const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dateInput.value = iso;
    } else {
        const now = new Date();
        const iso = now.toISOString().slice(0, 10);
        dateInput.value = iso;
    }

    const tbody = document.getElementById('ImportItemsBody');

    const buildRowHTML = (item = {}) => {
        const currentProductId = item.productId || (products[0]?.Id ?? '');
        return `
            <tr>
                <td>
                    <select class="form-control import-product">
                        ${products.map(p => `
                            <option value="${p.Id}" ${p.Id === currentProductId ? 'selected' : ''}>
                                ${p.ProductName}
                            </option>
                        `).join('')}
                    </select>
                </td>
                <td>
                    <input type="number" min="0" step="0.01" class="form-control import-price" value="${item.importPrice || ''}">
                </td>
                <td>
                    <input type="number" min="1" step="1" class="form-control import-qty" value="${item.quantity || ''}">
                </td>
                <td style="text-align:center;">
                    <button type="button" class="btn btn-sm btn-danger btn-remove-row">&times;</button>
                </td>
            </tr>
        `;
    };

    // Nếu Edit thì đổ các dòng, nếu Add thì 1 dòng trống
    if (mode === 'Edit' && receipt && receipt.items && receipt.items.length) {
        receipt.items.forEach(it => {
            tbody.insertAdjacentHTML('beforeend', buildRowHTML(it));
        });
    } else {
        tbody.insertAdjacentHTML('beforeend', buildRowHTML());
    }

    // Thêm dòng mới
    document.getElementById('btnAddImportRow').addEventListener('click', () => {
        tbody.insertAdjacentHTML('beforeend', buildRowHTML());
    });

    // Xóa dòng
    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-row')) {
            const tr = e.target.closest('tr');
            if (tr) tr.remove();
        }
    });

    // Lưu
    document.getElementById('btnSaveImport').addEventListener('click', () => {
        saveImportFromModal(mode, id, bootstrapModal);
    });

    // Đóng
    document.getElementById('import-close-btn').addEventListener('click', () => bootstrapModal.hide());
    document.getElementById('import-close-x').addEventListener('click', () => bootstrapModal.hide());

    modalElement.addEventListener('hidden.bs.modal', () => {
        modalElement.remove();
    });

    // Nếu phiếu đã hoàn thành thì không cho sửa
    if (mode === 'Edit' && receipt && receipt.status === 'completed') {
        document.getElementById('btnSaveImport').disabled = true;
    }
}
function saveImportFromModal(mode, id, bootstrapModal) {
    const dateInput = document.getElementById('ImportDateInput');
    const tbody = document.getElementById('ImportItemsBody');
    if (!dateInput || !tbody) return;

    const isoDate = dateInput.value;
    if (!isoDate) {
        showAlertFailure('Vui lòng chọn ngày nhập');
        return;
    }
    const d = new Date(isoDate);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const displayDate = `${day}/${month}/${year}`;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const items = [];

    rows.forEach(tr => {
        const productSelect = tr.querySelector('.import-product');
        const priceInput = tr.querySelector('.import-price');
        const qtyInput = tr.querySelector('.import-qty');

        if (!productSelect) return;
        const productId = Number(productSelect.value);
        const importPrice = Number(priceInput.value);
        const quantity = Number(qtyInput.value);

        if (!productId || !importPrice || !quantity) return;

        const products = JSON.parse(localStorage.getItem('Products')) || [];
        const prod = products.find(p => p.Id === productId) || {};

        items.push({
            productId,
            productName: prod.ProductName || '',
            importPrice,
            quantity
        });
    });

    if (!items.length) {
        showAlertFailure('Vui lòng nhập ít nhất 1 dòng sản phẩm với giá và số lượng hợp lệ');
        return;
    }

    const receipts = getImportReceipts();

    if (mode === 'Add') {
        const newId = getNextImportId(); // mã phiếu
        receipts.push({
            id: newId,
            date: displayDate,
            status: 'draft',
            items
        });
        saveImportReceipts(receipts);
        showAlertSuccess('Đã thêm phiếu nhập');
    } else {
        const idx = receipts.findIndex(r => r.id === id);
        if (idx === -1) {
            showAlertFailure('Không tìm thấy phiếu nhập để sửa');
            return;
        }
        if (receipts[idx].status === 'completed') {
            showAlertFailure('Phiếu đã hoàn thành, không thể sửa');
            return;
        }
        receipts[idx].date = displayDate;
        receipts[idx].items = items;
        saveImportReceipts(receipts);
        showAlertSuccess('Đã cập nhật phiếu nhập');
    }

    renderImportList();
    if (bootstrapModal) bootstrapModal.hide();
}
function getNextImportId() {
    const list = getImportReceipts(); // hoặc JSON.parse(localStorage.getItem(IMPORT_KEY)) || []
    if (!list.length) return 1;       // nếu chưa có phiếu nào thì bắt đầu từ 1

    // lấy id lớn nhất hiện có
    const maxId = Math.max(...list.map(r => Number(r.id) || 0));
    return maxId + 1;                 // cộng dần lên
}

function completeImportReceipt(id) {
    const receipts = getImportReceipts();
    const idx = receipts.findIndex(r => r.id === id);

    if (idx === -1) {
        showAlertFailure('Không tìm thấy phiếu nhập');
        return;
    }

    if (receipts[idx].status === 'completed') {
        showAlertFailure('Phiếu này đã hoàn thành rồi');
        return;
    }

    // Hộp thoại xác nhận trước khi hoàn thành
    const ok = confirm(
        'Bạn có chắc muốn đánh dấu phiếu nhập này là "Đã hoàn thành"?' +
        '\nSau khi xác nhận sẽ không thể sửa hoặc hoàn tác.'
    );
    if (!ok) {
        // Người dùng bấm Cancel -> không làm gì cả
        return;
    }

    // Nếu xác nhận thì mới cập nhật trạng thái
    receipts[idx].status = 'completed';
    saveImportReceipts(receipts);
    showAlertSuccess('Đã hoàn thành phiếu nhập');
    renderImportList();
}

const RenderGiaBan = () => {
    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const profitByCategory = loadProfitCategory();

    // Ẩn các phần không dùng
    document.getElementById('ErrorMessage').style.display = "none";
    document.getElementById('pagination-controls').style.display = "none";

    // Tiêu đề
    Content.innerHTML = `
        <div style="margin-left:70px;margin-top:20px;">
            <h2>Quản lý giá bán</h2>
        </div>

        <div style="margin-left:70px;margin-top:10px;width:85%;padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;">
            <h4>1. Tỉ lệ % lợi nhuận theo loại sản phẩm</h4>
            <div style="display:flex;align-items:center;gap:10px;margin-top:10px;flex-wrap:wrap;">
                <select id="SelectCategoryProfit" style="padding:5px 10px;border-radius:6px;">
                    <!-- JS fill -->
                </select>
                <input type="number" id="InputCategoryPercent" placeholder="% lợi nhuận"
                       style="padding:5px 10px;border-radius:6px;width:140px;">
                <button id="BtnSaveCategoryPercent"
                        style="background:#800020;color:#fff;border:none;padding:6px 12px;border-radius:6px;">
                    Lưu tỉ lệ
                </button>
            </div>
            <p style="margin-top:8px;font-size:13px;color:#555;">
                Ghi chú: Tỉ lệ theo loại là mặc định. Nếu sản phẩm có % riêng thì sẽ dùng % riêng.
            </p>
        </div>
    `;

    // Bảng sản phẩm
    Contentcontainer.innerHTML = `
        <div style="margin-left:70px;margin-top:20px;width:85%;padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;">
            <h4>2. Giá vốn, % lợi nhuận, giá bán theo sản phẩm</h4>
            <div style="margin:10px 0;display:flex;gap:10px;align-items:center;">
                <input type="text" id="PriceSearchInput" placeholder="Tìm id sản phẩm..."
                       style="flex:1;padding:5px 10px;border-radius:6px;">
                <button id="BtnSaveAllPrice"
                        style="background:#800020;color:#fff;border:none;padding:6px 12px;border-radius:6px;">
                    Lưu tất cả giá bán
                </button>
            </div>
            <table class="Table" style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                    <tr style="background:#800020;color:#fff;">
                        <th style="padding:8px;">ID</th>
                        <th style="padding:8px;">Tên sản phẩm</th>
                        <th style="padding:8px;">Loại</th>
                        <th style="padding:8px;">Giá vốn</th>
                        <th style="padding:8px;">% lợi nhuận</th>
                        <th style="padding:8px;">Giá bán</th>
                    </tr>
                </thead>
                <tbody id="PriceTableBody"></tbody>
            </table>
        </div>
    `;

    Contentcontainer.style.display = "block";

    // Fill combobox loại ở phần tỉ lệ % loại
    const selectCategory = document.getElementById('SelectCategoryProfit');
    const categories = Array.from(new Set(products.map(p => p.Category))).filter(Boolean);
    selectCategory.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');

    const inputCategoryPercent = document.getElementById('InputCategoryPercent');

    // Khi chọn loại -> hiện % đang lưu (nếu có)
    selectCategory.addEventListener('change', () => {
        const cat = selectCategory.value;
        const percent = profitByCategory[cat] || 0;
        inputCategoryPercent.value = percent;
    });

    // Khởi tạo lần đầu
    if (categories.length > 0) {
        const first = categories[0];
        const percent = profitByCategory[first] || 0;
        inputCategoryPercent.value = percent;
    }

    // Lưu % loại
    document.getElementById('BtnSaveCategoryPercent').addEventListener('click', () => {
        const cat = selectCategory.value;
        const val = Number(inputCategoryPercent.value);
        if (isNaN(val) || val < 0) {
            showAlertFailure('Vui lòng nhập % hợp lệ (>= 0)');
            return;
        }
        profitByCategory[cat] = val;
        saveProfitCategory(profitByCategory);
        showAlertSuccess('Đã lưu tỉ lệ lợi nhuận cho loại ' + cat);
        // Cập nhật lại bảng sản phẩm để dùng tỉ lệ mới
        renderProductPriceTable(products, profitByCategory);
    });

    // Render bảng sản phẩm lần đầu
    renderProductPriceTable(products, profitByCategory);

    // Tìm kiếm theo ID
const searchInput = document.getElementById('PriceSearchInput');
searchInput.addEventListener('input', () => {
    const key = searchInput.value.trim();   // giữ dạng chuỗi
    let filtered = products;

    if (key) {
        filtered = products.filter(p =>
            String(p.Id).includes(key)      // so sánh theo Id
        );
    }

    renderProductPriceTable(filtered, profitByCategory);
});


    // Lưu tất cả giá bán
    document.getElementById('BtnSaveAllPrice').addEventListener('click', () => {
        saveAllProductPrices(profitByCategory);
    });
};
function renderProductPriceTable(listProducts, profitByCategory) {
    const tbody = document.getElementById('PriceTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!listProducts || listProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:10px;">
                    Không có sản phẩm nào
                </td>
            </tr>
        `;
        return;
    }
    listProducts.forEach(p => {
        // Robustly read stored values (allow 0)
        const storedCost = (p.costPrice !== undefined && p.costPrice !== null && p.costPrice !== '') ? p.costPrice : '';
        const productPercent = (p.profitPercent !== undefined && p.profitPercent !== null) ? p.profitPercent : '';
        const defaultPercent = Number(profitByCategory[p.Category] || 0);

        // Use product.Price as fallback base when cost is missing
        const originalPrice = Number(p.Price) || 0;

        // initial base and sale price
        const initialCostNumeric = storedCost === '' ? NaN : Number(storedCost);
        const effectivePercentInitial = (productPercent !== '' ? Number(productPercent) : defaultPercent);
        const baseForCalc = (!Number.isNaN(initialCostNumeric) && initialCostNumeric > 0) ? initialCostNumeric : originalPrice;
        let salePrice = Math.round(baseForCalc * (1 + (Number.isFinite(effectivePercentInitial) ? effectivePercentInitial : 0) / 100) * 100) / 100;

        const row = document.createElement('tr');
        row.setAttribute('data-id', p.Id);

        row.innerHTML = `
            <td style="padding:6px;">${p.Id}</td>
            <td style="padding:6px;">${p.ProductName}</td>
            <td style="padding:6px;">${p.Category}</td>
            <td style="padding:6px;">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputmode="decimal"
                    class="cost-input"
                    value="${storedCost}"
                    style="width:100%;padding:3px 6px;border-radius:4px;"
                >
            </td>
            <td style="padding:6px;">
                <input
                    type="number"
                    min="0"
                    step="0.1"
                    inputmode="decimal"
                    class="percent-input"
                    value="${productPercent !== '' ? productPercent : ''}"
                    placeholder="${defaultPercent}"
                    style="width:100%;padding:3px 6px;border-radius:4px;"
                >
            </td>

            <td style="padding:6px;">
                <span class="sale-output">${salePrice} $</span>
            </td>
        `;

        tbody.appendChild(row);

        // Add live update handlers so admin sees immediate recalculation
        const costInput = row.querySelector('.cost-input');
        const percentInput = row.querySelector('.percent-input');
        const saleOutput = row.querySelector('.sale-output');

        const recalc = () => {
            const costVal = costInput && costInput.value !== '' ? Number(costInput.value) : NaN;
            const percentVal = percentInput && percentInput.value !== '' ? Number(percentInput.value) : defaultPercent;
            const base = (!Number.isNaN(costVal) && costVal > 0) ? costVal : originalPrice;
            const computed = Math.round(base * (1 + (Number.isFinite(percentVal) ? percentVal : 0) / 100) * 100) / 100;
            if (saleOutput) saleOutput.textContent = `${computed} $`;
        };

        if (costInput) costInput.addEventListener('input', recalc);
        if (percentInput) percentInput.addEventListener('input', recalc);
    });
}
function saveAllProductPrices(profitByCategory) {
    let products = JSON.parse(localStorage.getItem('Products')) || [];
    const tbody = document.getElementById('PriceTableBody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('tr');

    rows.forEach(tr => {
        const id = Number(tr.getAttribute('data-id'));
        const costInput = tr.querySelector('.cost-input');
        const percentInput = tr.querySelector('.percent-input');

        if (!costInput) return;

        const rawCost = costInput.value;
        const cost = rawCost === '' ? NaN : Number(rawCost);
        // skip if cost not provided or invalid (don't overwrite product when admin left it empty)
        if (isNaN(cost) || cost < 0) {
            return;
        }

        const product = products.find(p => p.Id === id);
        if (!product) return;

        const catPercent = profitByCategory[product.Category] || 0;
        const inputPercent = percentInput && percentInput.value !== ''
            ? Number(percentInput.value)
            : catPercent;

        if (isNaN(inputPercent) || inputPercent < 0) return;

        const salePrice = Math.round(cost * (1 + inputPercent / 100) * 100) / 100;

        // Lưu vào product
        product.costPrice = cost;
        product.profitPercent = percentInput && percentInput.value !== '' ? inputPercent : null;
        product.Price = salePrice;
    });

    localStorage.setItem('Products', JSON.stringify(products));
    showAlertSuccess('Đã cập nhật giá bán cho sản phẩm');
    // render lại để cập nhật giá hiển thị
    RenderGiaBan();
}
function changeThreshold() {
    const input = document.getElementById("thresholdInput");
    let val = Number(input.value);

    if (isNaN(val) || val < 1) {
        LOW_STOCK_THRESHOLD = 1;      // không cho nhập tào lao
        input.value = 1;
    } else {
        LOW_STOCK_THRESHOLD = val;    // cập nhật biến global
    }

    RenderTonKho(); // chạy lại bảng với ngưỡng mới
}

const RenderTonKho = () => {
    const products = JSON.parse(localStorage.getItem('Products')) || [];

    document.getElementById('ErrorMessage').style.display = "none";
    document.getElementById('pagination-controls').style.display = "none";

    // PHẦN 1: tồn tại một thời điểm
    Content.innerHTML = `
        <div style="margin-left:70px;margin-top:20px;">
            <h2>Quản lý tồn kho</h2>
        </div>

        <div style="margin-left:70px;margin-top:10px;width:85%;padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;">
            <h4>1. Tra cứu tồn tại một thời điểm</h4>
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:8px;">
                <select id="StockCategoryFilter" style="padding:5px 10px;border-radius:6px;">
                    <option value="All">Tất cả loại</option>
                </select>
                <input type="text" id="StockNameFilter" placeholder="Nhập ID sản phẩm..."
                       style="padding:5px 10px;border-radius:6px;flex:1;min-width:160px;">
                <span>Thời điểm:</span>
                <input type="date" id="StockAtDate"
                       style="padding:5px 10px;border-radius:6px;">
            </div>
            <p style="margin-top:6px;font-size:13px;color:#555;">
                Cảnh báo sản phẩm sắp hết hàng nếu tồn &le; ${LOW_STOCK_THRESHOLD}.
            </p>
        </div>
    `;

    // PHẦN 2 + 3
    Contentcontainer.innerHTML = `
        <div style="margin-left:70px;margin-top:20px;width:85%;padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;">
            <h4>2. Nhập – xuất – tồn trong khoảng thời gian</h4>
            <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:8px;">
                <select id="StockProductSelect"
                        style="padding:5px 10px;border-radius:6px;min-width:180px;">
                    <option value="All">Tất cả sản phẩm</option>
                </select>

                <input type="text" id="StockRangeSearch"
                       placeholder="Nhập ID hoặc tên sản phẩm..."
                       style="padding:5px 10px;border-radius:6px;min-width:220px;flex:1;">

                <span>Từ</span>
                <input type="date" id="StockFromDate"
                       style="padding:5px 10px;border-radius:6px;">
                <span>Đến</span>
                <input type="date" id="StockToDate"
                       style="padding:5px 10px;border-radius:6px;">
                <button id="BtnViewRange"
                        style="background:#800020;color:#fff;border:none;padding:6px 12px;border-radius:6px;">
                    Xem
                </button>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;">
                <thead>
                    <tr style="background:#800020;color:#fff;">
                        <th style="padding:8px;">ID</th>
                        <th style="padding:8px;">Tên sản phẩm</th>
                        <th style="padding:8px;">Loại</th>
                        <th style="padding:8px;">Nhập</th>
                        <th style="padding:8px;">Xuất</th>
                        <th style="padding:8px;">Tồn cuối kỳ</th>
                    </tr>
                </thead>
                <tbody id="StockRangeBody"></tbody>
            </table>
        </div>
        <div style="margin: 10px 70px;">
            <label for="thresholdInput">Ngưỡng cảnh báo tồn kho (≤): </label>
            <input 
                id="thresholdInput" 
                type="number" 
                min="1" 
                value="${LOW_STOCK_THRESHOLD}" 
                onchange="changeThreshold()" 
                style="padding: 6px; width: 80px; border-radius: 5px;"
            >

        </div>

        <div style="margin-left:70px;margin-top:20px;width:85%;padding:12px;border:1px solid #ddd;border-radius:8px;background:#fff;">
            <h4>3. Tồn kho hiện tại theo sản phẩm / loại</h4>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:10px;">
                <thead>
                    <tr style="background:#800020;color:#fff;">
                        <th style="padding:8px;">ID</th>
                        <th style="padding:8px;">Tên sản phẩm</th>
                        <th style="padding:8px;">Loại</th>
                        <th style="padding:8px;">Tồn tại thời điểm</th>
                        <th style="padding:8px;">Cảnh báo</th>
                    </tr>
                </thead>
                <tbody id="StockNowBody"></tbody>
            </table>
        </div>
    `;

    Contentcontainer.style.display = "block";

    // fill combobox
    const categories = Array.from(new Set(products.map(p => p.Category))).filter(Boolean);
    const catSelect = document.getElementById('StockCategoryFilter');
    categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        catSelect.appendChild(opt);
    });

    const prodSelect = document.getElementById('StockProductSelect');
    products.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.Id;
        opt.textContent = `${p.Id} - ${p.ProductName}`;
        prodSelect.appendChild(opt);
    });

    const today = new Date();
    const isoToday = today.toISOString().slice(0, 10);
    document.getElementById('StockAtDate').value  = isoToday;
    document.getElementById('StockFromDate').value = isoToday;
    document.getElementById('StockToDate').value   = isoToday;

    // ===== PHẦN 3: tồn tại thời điểm =====
    function renderStockNow() {
        const tbody = document.getElementById('StockNowBody');
        const key   = document.getElementById('StockNameFilter').value.trim();
        const catVal  = document.getElementById('StockCategoryFilter').value;
        const atIso   = document.getElementById('StockAtDate').value;
        const atDate  = atIso ? new Date(atIso) : new Date();

        tbody.innerHTML = '';

        const filtered = products.filter(p => {
            if (catVal !== 'All' && p.Category !== catVal) return false;
            if (key && !String(p.Id).includes(key)) return false;
            return true;
        });

        if (!filtered.length) {
            tbody.innerHTML = `
                <tr><td colspan="5" style="padding:10px;text-align:center;">Không có sản phẩm phù hợp</td></tr>
            `;
            return;
        }

        filtered.forEach(p => {
            const stock = getStockAtDate(p.Id, atDate);
            const warn = stock <= LOW_STOCK_THRESHOLD 
                ? `<span style="color:red;font-weight:bold;">Sắp hết hàng</span>`
                : `<span style="color:green;">OK</span>`;

            const tr = `
                <tr style="border-bottom:1px solid #ddd;background:#fff;">
                    <td style="padding:6px;">${p.Id}</td>
                    <td style="padding:6px;">${p.ProductName}</td>
                    <td style="padding:6px;">${p.Category}</td>
                    <td style="padding:6px;">${stock}</td>
                    <td style="padding:6px;">${warn}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', tr);
        });
    }

    // ===== PHẦN 2: nhập – xuất – tồn theo khoảng =====
    function renderStockRange() {
        const tbody = document.getElementById('StockRangeBody');
        const prodVal = document.getElementById('StockProductSelect').value;
        const fromIso = document.getElementById('StockFromDate').value;
        const toIso   = document.getElementById('StockToDate').value;
        const searchKey = (document.getElementById('StockRangeSearch')?.value || '')
                            .trim().toLowerCase();

        if (!fromIso || !toIso) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="padding:10px;text-align:center;">
                    Vui lòng chọn đủ ngày Từ và Đến
                </td></tr>
            `;
            return;
        }

        const fromDate = new Date(fromIso);
        const toDate   = new Date(toIso);

        tbody.innerHTML = '';

        let list = (prodVal === 'All')
            ? products
            : products.filter(p => p.Id === Number(prodVal));

        if (searchKey) {
            list = list.filter(p =>
                String(p.Id).toLowerCase().includes(searchKey) ||
                p.ProductName.toLowerCase().includes(searchKey)
            );
        }

        if (!list.length) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="padding:10px;text-align:center;">
                    Không có sản phẩm phù hợp
                </td></tr>
            `;
            return;
        }

        list.forEach(p => {
            const { importQty, exportQty } = getImportExportInRange(p.Id, fromDate, toDate);
            const closingStock = getStockAtDate(p.Id, toDate);

            const tr = `
                <tr style="border-bottom:1px solid #ddd;background:#fff;">
                    <td style="padding:6px;">${p.Id}</td>
                    <td style="padding:6px;">${p.ProductName}</td>
                    <td style="padding:6px;">${p.Category}</td>
                    <td style="padding:6px;">${importQty}</td>
                    <td style="padding:6px;">${exportQty}</td>
                    <td style="padding:6px;">${closingStock}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', tr);
        });
    }

    // gắn event
    document.getElementById('StockCategoryFilter').addEventListener('change', renderStockNow);
    document.getElementById('StockNameFilter').addEventListener('input', renderStockNow);
    document.getElementById('StockAtDate').addEventListener('change', renderStockNow);

    document.getElementById('BtnViewRange').addEventListener('click', renderStockRange);
    document.getElementById('StockRangeSearch').addEventListener('input', renderStockRange);

    // render lần đầu
    renderStockNow();
    renderStockRange();
};


const RenderThongKe=()=>{
    // generateFakeData();
    Content.innerHTML=`
        <div style="width: 1500px;margin-left:40px;margin-top:20px">
              <div class="order-statistical" id="order-statistical">
                    <div class="order-statistical-item">
                        <div class="order-statistical-item-content">
                            <p class="order-statistical-item-content-desc" style="font-weight:500;" id="soLuongSanPham"></p>
                            <h4 class="order-statistical-item-content-h" id="quantity-product"></h4>
                        </div>
                        <div class="order-statistical-item-icon">
                             <i class="fa-solid fa-box-open order-statistical-item-icon"></i>
                        </div>
                    </div>
                    <div class="order-statistical-item">
                        <div class="order-statistical-item-content">
                            <p class="order-statistical-item-content-desc" id="soLuongDon" style="font-weight:500;"></p>
                            <h4 class="order-statistical-item-content-h" id="quantity-order"></h4>
                        </div>
                        <div class="order-statistical-item-icon">
                            <i class="fa-light fa-file-lines"></i>
                        </div>
                    </div>
                    <div class="order-statistical-item">
                        <div class="order-statistical-item-content">
                            <p class="order-statistical-item-content-desc" style="font-weight:500;" id="DoanhThu"></p>
                            <h4 class="order-statistical-item-content-h" id="quantity-sale"></h4>
                        </div>
                        <div class="order-statistical-item-icon">
                            <i class="fa-light fa-dollar-sign"></i>
                        </div>
                    </div>
                </div>
                <div>
                    <canvas  style="width: 800px;height:300px;" id="GraphUI"></canvas>
                </div>

        </div>  
    `;
    SoluongSanPham();
    SoLuongDon();
    saveRecentMonthlyRevenueToLocalStorage();
    Sucess();
    const recentMonthlyRevenue = JSON.parse(localStorage.getItem('RecentMonthlyRevenue')) || [];
    
        const monthLabel = [`thang ${recentMonthlyRevenue[0].month}`,`thang ${recentMonthlyRevenue[1].month}`,`thang ${recentMonthlyRevenue[2].month}`,`thang ${recentMonthlyRevenue[3].month}`,`thang ${recentMonthlyRevenue[4].month}`,`thang ${recentMonthlyRevenue[5].month}`];
        const PrictLabel = [recentMonthlyRevenue[0].revenue,recentMonthlyRevenue[1].revenue,recentMonthlyRevenue[2].revenue,recentMonthlyRevenue[3].revenue,recentMonthlyRevenue[4].revenue,recentMonthlyRevenue[5].revenue,]
    const ctx = document.getElementById('GraphUI');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels:monthLabel,
        datasets: [{
          label: 'Bieu Do Doanh Thu Cac Thang',
          data: PrictLabel,
          borderWidth: 1,
          tension:0.3,
            borderColor: 'rgb(75, 192, 192)'
        }]
      },
      options: {
        scales: {
         
        },
      }});
    Contentcontainer.innerHTML=`
      <div style="display:flex; gap:20px;width:70%;">
            <select name="DashBoard" id="ChooseDashBoard" class="Shoes" style="background-color:#800020;color:white;">
                        <option value="Products">Products</option>
                        <option value="User">User</option>
            </select>
            <button style="background-color: #800020;color: white;width:100px;border: 1px solid rgb(225, 222, 222);box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"><i class="fa-solid fa-chart-line-up"></i></button>
            <button style="background-color: #800020;color: white;width:100px;border: 1px solid rgb(225, 222, 222);box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"><i class="fa-regular fa-chart-line-down"></i></button>
            <select name="Month" id="ChooseMonth" class="Shoes" style="background-color:#800020;color:white;width:140px;">
                     
            </select>
            </div>
             <div style="display:flex;width: 1500px;gap:15px;">
            <div class="Tk-khachhang" style="width:70%; height:420px">
                    <table>
                        <p>Bang Thong Ke</p>
                       <thead id="head">
                            </thead>
                             <tbody id="ProTable">
                            </tbody>
                            
                    </table>
                </div>
            <div style="width:30%;padding-top:30px;">
                <canvas  style="width: 100%;height:100%;" id="GraphCategory"></canvas>            
            </div>
      </div>
    `
    populateMonthsDropdown(); 
    displayTop5Largest(); 
    document.querySelector('button:nth-child(2)').addEventListener('click', displayTop5Largest); // Nút lớn nhất
    document.querySelector('button:nth-child(3)').addEventListener('click', displayTop5Smallest); // Nút nhỏ nhất
    document.getElementById('ChooseMonth').addEventListener('change', displayTop5Largest); // Hiển thị theo tháng khi chọn
      document.getElementById('ChooseDashBoard').addEventListener('change',displayTop5Largest)
    // Hiển thị mặc định top 5 lớn nhất theo tháng hiện tại khi tải trang
    const temp = document.getElementById('GraphCategory');
    // Dropdown cần cập nhật
    const dropdown = document.getElementById('ChooseMonth');
    
    // Xóa các `option` cũ (giữ lại "Select Month")
    dropdown.innerHTML = `<option value="">Select Month</option>`;
    
    // Thêm các tháng từ dữ liệu RecentMonthlyRevenue
    recentMonthlyRevenue.forEach(({ month, year }) => {
        const option = document.createElement('option');
        option.value = `${month}/${year}`; // Giá trị sẽ là "tháng/năm"
        option.textContent = `Tháng ${month} - Năm ${year}`; // Nội dung hiển thị
        dropdown.appendChild(option);
    });
    document.getElementById('ChooseMonth').addEventListener('change', DoanhThuRender);
    DoanhThuRender ();
    CategoryGraph();
    const categoryG = JSON.parse(localStorage.getItem('CategoryGraph'))||[];
    const datagraph = [categoryG.Basketball,categoryG.Football,categoryG.Gym,categoryG.Running,categoryG.Skateboarding]
    new Chart(temp, {
      type: 'polarArea',
      data: {
        labels: [
            'Basketball',
            'Football',
            'Gym',
            'Running',
            'Skateboarding'
          ],
          datasets: [{
            label: 'bieu do nha',
            data: datagraph,
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(75, 192, 192)',
              'rgb(255, 205, 86)',
              'rgb(201, 203, 207)',
              'rgb(54, 162, 235)'
            ]
          }]
      },
      options: {
        scales: {
          
        }
      }});
    document.getElementById('pagination-controls').style.display="none";
      document.getElementById('Content-Container').style.display="block"
    document.getElementById('ErrorMessage').style.display="none";
}
const SoluongSanPham = ()=>{
    const ProductLocal = JSON.parse(localStorage.getItem('Products'))||[];
    let temp = ProductLocal.length;
    document.getElementById('soLuongSanPham').innerText = `Tổng số sản phẩm: ${temp}`
}
const SoluongSanPhamTong = ()=>{
    const ProductLocal = JSON.parse(localStorage.getItem('Products'))||[];
    let temp = ProductLocal.length;
    document.getElementById('soLuongSanPham').innerText = temp
}
const SoLuongDon = ()=>{
    const CheckOutLocal = JSON.parse(localStorage.getItem('Sucess'))||[];
    let temp = CheckOutLocal.length;
     document.getElementById('soLuongDon').innerText = `Số Luong Đơn Hàng ${temp}`
}
const SoLuongDonTong = ()=>{
    const CheckOutLocal = JSON.parse(localStorage.getItem('Sucess'))||[];
    let temp = CheckOutLocal.length;
     document.getElementById('soLuongDon').innerText =temp
}
const saveRecentMonthlyRevenueToLocalStorage = () => {
    const orders = JSON.parse(localStorage.getItem('Sucess')) || [];
    
    if (orders.length === 0) {
        console.log("No orders found in localStorage.");
        return [];
    }

    // Lấy doanh thu hiện tại từ LocalStorage
    const existingRevenue = JSON.parse(localStorage.getItem('RecentMonthlyRevenue')) || [];
    const monthlyRevenue = {};
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (1-12)
    const currentYear = currentDate.getFullYear(); // Năm hiện tại

    // Tạo danh sách 6 tháng gần nhất
    const recentMonths = Array.from({ length: 6 }, (_, i) => {
        const month = (currentMonth - i - 1 + 12) % 12 + 1; // Tính toán tháng trước
        const year = currentYear - (currentMonth - i <= 0 ? 1 : 0); // Lùi năm nếu cần
        return { month, year };
    }).reverse(); // Đảo ngược để giữ thứ tự từ cũ đến mới

    // Tính doanh thu từ các đơn hàng mới
    orders.forEach(order => {
        const [day, month, year] = order.date.split('/').map(Number);

        if (!recentMonths.some(rm => rm.month === month && rm.year === year)) {
            return; // Bỏ qua các đơn hàng không thuộc 6 tháng gần nhất
        }

        const key = `${month}/${year}`;
        if (!monthlyRevenue[key]) {
            monthlyRevenue[key] = 0;
        }

        // Cộng doanh thu
        monthlyRevenue[key] += order.totalprice;
    });

    // Gộp doanh thu từ dữ liệu hiện có
    existingRevenue.forEach(entry => {
        const key = `${entry.month}/${entry.year}`;
        if (!monthlyRevenue[key]) {
            monthlyRevenue[key] = entry.revenue;
        }
    });

    // Chuyển đổi thành mảng và lưu vào localStorage
    const revenueArray = Object.keys(monthlyRevenue).map(key => {
        const [month, year] = key.split('/').map(Number);
        return { month, year, revenue: monthlyRevenue[key] };
    });

    // Sắp xếp mảng theo thứ tự tháng/năm
    revenueArray.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });

    // Chỉ giữ lại 6 tháng gần nhất
    const filteredRevenueArray = revenueArray.filter(entry =>
        recentMonths.some(rm => rm.month === entry.month && rm.year === entry.year)
    );

    // Lưu mảng vào localStorage
    localStorage.setItem('RecentMonthlyRevenue', JSON.stringify(filteredRevenueArray));

    console.log("Recent Monthly Revenue updated:", filteredRevenueArray);
    return filteredRevenueArray;
};


const DoanhThuRender = () => {
    // Lấy giá trị từ dropdown
    const dropdown = document.getElementById('ChooseMonth');
    let selectedValue = dropdown.value;

    // Nếu không chọn, mặc định là tháng hiện tại
    if (!selectedValue) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // Tháng hiện tại (1-12)
        const currentYear = now.getFullYear(); // Năm hiện tại
        selectedValue = `${currentMonth}/${currentYear}`;
        dropdown.value = selectedValue; // Cập nhật giá trị mặc định trong dropdown
    }

    const [selectedMonth, selectedYear] = selectedValue.split('/').map(Number);
    const Months = JSON.parse(localStorage.getItem('RecentMonthlyRevenue')) || [];

    // Tìm doanh thu cho tháng/năm đã chọn
    const temp = Months.find(p => p.month === selectedMonth && p.year === selectedYear);

    if (temp) {
        document.getElementById('DoanhThu').innerText = `Doanh thu tháng ${selectedMonth}/${selectedYear}: ${temp.revenue}$`;
    } else {
        document.getElementById('DoanhThu').innerText = `Không có dữ liệu doanh thu cho tháng ${selectedMonth}/${selectedYear}.`;
    }
};

const displayTop5Largest = () => {
    const selectedDashboard = document.getElementById('ChooseDashBoard').value; // Lấy loại cần hiển thị (Products/User)
    const orders = filterOrdersBySelectedMonth(); // Lọc đơn hàng theo tháng được chọn

    if (selectedDashboard === "Products") {
        displayProducts(orders, "largest");
    } else if (selectedDashboard === "User") {
        displayUsers(orders, "largest");
    }
};

const displayTop5Smallest = () => {
    const selectedDashboard = document.getElementById('ChooseDashBoard').value; // Lấy loại cần hiển thị (Products/User)
    const orders = filterOrdersBySelectedMonth(); // Lọc đơn hàng theo tháng được chọn

    if (selectedDashboard === "Products") {
        displayProducts(orders, "smallest");
    } else if (selectedDashboard === "User") {
        displayUsers(orders, "smallest");
    }
};

const filterOrdersBySelectedMonth = () => {
    const selectedMonth = document.getElementById('ChooseMonth').value; // Lấy giá trị từ dropdown
    const [selectedMonthNum, selectedYear] = selectedMonth.split('/').map(Number);

    const orders = JSON.parse(localStorage.getItem('Sucess')) || [];
    return orders.filter(order => {
        const [day, month, year] = order.date.split('/').map(Number);
        return month === selectedMonthNum && year === selectedYear; // Lọc theo tháng/năm được chọn
    });
};

const populateMonthsDropdown = () => {
    const orders = JSON.parse(localStorage.getItem('Sucess')) || [];
    const monthsSet = new Set();

    // Lấy danh sách các tháng có trong đơn hàng
    orders.forEach(order => {
        const [day, month, year] = order.date.split('/').map(Number);
        monthsSet.add(`${month}/${year}`);
    });

    const dropdown = document.getElementById('ChooseMonth');
    dropdown.innerHTML = ''; // Xóa các tùy chọn cũ
    monthsSet.forEach(monthYear => {
        const option = document.createElement('option');
        option.value = monthYear;
        option.textContent = monthYear;
        dropdown.appendChild(option);
    });

    // Mặc định chọn tháng hiện tại
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Tháng hiện tại (1-12)
    const currentYear = now.getFullYear(); // Năm hiện tại
    const currentMonthValue = `${currentMonth}/${currentYear}`;

    if (monthsSet.has(currentMonthValue)) {
        dropdown.value = currentMonthValue;
    }
};

const filterOrdersByCurrentMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth() +1; // Tháng hiện tại (1-12)
    const currentYear = now.getFullYear(); // Năm hiện tại

    const orders = JSON.parse(localStorage.getItem('Sucess')) || [];
    return orders.filter(order => {
        const [day, month, year] = order.date.split('/').map(Number);
        return month === currentMonth && year === currentYear; // Lọc theo tháng/năm hiện tại
    });
};

const displayProducts = (orders, type) => {
    const productStats = {};
    orders.forEach(order => {
        order.cartProduct.forEach(product => {
            if (!productStats[product.product_id]) {
                productStats[product.product_id] = {
                    productId: product.product_id,
                    productName: product.name,
                    totalQuantity: 0,
                    totalRevenue: 0
                };
            }
            productStats[product.product_id].totalQuantity += product.quantity;
            productStats[product.product_id].totalRevenue += product.price * product.quantity;
        });
    });
    let sortedProducts = Object.values(productStats).sort((a, b) => a.totalRevenue - b.totalRevenue);
    console.log(sortedProducts)
   
    // Lọc sản phẩm theo loại
    let filteredProducts;
    if (type === "largest") {
        filteredProducts = sortedProducts.slice(-5).reverse();
    } else if (type === "smallest") {
        filteredProducts = sortedProducts.slice(0, 5);
    }

    // Hiển thị kết quả
    renderTable(filteredProducts, "Sản phẩm");
};



const displayUsers = (orders, type) => {
    const userStats = {};

    orders.forEach(order => {
        if (!userStats[order.userId]) {
            userStats[order.userId] = {
                userId: order.userId,
                fullname: order.fullname,
                phone: order.phone,
                totalSpent: 0
            };
        }

        userStats[order.userId].totalSpent += order.totalprice;
    });

    const sortedUsers = Object.values(userStats).sort((a, b) => b.totalSpent - a.totalSpent);
    const filteredUsers = type === "largest" ? sortedUsers.slice(0, 5) : sortedUsers.slice(-5).reverse();

    // Render bảng
    renderTable(filteredUsers, "Người dùng");
};


const renderTable = (data, type) => {
    const tableBody = document.getElementById('ProTable');
    const thead = document.getElementById('head');
    if (type === "Sản phẩm") {
        thead.innerHTML = `
            <tr>
                <th>STT</th>
                <th>ID Sản Phẩm</th>
                <th>Tên Sản phẩm</th>
                <th>Số lượng bán ra</th>
                <th>Tổng Doanh Thu</th>
                <th>Chi tiết</th>
            </tr>`;
    } else if (type === "Người dùng") {
        thead.innerHTML = `
            <tr>
                <th>STT</th>
                <th>ID User</th>
                <th>Username</th>
                  <th>Phone</th>
                <th>Tổng Mua</th>
                <th>Chi tiết</th>
            </tr>`;
    }
    tableBody.innerHTML = data
        .map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.productId || item.userId}</td>
                <td>${item.productName || item.fullname}</td>
                <td>${item.totalQuantity || item.phone}</td>
                <td>${item.totalRevenue || item.totalSpent} $</td>
                <td><button style="color: black;border: 1px solid black;"    onClick="Detail(${item.productId || 'null'}, ${item.userId || 'null'}, '${type}')">>
                    <i style="font-size:13px;color:white;" class="fa-solid fa-eye"></i>
                </button></td>
            </tr>`)
        .join('');
};
const Detail = (productId, userId, type) => {
    if (type === "Sản phẩm") {
        const modalDetailProduct = `
        <div class="modal fade" id="DetailProduct" tabindex="-1" role="dialog" aria-labelledby="DetailProductLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content" style="width:600px">
                    <div class="modal-headerr">
                        <h5 class="modal-title" id="DetailProductLabel">Chi Tiết Sản Phẩm</h5>
                        <button id="close-btn2" type="button" style="box-shadow: none;position:relative;bottom:30px;left:20px" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                    <div class="Tk-Product" >
                    <table>
                        <thead >
                             <tr>
                                <th>MaDon</th>
                                <th>Tên Sản phẩm</th>
                                <th>Số lượng bán ra</th>
                                <th>Tổng tien giay</th>
                                <th>tong tien don</th>
                            </tr>
                        </thead>
                             <tbody id="ProductTableDetail">
                            </tbody>
                    </table>
                    </div>
                    </div>
                    <div class="modal-footerr">
                        <button id="close-btn1" style="position:relative;left:400px" type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        // Thêm modal vào DOM
        document.body.insertAdjacentHTML('beforeend', modalDetailProduct);
        const modalElement = document.getElementById('DetailProduct');
        const bootstrapModal = new bootstrap.Modal(modalElement);
        
        // Hiển thị modal
        bootstrapModal.show();
        document.getElementById('close-btn1').addEventListener('click', () => {
            bootstrapModal.hide();
        }); 
        document.getElementById('close-btn2').addEventListener('click', () => {
            bootstrapModal.hide();
        }); 
        renderDataDetailPro(productId);

        // Xóa modal khỏi DOM khi đóng
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });

    }
    else if(type === "Người dùng"){
        const modalDetailUser = `
        <div class="modal fade" id="DetailUser" tabindex="-1" role="dialog" aria-labelledby="DetailUserLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content" style="width:600px">
                    <div class="modal-headerr">
                        <h5 class="modal-title" id="DetailUserLabel">Chi Tiết Khach Hang</h5>
                        <button id="close-btn2" type="button" style="box-shadow: none;position:relative;bottom:30px;left:20px" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                    <div class="Tk-Product" >
                    <table>
                        <thead >
                             <tr>
                                <th>MaDon</th>
                                <th>Tên Khach Hang</th>
                                <th>Ten Giay da Mua</th>
                                <th>So Luong Giay</th>
                                <th>tong tien giay</th>
                            </tr>
                        </thead>
                             <tbody id="UserTableDetail">
                            </tbody>
                    </table>
                    </div>
                    </div>
                    <div class="modal-footerr">
                        <button id="close-btn1" style="position:relative;left:400px" type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>`;


        document.body.insertAdjacentHTML('beforeend', modalDetailUser);
        const modalElement = document.getElementById('DetailUser');
        const bootstrapModal = new bootstrap.Modal(modalElement);


        bootstrapModal.show();
        renderDataDetailUser(userId);
        document.getElementById('close-btn1').addEventListener('click', () => {
            bootstrapModal.hide();
        }); 
        document.getElementById('close-btn2').addEventListener('click', () => {
            bootstrapModal.hide();
        }); 
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });

    }
};
const renderDataDetailPro = (id) =>{
    const tableBody = document.getElementById('ProductTableDetail');
    const productDetails = JSON.parse(localStorage.getItem('Sucess'))
    .filter(order => order.cartProduct.some(product => product.product_id === id))
    .map(order => {
        const product = order.cartProduct.find(product => product.product_id === id);
        return {
            orderId: order.orderId,
            productName: product.name,
            quantity: product.quantity,
            price: product.price,
            totalPrice: order.totalprice
        };
    });
    tableBody.innerHTML = productDetails
        .map(detail => `
            <tr>
                <td>${detail.orderId}</td>
                <td>${detail.productName}</td>
                <td>${detail.quantity}</td>
                <td>${detail.price } $</td>
                <td>${detail.totalPrice} $</td>
            </tr>`)
        .join('');
}
const Sucess = () =>{
    const Checkout = JSON.parse(localStorage.getItem('CheckOut'))||[];
    const sucessfull=Checkout.filter(p => p.status == 1);
    localStorage.setItem('Sucess',JSON.stringify(sucessfull));
}
const renderDataDetailUser = (userId) => {
    const orders = JSON.parse(localStorage.getItem("Sucess")) || [];
    const users = JSON.parse(localStorage.getItem("Users")) || [];


    const user = users.find(user => user.userId === userId);
    if (!user) {
        console.error(`User with ID ${userId} not found.`);
        return;
    }


    const userOrders = orders.filter(order => order.userId === userId);
    const userDetails = userOrders.flatMap(order => 
        order.cartProduct.map(product => ({
            MaDon: order.orderId,
            TenKhachHang: order.fullname,
            TenGiay: product.name,
            SoLuongGiay: product.quantity,
            TongTienGiay: product.quantity * product.price
        }))
    );

    const tableBody = document.getElementById('UserTableDetail');
    tableBody.innerHTML = userDetails
        .map(detail => `
            <tr>
                <td>${detail.MaDon}</td>
                <td>${detail.TenKhachHang}</td>
                <td>${detail.TenGiay}</td>
                <td>${detail.SoLuongGiay}</td>
                <td>${detail.TongTienGiay} $</td>
            </tr>`)
        .join('');
};
const CategoryGraph = () => {
    const orders = JSON.parse(localStorage.getItem("Sucess")) || []; // Lấy danh sách đơn hàng từ localStorage
    const products = JSON.parse(localStorage.getItem("Products")) || []; // Lấy danh sách sản phẩm từ localStorage

    // Khởi tạo đối tượng lưu số lượng bán ra cho từng loại
    const salesByCategory = {
        Basketball: 0,
        Football: 0,
        Running: 0,
        Gym: 0,
        Skateboarding: 0
    };

    // Lặp qua từng đơn hàng
    orders.forEach(order => {
        order.cartProduct.forEach(product => {
            const productInfo = products.find(p => p.Id === product.product_id);
            if (productInfo && productInfo.Category) {
                // Tăng số lượng bán cho danh mục tương ứng
                if (salesByCategory[productInfo.Category] !== undefined) {
                    salesByCategory[productInfo.Category] += product.quantity;
                }
            }
        });
    });
    localStorage.setItem('CategoryGraph',JSON.stringify(salesByCategory));
    
};
const Logout = () => {
    sessionStorage.removeItem('adminLogin');
    showAlertSuccess('Dang Xuat Thanh Cong');
    setTimeout(() => {
        window.location.href = "../HomePage.html";
    }, 1000); 
};


    function resetUserPassword(userId) {
    const users = JSON.parse(localStorage.getItem('Users')) || [];
    const index = users.findIndex(u => u.userId === userId);
    if (index === -1) {
        showAlertFailure('Không tìm thấy user');
        return;
    }

    const currentPass = users[index].password || '';

    // hỏi mật khẩu mới, hiện luôn mật khẩu cũ cho admin xem
    const newPass = prompt(
        'Mật khẩu hiện tại: ' + currentPass + '\nNhập mật khẩu mới:',
        currentPass // để sẵn mật khẩu cũ, admin sửa luôn
    );

    // bấm Cancel thì thôi
    if (newPass === null) return;

    // bỏ khoảng trắng 2 đầu
    const finalPass = newPass.trim();
    if (finalPass === '') {
        showAlertFailure('Mật khẩu không được rỗng');
        return;
    }

    users[index].password = finalPass;
    localStorage.setItem('Users', JSON.stringify(users));
    showAlertSuccess('Đã đổi mật khẩu');

    // render lại bảng
    SearchAndRender('Users', currentPage, itemsPerPage);
}
function toggleUserStatus(userId) {
    const users = JSON.parse(localStorage.getItem('Users')) || [];
    const index = users.findIndex(u => u.userId === userId);
    if (index === -1) {
        showAlertFailure('Không tìm thấy user');
        return;
    }

    // Đang hoạt động -> khóa
    if (users[index].status === 'Hoat Dong') {
        users[index].status = 'Da Khoa';
        showAlertSuccess('Đã khóa tài khoản');
    } else {
        // Đang khóa -> mở
        users[index].status = 'Hoat Dong';
        showAlertSuccess('Đã mở khóa tài khoản');
    }

    localStorage.setItem('Users', JSON.stringify(users));
    // render lại bảng
    SearchAndRender('Users', currentPage, itemsPerPage);
}


const generateFakeData = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Tháng hiện tại (1-12)
    const currentYear = currentDate.getFullYear(); // Năm hiện tại

    // Tạo danh sách 6 tháng gần nhất
    const recentMonths = Array.from({ length: 6 }, (_, i) => {
        const month = (currentMonth - i - 1 + 12) % 12 + 1; // Tính toán tháng trước
        const year = currentYear - (currentMonth - i <= 0 ? 1 : 0); // Lùi năm nếu cần
        return { month, year };
    }).reverse(); // Đảo ngược để giữ thứ tự từ cũ đến mới

    // Tạo dữ liệu giả
    const fakeOrders = [];
    recentMonths.forEach(({ month, year }) => {
        const totalOrders = Math.floor(Math.random() * 10) + 1; // Số lượng đơn hàng ngẫu nhiên (1-10)
        for (let i = 0; i < totalOrders; i++) {
            const day = Math.floor(Math.random() * 28) + 1; // Ngày ngẫu nhiên (1-28)
            const totalprice = Math.floor(Math.random() * 500) + 100; // Tổng giá trị đơn hàng (100-600)

            fakeOrders.push({
                date: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
                totalprice,
                CheckOutId: Math.floor(Math.random() * 100000),
                fullname: `Customer ${i + 1}`,
                phone: `090${Math.floor(Math.random() * 9000000 + 1000000)}`,
                addressdetail: `Address ${i + 1}`,
                city: "Sample City",
                district: "Sample District",
                ward: "Sample Ward",
                paymentMethod: "cash",
                status: Math.floor(Math.random() * 3) + 1, // Random status (1, 2, 3)
                totalquantity: Math.floor(Math.random() * 10) + 1, // Số lượng sản phẩm (1-10)
                userId: Math.floor(Math.random() * 100000)
            });
        }
    });

    // Lưu dữ liệu giả vào localStorage
    localStorage.setItem('CheckOut', JSON.stringify(fakeOrders));

    console.log("Fake CheckOut Data Created:", fakeOrders);
};

function setupOrderStatusCheckbox() {
    const checkboxes = document.querySelectorAll('input[name="order-status"]');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) {
                checkboxes.forEach(other => {
                    if (other !== cb) {
                        other.checked = false;
                    }
                });
            }
        });
    });
}

