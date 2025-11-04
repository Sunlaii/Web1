const Content = document.getElementById('Content');
const Contentcontainer = document.getElementById('Content-Container');

let currentPage = 1;
const itemsPerPage = 8;

// ================== INIT PRODUCTS ==================
const initProductsIfEmpty = () => {
    return new Promise((resolve) => {
        try {
            const products = JSON.parse(localStorage.getItem('Products')) || [];
            if (products.length > 0) return resolve();
            fetch('../product.json')
                .then(res => res.json())
                .then(data => {
                    const normalized = data.map(p => ({
                        ...p,
                        Id: p.Id,
                        Price: typeof p.Price === 'string' ? parseFloat(p.Price) : p.Price,
                        Description: p.Description || '',
                        isHidden: p.isHidden || false
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

window.onload = async () => {
    await initProductsIfEmpty();
    const defaultItem = document.querySelector('.Action .TongHop');
    removeActiveClass();
    if (defaultItem) {
        defaultItem.classList.add('active');
        RenderTongHop();
    }
};

document.querySelector('.Action').addEventListener('click', (e) => {
    const target = e.target.closest('li');
    if (!target) return;

    document.querySelectorAll('.Action li').forEach(item => {
        item.classList.remove('active');
    });
    target.classList.add('active');

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
                    <div class="card-single">
                        <div class="box">
                            <h2 class="display-user-count" id="soLuongKhach"></h2>
                            <div class="on-box">
                                <img src="../anh/image-TH/users.png" alt="" style="width: 120px;">
                                <h3>KHÁCH HÀNG</h3>
                            </div>
                        </div>
                    </div>
                    <div class="card-single">
                        <div class="box">
                            <div class="on-box">
                                <h2 class="display-product-count" id="soLuongSanPham"></h2>
                                <img src="../anh/image-TH/product.png" alt="" style="width: 120px;">
                                <h3>SẢN PHẨM</h3>
                            </div>
                        </div>
                    </div>
                    <div class="card-single">
                        <div class="box">
                            <h2 class="display-total-income" id="soLuongDon"></h2>
                            <div class="on-box">
                                <img src="../anh/image-TH/order.png" alt="" style="width: 120px;">
                                <h3>ĐƠN HÀNG</h3>
                            </div>
                        </div>
                    </div>
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
    document.getElementById('pagination-controls').style.display = "none";
    Contentcontainer.style.display = "none";
};

const SoluongKhachHang = () => {
    const user = JSON.parse(localStorage.getItem('Users')) || [];
    let temp = user.length;
    const el = document.getElementById('soLuongKhach');
    if (el) el.innerText = temp;
};

const DoanhThuTong = () => {
    const CheckOut = JSON.parse(localStorage.getItem('CheckOut')) || [];
    let temp = 0;
    CheckOut.forEach(p => {
        temp += p.totalprice || 0;
    });
    const el = document.getElementById('DoanhThuTong');
    if (el) el.innerText = `${temp} $`;
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
                <div class="col-md-6">
                  <label class="form-label">Description</label>
                  <textarea id="Description" class="form-control" style="width:350px;height:80px" placeholder="Mô tả sản phẩm"></textarea>
                </div>
                <div class="col-md-6 Color">
                  <label class="form-label">Color: </label>
                  <select class="form-select" id="Color">
                    <option value="Black">Black</option>
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
            <option value="Hoat Dong">Online</option>
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
    SearchAndRender('Users', currentPage, itemsPerPage);
};

const AddUser = () => {
    const dangKy = document.querySelector('#dangky');
    const close = document.querySelector('.icon-close');
    let users = JSON.parse(localStorage.getItem("Users")) || [];
    const fullname = document.querySelector('#register-username');
    const phone = document.querySelector('#register-phone');
    const password = document.querySelector('#register-password');
    const confirmPassword = document.querySelector('#cf-password');
    const registerForm = document.querySelector('#form-register');
    if (!dangKy || !close || !registerForm) return;

    dangKy.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.classList.add('active-popup');
        wrapper.classList.add('active');
        document.body.classList.add('no-scroll');
        document.getElementById('overlay').style.display = 'block';
    });
    close.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.classList.remove('active-popup');
        document.body.classList.remove('no-scroll');
        document.getElementById('overlay').style.display = 'none';
    });
    registerForm.addEventListener('submit', function (e) {
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
            userId: Math.ceil(Math.random() * 100000),
            date: formattedDate,
            username: fullname.value,
            phone: phone.value,
            password: password.value,
            email: "",
            address: "",
            status: "Hoat Dong",
            role: "admin",
            Cart: [],
            ProductBuy: []
        };
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Mật khẩu xác nhận không khớp!');
            isConfirmPasswordError = true;
        } else {
            showSuccess(confirmPassword);
        }
        if (users.some(user => user.username === fullname.value)) {
            showError(fullname, 'Tên đăng nhập đã tồn tại!');
        } else if (!isEmptyError && !isFullnameLengthError && !isPasswordLengthError && !isPhoneLengthError && !isConfirmPasswordError) {
            users.push(user);
            showAlertSuccess("Đăng ký thành công!");
            localStorage.setItem("Users", JSON.stringify(users));
            SearchAndRender('Users', currentPage, itemsPerPage);
            wrapper.classList.remove('active');
            wrapper.style.display = "none";
            overlay.style.display = "none";
            registerForm.reset();
        }
    });
};

const UpLoadImage = () => {
    const btnSave = document.getElementById('SaveChange');

    const Productname = document.getElementById('Product-name');
    const Price = document.getElementById('Price');
    const Category = document.getElementById('Category');
    const Color = document.getElementById('Color');
    const Description = document.getElementById('Description');
    const ProductLocal = JSON.parse(localStorage.getItem("Products")) || [];

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
                mainImage = e.target.result;
                mainImagePreview.src = e.target.result;
                mainImagePreview.style.display = 'block';
                mainSpan.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

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
                    imgDetail[i - 1] = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const selectedSizes = [];
    document.querySelectorAll('.size-btn').forEach(button => {
        button.addEventListener('click', function () {
            const size = this.getAttribute('data-size');
            if (selectedSizes.includes(size)) {
                selectedSizes.splice(selectedSizes.indexOf(size), 1);
                this.classList.remove('btn-primary-selected');
                this.classList.add('btn-outline-primary');
            } else {
                selectedSizes.push(size);
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-primary-selected');
            }
        });
    });

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

        const newProduct = {
            Id: Math.ceil(Math.random() * 100000),
            ProductName: Productname.value.trim(),
            Colour: Color.value.trim(),
            Price: parseFloat(Price.value),
            Category: Category.value.trim(),
            image: mainImage,
            imgDetail: imgDetail,
            Size: selectedSizes,
            Description: Description.value.trim() || '',
            isHidden: false
        };

        ProductLocal.push(newProduct);
        localStorage.setItem('Products', JSON.stringify(ProductLocal));
        showAlertSuccess("Thêm Giày Thành Công!");

        Productname.value = "";
        Color.value = "";
        Price.value = "";
        Description.value = "";
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

const Reset = () => {
    document.getElementById('ShoesProduct').value = "All";
    document.getElementById('inputProduct').value = "";
    SearchAndRender('Products', currentPage, itemsPerPage);
};
const ResetUser = () => {
    document.getElementById('UsersSelect').value = "All";
    document.getElementById('inputUsers').value = "";
    document.getElementById('UserA1').value = "";
    document.getElementById('UserA2').value = "";
    SearchAndRender('Users', currentPage, itemsPerPage);
};
const ResetDon = () => {
    document.getElementById('Shoes').value = "All";
    document.getElementById('city-select').value = "";
    document.getElementById('ward-select').value = "";
    document.getElementById('district-select').value = "";
    document.getElementById('DonHangA1').value = "";
    document.getElementById('DonHangA2').value = "";
    SearchAndRender('CheckOut', currentPage, itemsPerPage);
};

const renderPage = (dataType, page, itemsPerPage, filterRender) => {
    const container = document.getElementById('Content-Container');
    const userTable = document.getElementById('UserTable');
    const CheckOutTable = document.getElementById('CheckOutTable');
    const totalPages = Math.ceil(filterRender.length / itemsPerPage);

    page = Math.max(1, Math.min(page, totalPages || 1));

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = filterRender.slice(start, end);

    if (dataType === 'Products') {
        container.innerHTML = "";
        currentItems.forEach((item) => {
            const row = createRowForType(dataType, item);
            if (row) container.insertAdjacentHTML('beforeend', row);
        });
    } else if (dataType === 'Users') {
        userTable.innerHTML = "";
        currentItems.forEach((item) => {
            const row = createRowForType(dataType, item);
            userTable.insertAdjacentHTML('beforeend', row);
        });
    }
    else if (dataType === 'CheckOut') {
        CheckOutTable.innerHTML = "";
        currentItems.forEach((item) => {
            const row = createRowForType(dataType, item);
            CheckOutTable.insertAdjacentHTML('beforeend', row);
        });
    }

    renderPaginationControls(dataType, page, totalPages || 1, filterRender, itemsPerPage);
};

const createRowForType = (dataType, item) => {
    switch (dataType) {
        case 'Products':
            return `
                 <div class="Shopping-item" style="position:relative;left:30px;background:#fff;margin-top:10px;border:1px #fff;opacity:${item.isHidden ? 0.5 : 1}">
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
                    <div class="Description">
                        <span>${item.Description || ''}</span>
                    </div>
                    <div class="Actions">
                        <i class="fa-thin fa-pen-to-square" style="font-weight:400;" onclick="ModalProduct(${item.Id},'Update')"></i>
                        <i class="fa-solid fa-trash-can" style="font-weight:400;" onclick="ModalProduct(${item.Id},'Delete')"></i>
                        <button style="margin-left:8px;border:none;border-radius:4px;padding:4px 8px;background:${item.isHidden ? '#6c757d' : '#198754'};color:white;"
                            onclick="toggleProductVisibility(${item.Id})">
                            ${item.isHidden ? 'Hiện' : 'Ẩn'}
                        </button>
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
            ${item.status == "Hoat Dong"
                    ? `<button style="width: 100px; background-color: green; color: white; border: none; padding: 8px; border-radius: 4px;">Online</button>`
                    : `<button style="width: 100px; background-color: red; color: white; border: none; padding: 8px; border-radius: 4px;">Offline</button>`
                }
        </td>
        <td style="padding: 10px; display: flex; gap: 10px;">
            <button onClick="ModalUser(${item.userId},'Edit')" style="width: 80px; border: none; background-color: #2196F3; color: white; padding: 8px; border-radius: 4px;">Edit</button>
            <button onClick="ModalUser(${item.userId},'Delete')" style="width: 80px; border: none; background-color: #ffc107; color: black; padding: 8px; border-radius: 4px;">Delete</button>
            <button onClick="resetUserPassword(${item.userId})" style="width: 110px; border: none; background-color: #6f42c1; color: #fff; padding: 8px; border-radius: 4px;">Reset PW</button>
            <button onClick="toggleUserStatus(${item.userId})"
                style="width: 90px; border: none; background-color: ${item.status == 'Hoat Dong' ? '#dc3545' : '#198754'}; color: #fff; padding: 8px; border-radius: 4px;">
                ${item.status == 'Hoat Dong' ? 'Khóa' : 'Mở'}
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
            return '';
    }
};

function toggleProductVisibility(id) {
    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const index = products.findIndex(p => p.Id === id);
    if (index === -1) return;
    products[index].isHidden = !products[index].isHidden;
    localStorage.setItem('Products', JSON.stringify(products));
    SearchAndRender('Products', currentPage, itemsPerPage);
}

const renderPaginationControls = (dataType, currentPage, totalPages, filterRender, itemsPerPage) => {
    const container = document.getElementById('pagination-controls');
    if (!container) return;
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    const maxVisiblePages = 2;
    const pageNumbers = [];

    const addPageNumber = (page) => {
        if (page > 0 && page <= totalPages && !pageNumbers.includes(page)) {
            pageNumbers.push(page);
        }
    };

    addPageNumber(1);

    if (totalPages <= maxVisiblePages + 2) {
        for (let i = 2; i <= totalPages; i++) {
            addPageNumber(i);
        }
    } else {
        if (currentPage > 2) {
            pageNumbers.push('...');
        }

        if (currentPage - 1 > 1) addPageNumber(currentPage - 1);
        addPageNumber(currentPage);
        if (currentPage + 1 < totalPages) addPageNumber(currentPage + 1);

        if (currentPage < totalPages - 1) {
            pageNumbers.push('...');
        }
    }

    if (currentPage !== totalPages) {
        addPageNumber(totalPages);
    }

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

    const buttons = container.querySelectorAll('.page-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const button = event.target;
            if (button.hasAttribute('data-action')) {
                const action = button.getAttribute('data-action');
                if (action === 'prev' && currentPage > 1) {
                    changePage(dataType, currentPage - 1, filterRender, itemsPerPage);
                } else if (action === 'next' && currentPage < totalPages) {
                    changePage(dataType, currentPage + 1, filterRender, itemsPerPage);
                }
            } else if (button.hasAttribute('data-page')) {
                const page = parseInt(button.getAttribute('data-page'), 10);
                changePage(dataType, page, filterRender, itemsPerPage);
            }
        });
    });
};
const changePage = (dataType, page, filterRender, itemsPerPage) => {
    const totalPages = Math.ceil(filterRender.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    renderPage(dataType, page, itemsPerPage, filterRender);
};
const convertToDateStart = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day + 1);
};
const convertToDateEnd = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
};

const SearchAndRender = (dataType, page, itemsPerPage = 8) => {
    const data = JSON.parse(localStorage.getItem(dataType)) || [];
    let filterRender = [...data];
    let category = "All";
    let namee = "";
    let startDate = "";
    let endDate = "";
    let selectedCity = "";
    let selectedDistrict = "";
    let selectedWard = "";

    if (dataType === 'Products') {
        document.getElementById('ShoesProduct').onchange = (event) => {
            category = event.target.value;
            applyFilters();
        };

        document.getElementById('inputProduct').oninput = (event) => {
            namee = event.target.value;
            applyFilters();
        };
    } else if (dataType === 'Users') {
        document.getElementById('UsersSelect').onchange = (event) => {
            category = event.target.value;
            applyFilters();
        };

        document.getElementById('inputUsers').oninput = (event) => {
            namee = event.target.value;
            applyFilters();
        };

        document.querySelector('.KhachHangAction input[type="date"]:nth-of-type(1)')
            .onchange = (event) => {
                startDate = event.target.value ? new Date(event.target.value) : null;
                applyFilters();
            };

        document.querySelector('.KhachHangAction input[type="date"]:nth-of-type(2)')
            .onchange = (event) => {
                endDate = event.target.value ? new Date(event.target.value) : null;
                applyFilters();
            };
    }
    else if (dataType === 'CheckOut') {
        document.getElementById('Shoes').onchange = (event) => {
            category = event.target.value;
            applyFilters();
        };

        document.querySelector('.DonHangAction input[type="date"]:nth-of-type(1)').onchange = (event) => {
            startDate = event.target.value ? new Date(event.target.value) : null;
            applyFilters();
        };

        document.querySelector('.DonHangAction input[type="date"]:nth-of-type(2)').onchange = (event) => {
            endDate = event.target.value ? new Date(event.target.value) : null;
            applyFilters();
        };

        document.getElementById('city-select').onchange = (event) => {
            selectedCity = event.target.value;
            selectedDistrict = "";
            selectedWard = "";
            applyFilters();
        };

        document.getElementById('district-select').onchange = (event) => {
            selectedDistrict = event.target.value;
            selectedWard = "";
            applyFilters();
        };

        document.getElementById('ward-select').onchange = (event) => {
            selectedWard = event.target.value;
            applyFilters();
        };
    }

    const applyFilters = () => {
        filterRender = [...data];

        if (category !== "All") {
            if (dataType === 'Products') {
                filterRender = filterRender.filter(item => item.Category.toLowerCase() === category.toLowerCase());
            } else if (dataType === 'Users') {
                filterRender = filterRender.filter(item => item.status.toLowerCase() === category.toLowerCase());
            }
            else if (dataType === 'CheckOut') {
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
                    const itemDate = convertToDateStart(item.date);
                    return itemDate >= startDate;
                });
            }
            if (endDate) {
                filterRender = filterRender.filter(item => {
                    const itemDate = convertToDateEnd(item.date);
                    return itemDate <= endDate;
                });
            }
        }
        if (dataType === 'CheckOut') {
            if (selectedCity) {
                filterRender = filterRender.filter(order => order.city === selectedCity);
            }
            if (selectedDistrict) {
                filterRender = filterRender.filter(order => order.district === selectedDistrict);
            }
            if (selectedWard) {
                filterRender = filterRender.filter(order => order.ward === selectedWard);
            }
            if (startDate) {
                filterRender = filterRender.filter(item => {
                    const itemDate = convertToDateStart(item.date);
                    return itemDate >= startDate;
                });
            }
            if (endDate) {
                filterRender = filterRender.filter(item => {
                    const itemDate = convertToDateEnd(item.date);
                    return itemDate <= endDate;
                });
            }
        }

        const errorMessageElement = document.getElementById('ErrorMessage');
        const container = document.getElementById('Content-Container');
        const paginate = document.getElementById('pagination-controls');

        if (filterRender.length === 0) {
            if (errorMessageElement) errorMessageElement.style.display = "block";
            container.style.display = "none";
            paginate.style.display = "none";
        } else {
            if (errorMessageElement) errorMessageElement.style.display = "none";
            container.style.display = "block";
            paginate.style.display = "block";
        }

        renderPage(dataType, page, itemsPerPage, filterRender);
    };

    applyFilters();
};

// =============== MODAL PRODUCT UPDATE/DELETE ===============
const ModalProduct = (id, dataType) => {
    if (dataType === 'Update') {
        const modalUpdateHTML = ` <div class="modal fade" id="UpdateModal" tabindex="-1" role="dialog" aria-labelledby="UpdateModalLabel" aria-hidden="true">
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
                    <select class="form-select" id="category"></select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Price</label>
                    <input type="text" id="price" class="form-control" style="width:350px" placeholder="Nhập Giá Tiền"/>
                  </div>
                  <div class="col-md-6 Color">
                  <label class="form-label">Color: </label>
                  <select class="form-select" id="color">
                    <option value="Black">Black</option>
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
              <button type="button" class="btn btn-primary" id="saveChange">Update Shoes</button>
            </div>
          </div>
        </div>
      </div>`;
        document.body.insertAdjacentHTML('beforeend', modalUpdateHTML);
        const modalUpdateElement = document.getElementById('UpdateModal');
        const bootstrapModalUpdate = new bootstrap.Modal(modalUpdateElement);
        const selectUpdateCategory = modalUpdateElement.querySelector('#category');
        if (selectUpdateCategory) {
            selectUpdateCategory.innerHTML = categories
                .map(name => `<option value="${name}">${name}</option>`)
                .join('');
        }
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
                        <button type="button" id="close-btn1" class="btn btn-secondary">Cancel</button>
                        <button type="button" id="confirmDeleteButton" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalDeleteHTML);
        const modalDeleteElement = document.getElementById('customDeleteModal');
        const bootstrapModalDelete = new bootstrap.Modal(modalDeleteElement);
        bootstrapModalDelete.show();
        document.getElementById('close-btn1').addEventListener('click', () => {
            bootstrapModalDelete.hide();
        });
        document.getElementById('close-btn2').addEventListener('click', () => {
            bootstrapModalDelete.hide();
        });
        const confirmDeleteButton = document.getElementById('confirmDeleteButton');
        confirmDeleteButton.addEventListener('click', () => btnDeleteProduct(id));
        modalDeleteElement.addEventListener('hidden.bs.modal', () => {
            modalDeleteElement.remove();
        });
    }
};
const btnUpdateProduct = (id) => {
    const ProductLocal = JSON.parse(localStorage.getItem("Products")) || [];
    const product = ProductLocal.find((p) => p.Id === id);
    const index = ProductLocal.findIndex(p => p.Id == id);
    if (!product) {
        showAlertFailure("Product not found!");
        return;
    }
    const Productname = document.getElementById('Productname');
    const Price = document.getElementById('price');
    const Category = document.getElementById('category');
    const Color = document.getElementById('color');
    const imagePreview = document.getElementById('ImagePreview');
    const saveChange = document.getElementById('saveChange');

    Productname.value = product.ProductName;
    Price.value = product.Price;
    Category.value = product.Category;
    Color.value = product.Colour;
    if (product.image) {
        imagePreview.src = product.image;
        imagePreview.style.display = "block";
    } else {
        imagePreview.style.display = "none";
    }

    saveChange.onclick = () => {
        ProductLocal[index].ProductName = Productname.value.trim();
        ProductLocal[index].Price = parseFloat(Price.value) || 0;
        ProductLocal[index].Category = Category.value;
        ProductLocal[index].Colour = Color.value;

        localStorage.setItem("Products", JSON.stringify(ProductLocal));
        SearchAndRender("Products", currentPage, itemsPerPage);
        const modalUpdateElement = document.getElementById('UpdateModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modalUpdateElement);
        bootstrapModal.hide();
    };
};

const btnDeleteProduct = (id) => {
    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const index = products.findIndex(p => p.Id === id);
    if (index !== -1) {
        products.splice(index, 1);
        localStorage.setItem('Products', JSON.stringify(products));
    }
    const itemsPerPage = 4;
    const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
    const adjustedPage = Math.max(1, Math.min(currentPage, totalPages));
    SearchAndRender('Products', adjustedPage, itemsPerPage);
};

// =============== USER MODAL ===============
// (giữ nguyên ModalUser, btnEditUser, btnDeleteUser như code ban đầu của bạn)
// ...  (do giới hạn, phần này giữ giống đúng đoạn bạn đã gửi – không thay đổi)

// =================== ĐƠN HÀNG (RenderDonHang, showOrderDetail, saveOrderDetail, ...)
// ...  (giữ như code bạn đã gửi, không cắt bỏ – chỉ thêm phần mới bên dưới)

// =================== THỐNG KÊ, DOANH THU, CATEGORY GRAPH, ...  
// ...  (giữ đúng như bạn đã gửi, không đổi logic)

// =================== IMPORT RECEIPT (MỤC 5) ===================
const IMPORT_KEY = 'ImportReceipts';

function getImports() {
    return JSON.parse(localStorage.getItem(IMPORT_KEY)) || [];
}
function saveImports(list) {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(list));
} 

const RenderDonHang = () => {
    Content.innerHTML = `
    <div class="trangDonhang" style="position: relative; left: 70px; height:50px;">
        <div style="display:flex;margin-top: 20px;justify-content: space-between;align-items:center;width:85%;margin-left:40px">
            <!-- Lọc theo trạng thái đơn -->
            <select id="Shoes" class="Shoes">
                <option value="All">All</option>
                <option value="0">Processing</option>
                <option value="3">Delivering</option>
                <option value="1">Received</option>
                <option value="2">Cancel</option>
            </select>

            <!-- Lọc theo ngày + địa chỉ -->
            <div class="DonHangAction" style="display:flex;align-items:center;gap:8px;">
                <span>Từ</span>
                <input id="DonHangA1" type="date"
                       style="padding:5px 5px 5px 10px;border-radius:10px;font-size:17px;">
                <span>Đến</span>
                <input id="DonHangA2" type="date"
                       style="padding:5px 5px 5px 10px;border-radius:10px;font-size:17px;">

                <select id="city-select"
                        style="padding:5px 5px 5px 10px;border-radius:10px;font-size:15px;min-width:130px;">
                    <option value="">Tỉnh/TP</option>
                </select>
                <select id="district-select"
                        style="padding:5px 5px 5px 10px;border-radius:10px;font-size:15px;min-width:130px;">
                    <option value="">Quận/Huyện</option>
                </select>
                <select id="ward-select"
                        style="padding:5px 5px 5px 10px;border-radius:10px;font-size:15px;min-width:130px;">
                    <option value="">Phường/Xã</option>
                </select>

                <button type="button" style="width:50px;" onclick="ResetDon()">
                    <i class="fa-sharp fa-solid fa-arrow-rotate-right"></i>
                </button>
            </div>
        </div>
    </div>
    `;

    Contentcontainer.innerHTML = `
    <table class="Table" style="width:100%;left:50px;position:relative;
                                border-collapse: collapse;font-family: Arial, sans-serif;transition: all 0.5s;">
        <thead>
            <tr style="background-color: #800020;color: white; text-align: left;">
                <th style="padding: 12px;">Mã đơn</th>
                <th style="padding: 12px;">Khách hàng</th>
                <th style="padding: 12px;">Tổng tiền</th>
                <th style="padding: 12px;">Ngày đặt</th>
                <th style="padding: 12px;">Trạng thái</th>
                <th style="padding: 12px;">Action</th>
            </tr>
        </thead>
        <tbody id="CheckOutTable"></tbody>
    </table>
    `;

    Contentcontainer.style.display = "block";
    document.getElementById('pagination-controls').style.display = "block";

    // dùng lại hàm filter + phân trang có sẵn
    SearchAndRender('CheckOut', currentPage, itemsPerPage);
};




function RenderNhapHang() {
    Content.innerHTML = `
        <div style="position:relative;left:50px;margin-top:20px;width:85%;">
            <h2>Quản lý phiếu nhập</h2>
            <div style="margin-bottom:10px;display:flex;gap:10px;align-items:center;">
                <span>Từ</span>
                <input type="date" id="ImportFrom">
                <span>Đến</span>
                <input type="date" id="ImportTo">
                <button onclick="renderImportTable()" class="btn btn-primary btn-sm">Lọc</button>
                <button onclick="showImportModal()" class="btn btn-success btn-sm"><i class="fa fa-plus"></i> Thêm phiếu nhập</button>
            </div>
            <table class="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Mã phiếu</th>
                        <th>Ngày nhập</th>
                        <th>Số dòng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody id="ImportTableBody"></tbody>
            </table>
        </div>
    `;
    Contentcontainer.style.display = "none";
    document.getElementById('pagination-controls').style.display = "none";
    renderImportTable();
}

function renderImportTable() {
    const tbody = document.getElementById('ImportTableBody');
    if (!tbody) return;
    const list = getImports();

    const from = document.getElementById('ImportFrom')?.value;
    const to = document.getElementById('ImportTo')?.value;
    let filtered = [...list];

    if (from) {
        const dFrom = new Date(from);
        filtered = filtered.filter(p => {
            const [day, m, y] = p.date.split('/').map(Number);
            const d = new Date(y, m - 1, day);
            return d >= dFrom;
        });
    }
    if (to) {
        const dTo = new Date(to);
        filtered = filtered.filter(p => {
            const [day, m, y] = p.date.split('/').map(Number);
            const d = new Date(y, m - 1, day);
            return d <= dTo;
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Không có phiếu nhập</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.date}</td>
            <td>${p.items.length}</td>
            <td>${p.isCompleted ? 'Hoàn thành' : 'Đang mở'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="showImportModal(${p.id})">Sửa</button>
                ${p.isCompleted ? '' : `<button class="btn btn-sm btn-success" onclick="completeImport(${p.id})">Hoàn thành</button>`}
            </td>
        </tr>
    `).join('');
}

function showImportModal(importId) {
    const imports = getImports();
    const exist = imports.find(p => p.id === importId);

    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const options = products.map(p => `<option value="${p.Id}">${p.Id} - ${p.ProductName}</option>`).join('');

    const modalHTML = `
    <div class="modal fade" id="ImportModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${exist ? 'Sửa phiếu nhập' : 'Thêm phiếu nhập'}</h5>
            <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
                <label>Ngày nhập</label>
                <input type="date" id="ImportDate" class="form-control">
            </div>
            <div class="form-group">
                <label>Sản phẩm</label>
                <select id="ImportProductId" class="form-control">
                    ${options}
                </select>
            </div>
            <div class="form-group">
                <label>Giá nhập</label>
                <input type="number" id="ImportPrice" class="form-control">
            </div>
            <div class="form-group">
                <label>Số lượng</label>
                <input type="number" id="ImportQty" class="form-control">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-dismiss="modal">Đóng</button>
            <button class="btn btn-primary" onclick="saveImport(${importId || 'null'})">Lưu</button>
          </div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalEl = document.getElementById('ImportModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    if (exist) {
        const [day, m, y] = exist.date.split('/').map(Number);
        document.getElementById('ImportDate').value = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const itm = exist.items[0];
        document.getElementById('ImportProductId').value = itm.productId;
        document.getElementById('ImportPrice').value = itm.importPrice;
        document.getElementById('ImportQty').value = itm.quantity;
    }

    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}

function saveImport(importId) {
    const imports = getImports();
    let target = imports.find(p => p.id === importId);
    const isNew = !target;

    if (!isNew && target.isCompleted) {
        showAlertFailure('Phiếu đã hoàn thành, không được sửa');
        return;
    }

    const dateVal = document.getElementById('ImportDate').value;
    const productId = Number(document.getElementById('ImportProductId').value);
    const price = Number(document.getElementById('ImportPrice').value);
    const qty = Number(document.getElementById('ImportQty').value);

    if (!dateVal || !productId || price <= 0 || qty <= 0) {
        showAlertFailure('Dữ liệu không hợp lệ');
        return;
    }

    const d = new Date(dateVal);
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    const record = {
        id: isNew ? Math.ceil(Math.random() * 100000) : target.id,
        date: dateStr,
        isCompleted: isNew ? false : target.isCompleted,
        items: [{
            productId,
            importPrice: price,
            quantity: qty
        }]
    };

    if (isNew) {
        imports.push(record);
    } else {
        const idx = imports.findIndex(p => p.id === importId);
        imports[idx] = record;
    }

    saveImports(imports);
    showAlertSuccess('Lưu phiếu nhập thành công');
    const modalEl = document.getElementById('ImportModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    renderImportTable();
}

function completeImport(importId) {
    const imports = getImports();
    const idx = imports.findIndex(p => p.id === importId);
    if (idx === -1) return;
    if (imports[idx].isCompleted) return;

    imports[idx].isCompleted = true;
    saveImports(imports);
    showAlertSuccess('Đã hoàn thành phiếu nhập');
    renderImportTable();
}

// =================== GIÁ BÁN (MỤC 6) ===================
const PROFIT_KEY = 'ProfitConfig';
function getProfitConfig() {
    const cfg = JSON.parse(localStorage.getItem(PROFIT_KEY)) || {
        defaultPercent: 30,
        byProduct: {},
        byCategory: {}   // <–– thêm
    };
    // đảm bảo luôn có key byCategory
    if (!cfg.byCategory) cfg.byCategory = {};
    return cfg;
}

function saveProfitConfig(cfg) {
    localStorage.setItem(PROFIT_KEY, JSON.stringify(cfg));
}

function calcAverageCost(productId) {
    const imports = getImports().filter(p => p.isCompleted);
    let totalQty = 0;
    let totalCost = 0;
    imports.forEach(rec => {
        rec.items.forEach(it => {
            if (it.productId === productId) {
                totalQty += it.quantity;
                totalCost += it.quantity * it.importPrice;
            }
        });
    });
    if (totalQty === 0) return 0;
    return totalCost / totalQty;
}



function RenderGiaBan() {
    Content.innerHTML = `
        <div style="position:relative;left:50px;margin-top:20px;width:85%;">
            <h2>Quản lý giá bán</h2>
            <p>Giá vốn lấy từ phiếu nhập đã Hoàn thành. Giá bán = Giá vốn * (1 + % lợi nhuận).</p>
             <!-- CẤU HÌNH % LỢI NHUẬN THEO LOẠI -->
        <div class="form-inline" style="margin-bottom:10px;gap:8px;align-items:center;">
            <span>Loại sản phẩm:</span>
            <select id="ProfitCategory" class="form-control" style="width:180px;"></select>
            <span>% lợi nhuận:</span>
            <input type="number" id="ProfitCategoryPercent" class="form-control" style="width:100px;" value="30">
            <button class="btn btn-sm btn-success" onclick="updateProfitForCategory()">Lưu theo loại</button>
        </div>
            <table class="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá vốn</th>
                        <th>% lợi nhuận</th>
                        <th>Giá bán</th>
                        <th>Lưu</th>
                    </tr>
                </thead>
                <tbody id="GiaBanTableBody"></tbody>
            </table>
        </div>
    `;
    Contentcontainer.style.display = "none";
    document.getElementById('pagination-controls').style.display = "none";
    renderGiaBanTable();

    ensureDefaultCategories();
    renderProfitCategoryOptions();
    
    function renderProfitCategoryOptions() {
    const sel = document.getElementById('ProfitCategory');
    if (!sel) return;
    ensureDefaultCategories();  // dùng chung mảng categories
    sel.innerHTML = categories
        .map(c => `<option value="${c}">${c}</option>`)
        .join('');
}

// Lưu % theo loại
function updateProfitForCategory() {
    const sel = document.getElementById('ProfitCategory');
    const inp = document.getElementById('ProfitCategoryPercent');
    if (!sel || !inp) return;

    const cat = sel.value;
    const val = Number(inp.value);
    if (!cat) {
        showAlertFailure('Chưa chọn loại sản phẩm');
        return;
    }
    if (isNaN(val) || val < 0) {
        showAlertFailure('Tỉ lệ lợi nhuận không hợp lệ');
        return;
    }

    const cfg = getProfitConfig();
    cfg.byCategory[cat] = val;
    saveProfitConfig(cfg);
    showAlertSuccess('Đã lưu % lợi nhuận cho loại ' + cat);

    // cập nhật lại bảng giá bán
    renderGiaBanTable();
}
}

function renderGiaBanTable() {
    const tbody = document.getElementById('GiaBanTableBody');
    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const cfg = getProfitConfig();

    tbody.innerHTML = products.map(p => {
        const cost = calcAverageCost(p.Id);
        let percent = null;
    if (cfg.byProduct[p.Id] != null) {
        percent = cfg.byProduct[p.Id];
    } else if (cfg.byCategory && cfg.byCategory[p.Category] != null) {
        percent = cfg.byCategory[p.Category];
    } else {
        percent = cfg.defaultPercent;
    }
        const price = cost > 0 ? Math.round(cost * (1 + percent / 100)) : p.Price;
        return `
            <tr>
                <td>${p.Id}</td>
                <td>${p.ProductName}</td>
                <td>${cost.toFixed(2)} $</td>
                <td><input type="number" id="profit-${p.Id}" value="${percent}" style="width:80px"> %</td>
                <td>${price} $</td>
                <td><button class="btn btn-sm btn-primary" onclick="updateProfitPercent(${p.Id})">Lưu</button></td>
            </tr>
        `;
    }).join('');
}

function updateProfitPercent(productId) {
    const cfg = getProfitConfig();
    const input = document.getElementById(`profit-${productId}`);
    const val = Number(input.value);
    if (isNaN(val) || val < 0) {
        showAlertFailure('Tỉ lệ lợi nhuận không hợp lệ');
        return;
    }
    cfg.byProduct[productId] = val;
    saveProfitConfig(cfg);

    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const idx = products.findIndex(p => p.Id === productId);
    if (idx !== -1) {
        const cost = calcAverageCost(productId);
        if (cost > 0) {
            products[idx].Price = Math.round(cost * (1 + val / 100));
            localStorage.setItem('Products', JSON.stringify(products));
        }
    }
    showAlertSuccess('Cập nhật giá bán thành công');
    renderGiaBanTable();
}

// =================== TỒN KHO (MỤC 8) ===================
function RenderTonKho() {
            Content.innerHTML = `
    <div style="position:relative;left:50px;margin-top:20px;width:85%;">
        <h2>Quản lý tồn kho</h2>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;align-items:center;">
            <span>Từ ngày:</span>
            <input type="date" id="StockFromDate">
            <span>Đến ngày:</span>
            <input type="date" id="StockToDate">

            <span>Loại:</span>
            <select id="StockCategoryFilter" class="form-control" style="width:150px;"></select>

            <span>Tìm sản phẩm:</span>
            <input type="text" id="StockSearchName" class="form-control" style="width:180px;" placeholder="Tên hoặc ID">

            <span>Cảnh báo &lt;=</span>
            <input type="number" id="StockWarning" value="5" style="width:80px">

            <button class="btn btn-primary btn-sm" onclick="renderTonKhoTable()">Xem</button>
        </div>
        <table class="table table-bordered table-sm">
            <thead>
                <tr>
                    <th>ID sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Tổng nhập</th>
                    <th>Tổng xuất</th>
                    <th>Tồn</th>
                    <th>Cảnh báo</th>
                </tr>
            </thead>
            <tbody id="TonKhoTableBody"></tbody>
        </table>
    </div>
`;
Contentcontainer.style.display = "none";
document.getElementById('pagination-controls').style.display = "none";

// fill combobox loại
ensureDefaultCategories();
const selCat = document.getElementById('StockCategoryFilter');
if (selCat) {
    selCat.innerHTML =
        '<option value="All">Tất cả</option>' +
        categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

renderTonKhoTable();

}

function renderTonKhoTable() {
    const tbody = document.getElementById('TonKhoTableBody');
    const products = JSON.parse(localStorage.getItem('Products')) || [];
    const imports = getImports().filter(p => p.isCompleted);
    const ordersSucess = JSON.parse(localStorage.getItem('Sucess')) || [];

    const fromVal = document.getElementById('StockFromDate')?.value;
    const toVal = document.getElementById('StockToDate')?.value;
    let startDate = null;
    let endDate = null;

    if (fromVal) {
        const d = new Date(fromVal);
        startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    }
    if (toVal) {
        const d = new Date(toVal);
        endDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
    }

    const warningVal = Number(document.getElementById('StockWarning')?.value) || 0;
    const catFilter = document.getElementById('StockCategoryFilter')?.value || 'All';
    const keyword = (document.getElementById('StockSearchName')?.value || '').trim().toLowerCase();

    const map = {};
    products.forEach(p => {
        map[p.Id] = {
            id: p.Id,
            name: p.ProductName,
            category: p.Category,
            inQty: 0,
            outQty: 0
        };
    });

    // nhập
    imports.forEach(rec => {
        const [day, m, y] = rec.date.split('/').map(Number);
        const d = new Date(y, m - 1, day);
        if (startDate && d < startDate) return;
        if (endDate && d > endDate) return;

        rec.items.forEach(it => {
            if (!map[it.productId]) return;
            map[it.productId].inQty += it.quantity;
        });
    });

    // xuất (đơn hàng thành công)
    ordersSucess.forEach(order => {
        const [day, m, y] = order.date.split('/').map(Number);
        const d = new Date(y, m - 1, day);
        if (startDate && d < startDate) return;
        if (endDate && d > endDate) return;

        order.cartProduct.forEach(pr => {
            if (!map[pr.product_id]) return;
            map[pr.product_id].outQty += pr.quantity;
        });
    });

    let rows = Object.values(map);

    // lọc theo loại
    if (catFilter !== 'All') {
        rows = rows.filter(r => r.category === catFilter);
    }

    // lọc theo tên / ID
    if (keyword) {
        rows = rows.filter(r =>
            r.name.toLowerCase().includes(keyword) ||
            String(r.id).includes(keyword)
        );
    }

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Không có dữ liệu tồn kho</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(r => {
        const ton = r.inQty - r.outQty;
        const warn = ton <= warningVal ? 'Sắp hết hàng' : '';
        return `
            <tr>
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${r.inQty}</td>
                <td>${r.outQty}</td>
                <td>${ton}</td>
                <td style="color:red;font-weight:bold;">${warn}</td>
            </tr>
        `;
    }).join('');
}
function TrangChu() {
    // Đường dẫn từ Admin.html ra trang khách
    window.location.href = "../HomePage.html"; 
}


