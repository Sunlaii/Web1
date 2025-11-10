// Ensure only authenticated admin can access this page.
(function ensureAdminAuth() {
    try {
        const userLogin = JSON.parse(localStorage.getItem('userLogin')) || null;
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
            throw new Error('Unauthorized access to admin');
        }
    } catch (e) {
        // If parsing localStorage fails, block access as well
        document.documentElement.innerHTML = `<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial,Helvetica,sans-serif;background:#111;color:#fff"><div style="text-align:center"><h2>Không có quyền truy cập</h2><p>Vui lòng đăng nhập qua <a style='color:#4fc3f7' href='admin-login.html'>Admin Login</a></p></div></body>`;
        throw e;
    }
})();

const Content = document.getElementById('Content');
const Contentcontainer = document.getElementById('Content-Container');

let currentPage = 1;
const itemsPerPage = 8;
// If localStorage 'Products' is empty, load initial data from product.json
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
 const IMPORT_KEY = 'ImportReceipts';

function getImportReceipts() {
    return JSON.parse(localStorage.getItem(IMPORT_KEY)) || [];
}

function saveImportReceipts(list) {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(list));
}


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
const UpLoadImage = () => {
    const btnSave = document.getElementById('SaveChange');

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

    // Kiểm tra đầu vào khi nhấn lưu
    btnSave.addEventListener('click', () => {
        if (!Productname.value.trim()) return showAlertFailure("Vui lòng nhập tên sản phẩm!");
        if (!Price.value || isNaN(Price.value) || parseFloat(Price.value) <= 0) {
            return showAlertFailure("Vui lòng nhập giá tiền hợp lệ (là một số dương)!");
        }
        if (!Category.value.trim()) return showAlertFailure("Vui lòng chọn danh mục sản phẩm!");
        if (selectedSizes.length === 0) return showAlertFailure("Vui lòng chọn kích cỡ!");
        if (!mainImage) return showAlertFailure("Vui lòng tải lên ảnh chính!");
        if (imgDetail.length < 4 || imgDetail.includes(undefined)) {
            return showAlertFailure("Vui lòng tải lên đủ 4 ảnh nhỏ!");
        }

        // Tạo sản phẩm mới
        const newProduct = {
            Id: Math.ceil(Math.random() * 100000),
            ProductName: Productname.value.trim(),
            Colour: Color.value.trim(),
            Price: parseFloat(Price.value),
            Category: Category.value.trim(),
            image: mainImage,
            imgDetail: imgDetail,
            Size: selectedSizes
        };

        // Lưu sản phẩm mới
        ProductLocal.push(newProduct);
        localStorage.setItem('Products', JSON.stringify(ProductLocal));
        showAlertSuccess("Thêm Giày Thành Công!");

        // Reset form
        Productname.value = "";
        Color.value = "";
        Price.value = "";
        mainImage = "";
        mainImagePreview.src = "";
        mainImagePreview.style.display = 'none';
        mainSpan.style.display = 'block';
        imgDetail.length = 0;

        for (let i = 1; i <= 4; i++) {
            const imagePreview = document.getElementById(`imagePreview${i}`);
            const span = document.getElementById(`Span${i}`);
            imagePreview.src = "";
            imagePreview.style.display = 'none';
            span.style.display = 'block';
        }

        selectedSizes.length = 0;
        document.querySelectorAll('.size-btn').forEach(button => {
            button.classList.remove('btn-primary-selected');
            button.classList.add('btn-outline-primary');
        });

        $('#exampleModal').modal('hide');
        SearchAndRender('Products', currentPage, itemsPerPage);
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
        imagePreview.src = product.image;
        imagePreview.style.display = "block";
        Span.style.display = "none";
    } else {
        imagePreview.style.display = "none";
        Span.style.display = "block";
    }

    

   saveChange.onclick = () => {
   
    ProductLocal[index].ProductName= Productname.value;
    ProductLocal[index].Price=Price.value;
    ProductLocal[index].Category=Category.value;
    ProductLocal[index].Colour=Color.value;

    localStorage.setItem("Products", JSON.stringify(ProductLocal));
     SearchAndRender("Products", currentPage, itemsPerPage);
};

};


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
                                <div class="status-options" >
                                <div>
                                    <input type="checkbox" id="status-progress" name="order-status" value="0">
                                    <label for="status-progress" class="status-label">Progressing</label>
                                </div>
                                <div>
                                    <input type="checkbox" id="status-canceled" name="order-status" value="2    ">
                                    <label for="status-canceled" class="status-label">Canceled</label>
                                </div>
                                <div>
                                    <input type="checkbox" id="status-successful" name="order-status" value="1">
                                    <label for="status-successful" class="status-label">Received</label>
                                </div>
                                <div>
                                    <input type="checkbox" id="status-successful" name="order-status" value="3">
                                    <label for="status-successful" class="status-label">Delivering</label>
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
    statusOptions.forEach(option => {
        option.checked = option.value == order.status;

        // Đảm bảo chỉ một checkbox được chọn
        option.addEventListener('change', function () {
            if (this.checked) {
                statusOptions.forEach(opt => {
                    if (opt !== this) opt.checked = false;
                });
            }
        });
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
    const userLogin = JSON.parse(localStorage.getItem('userLogin'))||[];
    if (!order) {
        console.error(`Order with index ${idx} not found in storage.`);
        return;
    }

    const user = users.find(p => p.userId === order.userId);
    
    const indexx =users.find(p => p.userId === order.userId);
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

    const newStatus = parseInt(selectedStatus.value, 10);

    // Cập nhật trạng thái trong `CheckOut`
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
    users[indexx]=user;
    localStorage.setItem('userLogin',JSON.stringify(userLogin));
    // Lưu dữ liệu vào localStorage
    localStorage.setItem('CheckOut', JSON.stringify(orders));
    localStorage.setItem('Users', JSON.stringify(users));
    showAlertSuccess('Cap Nhat Thanh Cong')
    SearchAndRender('CheckOut', currentPage, itemsPerPage);

    // Đóng modal
    const modalElement = document.getElementById('UpdateModalOrder');
    const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
    bootstrapModal.hide();
};

const RenderUserName = ()=>{
    const userLogin = JSON.parse(localStorage.getItem('userLogin')) || {};
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
const TrangChu = () =>{
    window.location="../HomePage.html";
    
} 
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
        const newId = Date.now(); // mã phiếu
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

    receipts[idx].status = 'completed';
    saveImportReceipts(receipts);
    showAlertSuccess('Đã hoàn thành phiếu nhập');
    renderImportList();
}

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
    localStorage.removeItem('userLogin');
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
