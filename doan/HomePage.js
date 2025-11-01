let productContainer = document.querySelector('#product-container');
let listproducts = [];
const Bgroups = document.querySelectorAll(".product-content-right-bottom");
const contentgroups = document.querySelectorAll(".product-content-right");
const groups = document.querySelectorAll(".product-content"); // Chọn tất cả các nhóm sản phẩm
let currentPage = 1;
const productsPerPage = 8;
let totalPages = 0;
let originalProducts = JSON.parse(localStorage.getItem("Products")) || [];
let filteredProducts = [...originalProducts];


//-------------------------------------- HÀM RENDER TẤT CẢ SẢN PHẨM ---------------------------------------------------
const adddatatohtml = () => {
    productContainer.innerHTML = ''; // Xóa nội dung hiện tại trong productContainer

    // Lấy danh sách sản phẩm hiện tại (lọc hoặc toàn bộ)
    const ProductLocal = filteredProducts.length > 0 
        ? filteredProducts 
        : JSON.parse(localStorage.getItem('Products')) || [];

    // Tính toán sản phẩm trên trang hiện tại
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = ProductLocal.slice(startIndex, endIndex);

    // Kiểm tra nếu không có sản phẩm (dù là sau khi lọc hay tìm kiếm)
    if (currentProducts.length === 0) {
        // Hiển thị hình ảnh "empty.png" khi không có sản phẩm
        productContainer.innerHTML = `<img src="../image/empty.png" alt="No products available" class="empty-image">`;
        
        // Đảm bảo phân trang không hiển thị trang trống
        createPagination(0); // Không có sản phẩm, không cần phân trang
        return;
    }

    // Render các sản phẩm
    currentProducts.forEach(product => {
        let newProduct = document.createElement('div');
        newProduct.classList.add('card');
        newProduct.dataset.id = product.Id;

        newProduct.innerHTML = `
            <div class="card-image" onClick="showSection(${product.Id})">
                <img src="${product.image}" alt="${product.ProductName}">
            </div>
            <div class="card-content" onClick="showSection(${product.Id})">
                <p>${product.ProductName}</p>
                <p class="Colors">${product.Colour}</p>
                <p class="Price">${product.Price}$</p>
                <div class="card-icon"></div>
            </div>
        `;
        productContainer.appendChild(newProduct);
    });

    // Cập nhật phân trang với số lượng sản phẩm
    createPagination(ProductLocal.length);
};




// Jump to a specific page (validates and clamps to available pages)
const goToPage = (pageNumber) => {
    if (!pageNumber || isNaN(pageNumber)) {
        if (typeof showAlertFailure === 'function') showAlertFailure('Số trang không hợp lệ');
        return;
    }
    pageNumber = Math.floor(pageNumber);
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    currentPage = pageNumber;
    adddatatohtml();
    // Scroll to main product area
    const mid = document.getElementById('Mid');
    if (mid) mid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
};

// nut our services
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('our-services-toggle');
    const services = document.getElementById('home-service');
    if (!toggle || !services) return;
    toggle.addEventListener('click', () => {
        const isShown = services.classList.toggle('show');
        services.setAttribute('aria-hidden', isShown ? 'false' : 'true');
        toggle.setAttribute('aria-expanded', isShown ? 'true' : 'false');
        // rotate caret via open class
        toggle.classList.toggle('open', isShown);
        // focus the first service item when opened
        if (isShown) {
            const first = services.querySelector('.home-service-item');
            if (first) first.focus();
        }
    });
    // Close when clicking outside the wrapper
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.our-services-wrapper');
        if (!wrapper) return;
        // if click is inside wrapper, ignore
        if (wrapper.contains(e.target)) return;
        if (services.classList.contains('show')) {
            services.classList.remove('show');
            services.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('open');
        }
    });
    // 
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && services.classList.contains('show')) {
            services.classList.remove('show');
            services.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('open');
        }
    });
    // phan loai hang bang menu
    services.querySelectorAll('.home-service-item').forEach(item => {
        item.addEventListener('click', () => {
            const svc = item.dataset.service;
            const map = {
                'shipping': 'services-shipping.html',
                'authentic': 'services-authentic.html',
                'support': 'services-support.html',
                'refund': 'services-refund.html'
            };
            if (svc && map[svc]) window.location.href = map[svc];
        });
    });
});

// Open order history automatically when flagged (after checkout)
document.addEventListener('DOMContentLoaded', () => {
    try {
        const flag = localStorage.getItem('openHistoryOnLoad');
        if (flag === '1') {
            localStorage.removeItem('openHistoryOnLoad');
            if (typeof showHistoryBuy === 'function') {
                // create a fake event if needed
                showHistoryBuy({ preventDefault: () => {} });
            }
        }
    } catch (e) {}
});

// Burger menu
document.addEventListener('DOMContentLoaded', () => {
    const burgerToggle = document.getElementById('burger-toggle');
    const burgerMenu = document.getElementById('burger-menu');
    if (!burgerToggle || !burgerMenu) return;

    const setMenuState = (shown) => {
        burgerMenu.classList.toggle('show', shown);
        burgerMenu.setAttribute('aria-hidden', shown ? 'false' : 'true');
        burgerToggle.setAttribute('aria-expanded', shown ? 'true' : 'false');
        burgerToggle.classList.toggle('open', shown);
    };

    burgerToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setMenuState(!burgerMenu.classList.contains('show'));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!burgerMenu.contains(e.target) && !burgerToggle.contains(e.target) && burgerMenu.classList.contains('show')) {
            setMenuState(false);
        }
    });

    // Category selection
    burgerMenu.querySelectorAll('.burger-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            if (category === 'All') {
                filteredProducts = [...originalProducts];
            } else {
                filteredProducts = originalProducts.filter(p => p.Category === category);
            }
            currentPage = 1;
            adddatatohtml();
            setMenuState(false);
        });
    });
});

// Banner toggle: slide banner up/down when the arrow is clicked
(function () {
    try {
        const bannerToggleBtn = document.getElementById('banner-toggle');
        const bannerContainer = document.getElementById('Bannervideo');
        if (bannerToggleBtn && bannerContainer) {
            bannerToggleBtn.addEventListener('click', () => {
                const isCollapsed = bannerContainer.classList.toggle('collapsed');
                const icon = bannerToggleBtn.querySelector('i');
                if (icon) icon.classList.toggle('fa-rotate-180', isCollapsed);
                bannerToggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
            });
        }
    } catch (e) {
        console.warn('Banner toggle init failed', e);
    }
})();




//-------------------------------------- HÀM RENDER TẤT CẢ SẢN PHẨM ---------------------------------------------------

//------------------------------------------------------------- TẠO NÚT PHÂN TRANG -------------------------------------------------------------//
const createPagination = (totalProducts) => {
    const paginationContainer = document.querySelector('#pagination');
    
    const existingJumpTop = document.querySelector('.page-jump-wrap-container');
    if (existingJumpTop) existingJumpTop.remove();
    
    // Nếu không có sản phẩm, ẩn phân trang
    if (totalProducts <= 8) {
        paginationContainer.innerHTML = '';  // Ẩn phân trang
        return;
    }

    paginationContainer.innerHTML = ''; // Xóa các nút phân trang cũ

    totalPages = Math.ceil(totalProducts / productsPerPage); // Tính tổng số trang

    // Nút "Previous"
    const previousButton = document.createElement('button');
    previousButton.innerText = '<<';
    previousButton.disabled = currentPage === 1;
    previousButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            adddatatohtml();
        }
    };
    paginationContainer.appendChild(previousButton);

    // Nút số 1 (trang đầu tiên)
    const firstPageButton = document.createElement('button');
    firstPageButton.innerText = 1;
    firstPageButton.onclick = () => {
        currentPage = 1;
        adddatatohtml();
    };
    if (currentPage === 1) {
        firstPageButton.style.backgroundColor = '#B03060';
    }
    paginationContainer.appendChild(firstPageButton);

    // Nếu cần, thêm "..." sau trang 1
    if (currentPage > 3) {
        const dots = document.createElement('span');
        dots.innerText = '...';
        paginationContainer.appendChild(dots);
    }

    // Hiển thị các nút xung quanh trang hiện tại
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.onclick = () => {
            currentPage = i;
            adddatatohtml();
        };
        if (i === currentPage) {
            button.style.backgroundColor = '#B03060'; // Đổi màu nút trang hiện tại
        }
        paginationContainer.appendChild(button);
    }

    // Nếu cần, thêm "..." trước trang cuối
    if (currentPage + 1 < totalPages - 1) {
        const dots = document.createElement('span');
        dots.innerText = '...';
        paginationContainer.appendChild(dots);
    }

    // Nút cuối cùng (trang cuối)
    if (totalPages > 1) {
        const lastPageButton = document.createElement('button');
        lastPageButton.innerText = totalPages;
        lastPageButton.onclick = () => {
            currentPage = totalPages;
            adddatatohtml();
        };
        if (currentPage === totalPages) {
            lastPageButton.style.backgroundColor = '#B03060'; // Đổi màu nút trang hiện tại
        }
        paginationContainer.appendChild(lastPageButton);
    }

    // Nút "Next"
    const nextButton = document.createElement('button');
    nextButton.innerText = '>>';
    nextButton.disabled = currentPage === totalPages; // Vô hiệu hóa nếu đang ở trang cuối
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            adddatatohtml();
        }
    };
    paginationContainer.appendChild(nextButton);
    
    const existingJump = document.querySelector('.page-jump-wrap-container');
    if (existingJump) existingJump.remove();

    
    const jumpContainer = document.createElement('div');
    jumpContainer.className = 'page-jump-wrap-container';
    const innerWrap = document.createElement('div');
    innerWrap.className = 'page-jump-wrap';

    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.min = 1;
    pageInput.max = totalPages;
    pageInput.placeholder = 'Page';
    pageInput.className = 'page-jump-input';
    pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            goToPage(parseInt(pageInput.value, 10));
        }
    });

    const pageBtn = document.createElement('button');
    pageBtn.className = 'page-jump-btn';
    pageBtn.innerText = 'Go';
    pageBtn.addEventListener('click', () => {
        goToPage(parseInt(pageInput.value, 10));
    });

    innerWrap.appendChild(pageInput);
    innerWrap.appendChild(pageBtn);
    jumpContainer.appendChild(innerWrap);

    // Insert jump container after pagination
    if (paginationContainer.parentNode) paginationContainer.parentNode.insertBefore(jumpContainer, paginationContainer.nextSibling);
};



//------------------------------------------------------------- TẠO NÚT PHÂN TRANG -------------------------------------------------------------//



//------------------------------------------------------------- FILTER AND SEARCH SAN PHAM -------------------------------------------------------------//

const filterBtn = document.getElementById("filter-btn");
const sidebar = document.getElementById("sidebar");
const closeIcon = sidebar.querySelector("i.fa-xmark");
const applyFilterBtn = document.getElementById("apply-filter-btn");
const resetButton = document.getElementById("reset-filter-btn");

// Thêm sự kiện click cho nút Filter (Hiển thị Sidebar)
filterBtn.addEventListener("click", () => {
    sidebar.classList.add("show"); // Hiển thị Sidebar
    document.body.classList.add("no-scroll"); // Ngừng cuộn trang
    overlay.style.display = "block"; // Hiển thị overlay
});

// Sự kiện khi nhấn vào nút X (Đóng Sidebar)
closeIcon.addEventListener("click", () => {
    sidebar.classList.remove("show"); // Ẩn Sidebar
    document.body.classList.remove("no-scroll"); // Cho phép cuộn trang
    overlay.style.display = "none"; // Ẩn overlay
});

// Khi người dùng click vào overlay, cũng có thể đóng Sidebar
overlay.addEventListener("click", () => {
    sidebar.classList.remove("show"); // Ẩn Sidebar
    document.body.classList.remove("no-scroll"); // Cho phép cuộn trang
    overlay.style.display = "none"; // Ẩn overlay
});

// Lấy tất cả các nút kích thước (size buttons), loại giày (type buttons) và màu (color buttons)
const sizeButtons = document.querySelectorAll(".size-options button");
const typeButtons = document.querySelectorAll(".type-options button");
const colorButtons = document.querySelectorAll(".color-options button");

// Hàm xử lý khi nhấn vào nút (dùng chung cho tất cả các loại nút)
function handleButtonClick(buttonGroup) {
  buttonGroup.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active"); // Thêm hoặc xóa lớp 'active'
      console.log(`Selected: ${button.value}`);
    });
  });
}

// Áp dụng hàm xử lý nút cho kích thước, loại giày và màu
handleButtonClick(sizeButtons);
handleButtonClick(typeButtons);
handleButtonClick(colorButtons);

// Khi trang được tải lại, gọi hàm lọc và cập nhật số lượng sản phẩm
window.addEventListener('load', () => {
    // Khi trang được tải lại, chỉ gọi hàm lọc mà không hiển thị alert thành công
    filteredProducts = [...originalProducts]; // Reset danh sách từ gốc
    filterAndSearchProducts(true); // Thêm tham số `true` để không hiển thị alert thành công
});

// Cập nhật số lượng sản phẩm lọc
function updateFilterCount() {
    const filterCount = document.getElementById('filter-count');
    const productCount = filteredProducts.length || 0;
    filterCount.textContent = `(${productCount} product${productCount !== 1 ? 's' : ''})`;
}

function filterAndSearchProducts(isPageReload = false) {
    // Lọc theo kích thước
    const selectedSizes = [...document.querySelectorAll(".size-options button.active")].map(btn => parseInt(btn.value));
    filteredProducts = [...originalProducts]; // Reset danh sách từ gốc
    if (selectedSizes.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            product.Size.some(size => selectedSizes.includes(size))
        );
    }

    // Lọc theo loại sản phẩm
    const selectedCategories = [...document.querySelectorAll(".type-options button.active")].map(btn => btn.value);
    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(product => selectedCategories.includes(product.Category));
    }

    // Lọc theo màu sắc
    const selectedColors = [...document.querySelectorAll(".color-options button.active")].map(btn => btn.value);
    if (selectedColors.length > 0) {
        filteredProducts = filteredProducts.filter(product => selectedColors.includes(product.Colour));
    }

    // Lọc theo giá
    const minPrice = parseFloat(document.getElementById("price-min").value) || 0;
    const maxPrice = parseFloat(document.getElementById("price-max").value) || Infinity;
    if (minPrice > maxPrice) {
        showAlertFailure("Bạn đã nhập giá sai! Vui lòng nhập lại.");
        return;
    }
    filteredProducts = filteredProducts.filter(product => {
        const productPrice = parseFloat(product.Price);
        return productPrice >= minPrice && productPrice <= maxPrice;
    });

    // Tìm kiếm sản phẩm (có liên kết với bộ lọc)
    const searchQuery = document.querySelector(".form-search-input").value.trim().toLowerCase();
    if (searchQuery !== "") {
        filteredProducts = filteredProducts.filter(product =>
            product.ProductName.toLowerCase().includes(searchQuery)
        );
    }

    updateFilterCount();

    // Cập nhật giao diện
    if (filteredProducts.length > 0) {
        if (!isPageReload) {
            showAlertSuccess("Filter and Search Successful!");
        }
        currentPage = 1;
        adddatatohtml(); // Hiển thị lại sản phẩm đã lọc và tìm kiếm
        sidebar.classList.remove("show"); // Ẩn Sidebar
        document.body.classList.remove("no-scroll"); // Cho phép cuộn trang
        overlay.style.display = "none"; // Ẩn overlay
    } else {
        showAlertFailure("Don't have products with your filter.");
        productContainer.innerHTML = `<img src="../image/empty.png" alt="No products found" class="empty-image">`;
        updateFilterCount();
        createPagination(0);
    }
}
// Áp dụng bộ lọc khi nhấn nút "Apply Filter"
applyFilterBtn.addEventListener("click", () => {
    filterAndSearchProducts(); // Gọi hàm lọc và tìm kiếm
    sidebar.classList.remove("show"); // Đóng Sidebar
    document.body.classList.remove("no-scroll"); // Cho phép cuộn trang
    overlay.style.display = "none"; // Ẩn overlay
});

// Reset bộ lọc
resetButton.addEventListener("click", () => {
    // Xóa trạng thái kích hoạt của các nút lọc
    document.querySelectorAll(".sidebar button").forEach(btn => {
        btn.classList.remove("active");
    });

    // Đặt lại giá trị Min và Max price về rỗng
    document.getElementById("price-min").value = "";
    document.getElementById("price-max").value = "";

    // Đặt lại danh sách sản phẩm đã lọc về mặc định (toàn bộ sản phẩm)
    filteredProducts = [...originalProducts]; // Reset về danh sách gốc
    currentPage = 1;

    // Hiển thị lại tất cả sản phẩm
    showAlertSuccess("Deleted filter!");
    adddatatohtml();
    updateFilterCount();
    filterAndSearchProducts(); // Gọi lại để kết hợp tìm kiếm và lọc
});

// Tìm kiếm khi người dùng nhập
    document.querySelector(".form-search-input").addEventListener("input", () => {
    filterAndSearchProducts(); // Gọi lại khi có thay đổi trong tìm kiếm
});


//------------------------------------------------------------- FILTER AND SEARCH SAN PHAM -------------------------------------------------------------//



//------------------------------------------------------------- SẮP XẾP SẢN PHẨM -------------------------------------------------------------//

// Các hàm sắp xếp sản phẩm
function sortByNameAsc() {
    filteredProducts.sort((a, b) => a.ProductName.toLowerCase().localeCompare(b.ProductName.toLowerCase()));
    adddatatohtml();
}

function sortByNameDesc() {
    filteredProducts.sort((a, b) => b.ProductName.toLowerCase().localeCompare(a.ProductName.toLowerCase()));
    adddatatohtml();
}

function sortByPriceAsc() {
    filteredProducts.sort((a, b) => parseFloat(a.Price) - parseFloat(b.Price));
    adddatatohtml();
}

function sortByPriceDesc() {
    filteredProducts.sort((a, b) => parseFloat(b.Price) - parseFloat(a.Price));
    adddatatohtml();
}

// Lắng nghe sự kiện click vào các lựa chọn sắp xếp
const sortOptions = document.querySelectorAll('.sort-options ul li');
sortOptions.forEach(option => {
    option.addEventListener('click', function() {
        const sortType = this.id;

        // Cập nhật tên nút "Sort by"
        let sortText = '';
        switch(sortType) {
            case 'sort-None':
                sortText = 'None';
                break;
            case 'sort-name-asc':
                sortText = 'Name, A -> Z';
                break;
            case 'sort-name-desc':
                sortText = 'Name, Z -> A';
                break;
            case 'sort-price-asc':
                sortText = 'Price, Low -> High';
                break;
            case 'sort-price-desc':
                sortText = 'Price, High -> Low';
                break;
        }

        // Cập nhật tiêu đề của "Sort by"
        document.querySelector('.sort-button span').textContent = `Sort by: ${sortText}`;

        // Gọi hàm tương ứng với loại sắp xếp
        switch(sortType) {
            case 'sort-name-asc':
                sortByNameAsc();
                break;
            case 'sort-name-desc':
                sortByNameDesc();
                break;
            case 'sort-price-asc':
                sortByPriceAsc();
                break;
            case 'sort-price-desc':
                sortByPriceDesc();
                break;
            case 'sort-None':
                // Nếu chọn "None", không thay đổi thứ tự sắp xếp
                filteredProducts = [];
                adddatatohtml(); // Render lại với danh sách sản phẩm ban đầu
                break;
        }

        // Ẩn menu sắp xếp sau khi chọn
        document.querySelector('.sort-button').classList.remove('active');
    });
});


//------------------------------------------------------------- SẮP XẾP SẢN PHẨM -------------------------------------------------------------//




//------------------------------------------------------------- TẠO MODAL CONTENT CỦA SẢN PHẨM -------------------------------------------------------------//

function showSection(id) {
    const ProductLocal = JSON.parse(localStorage.getItem('Products'))||[];
    const product = ProductLocal.find(item => item.Id === id);
    if (!product) {
        console.error("Không tìm thấy sản phẩm với ID:", id);
        return;
    }

    // Tạo HTML cho các hình ảnh nhỏ
    const smallImagesHTML = (product.imgDetail && product.imgDetail.length > 0)
        ? product.imgDetail.map(imgSrc => `<img src="${imgSrc}" alt="${product.ProductName}">`).join('')
        : `<img src="${product.image}" alt="${product.ProductName}">`;


    let sizeOptions = '';
    for (let i = 0; i < product.Size.length; i++) {
        sizeOptions += `<span>${product.Size[i]}</span>`;
    }
    const modalInfor = `
         <div class="modal fade" id="ModalInfor" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                            <div class="container">
                                <div style="display:flex;flex-direction:column;">
                                <div class="product-content row">
                                    <div class="product-content-left" >
                                        <div class="product-content-left-big-img">
                                            <img src="${product.image}">
                                        </div>
                                        <div class="product-content-left-small-img">
                                        ${smallImagesHTML}
                                        </div>
                                    </div>
                                    <div class="product-content-right">
                                        <div class="product-content-right-product-name">
                                            <h1>${product.ProductName}</h1>
                                            
                                        </div>
                                        
                                        <div class="product-content-right-product-color">
                                            <span style="font-weight: bold;font-size: 16px;"></span>${product.Colour} ${product.Category} Shoes<span
                                                    </span>
                                            <div class="product-content-right-product-color-img">
                                                <img src="image/mauxanh.webp" alt="">
                                            </div>
                                        </div>
                                        <div class="product-content-right-product-size">
                                            <p style="font-weight: bold;">Size</p>
                                            <div class="size">
                                            ${sizeOptions}
                                            </div>
                                        </div>
                                        <div class="quantity">
                                            <p style="font-weight: bold;font-size: 16px;">Quantity: </p>
                                            <input class="quantity-input" type="number" min="0" value="1">
                                        </div>
                                        <p style="color: rgb(255, 102, 0);font-size: 16px;">Please choose your size </p>

                                        <div class="product-content-right-product-price">
                                            <h2 font-size: 16px;>${product.Price} $</h2>
                                        </div>

                                        <div class="product-content-right-product-button">
                                            <button  onclick="buydirect(${product.Id})">
                                                <p>Buy now</p>
                                            </button>
                                            <button class="add-to-cart" id="close-btn1" onClick="addcart(${product.Id})">
                                                <i class="fa-regular fa-cart-shopping"></i>
                                            </button>
                                        </div>
                                       
                                    </div>
                                </div>
                            </div>
                            <button class="close" data-dismiss="modal" aria-label="Close" id="close-btn2">
                                <i class="fa-solid fa-xmark"></i>
                            </button>

                    
                            </div>
                    </div>
                </div>
            </div>
        </div>
    `
    document.body.insertAdjacentHTML('beforeend', modalInfor);
    const modalInforElement = document.getElementById('ModalInfor');
    const bootstrapModalInfor = new bootstrap.Modal(modalInforElement);
    bootstrapModalInfor.show();
    
    // Đóng modal
    document.getElementById('close-btn1').addEventListener('click', () => {
        bootstrapModalInfor.hide();
    }); 
    document.getElementById('close-btn2').addEventListener('click', () => {
        bootstrapModalInfor.hide();
    }); 
    modalInforElement.addEventListener('hidden.bs.modal', () => {
        modalInforElement.remove();
    });


    document.querySelectorAll('.size span').forEach(span => {
        span.addEventListener('click', function () {
            document.querySelectorAll('.size span').forEach(size => size.classList.remove('active'));
            this.classList.add('active');
        });
    });


    // sự kiện nhấn vào ảnh nhỏ
    const groups = document.querySelectorAll(".product-content"); // Chọn tất cả các nhóm sản phẩm
    groups.forEach(function (group) {
        const bigImg = group.querySelector(".product-content-left-big-img img");
        const smalmg = group.querySelectorAll(".product-content-left-small-img img");
        smalmg.forEach(function (imgItem) {
            imgItem.addEventListener("click", function () {
                bigImg.src = imgItem.src;
            });
        });
    });

}


// Hàm khởi tạo ứng dụng
const initApp = () => {
    try {
        const existing = JSON.parse(localStorage.getItem('Products')) || [];
        if (existing.length > 0) {
            // Nếu đã có Products trong localStorage (ví dụ do admin thêm), dùng dữ liệu đó
            originalProducts = [...existing];
            filteredProducts = [...originalProducts];
            adddatatohtml();
            return;
        }
    } catch (e) {
        console.warn('Could not read Products from localStorage', e);
    }

    // Nếu chưa có dữ liệu, tải từ product.json một lần và lưu vào localStorage
    fetch('product.json') // Lấy dữ liệu từ tệp JSON
        .then(response => response.json())
        .then(data => {
            // Lưu dữ liệu vào localStorage để các hàm khác (filter, cart...) có thể dùng chung
            localStorage.setItem('Products', JSON.stringify(data));

            // Cập nhật mảng gốc và mảng đã lọc trong bộ nhớ
            originalProducts = [...data];
            filteredProducts = [...originalProducts];

            adddatatohtml(); // Render sản phẩm vào HTML
        })
        .catch(err => {
            console.error('Failed to load product.json', err);
            // Even if fetch fails, attempt to render from whatever is in localStorage
            const fallback = JSON.parse(localStorage.getItem('Products')) || [];
            originalProducts = [...fallback];
            filteredProducts = [...originalProducts];
            adddatatohtml();
        });
};
// quản lí hình ảnh lớn nhỏ
groups.forEach(function (group) {
    const bigImg = group.querySelector(".product-content-left-big-img img");
    const smalmg = group.querySelectorAll(".product-content-left-small-img img");
    smalmg.forEach(function (imgItem) {
        imgItem.addEventListener("click", function () {
            bigImg.src = imgItem.src;
        });
    });
});

groups.forEach(function (group) {
    const button = group.querySelector(".product-content-right-bottom-top");
    const content = group.querySelector(".product-content-right-bottom-content-big");

    if (button && content) {
        button.addEventListener("click", function () {
            content.classList.toggle("activeB");
        });
    }
});
initApp(); // Gọi hàm khởi tạo

//------------------------------------------------------------- TẠO MODAL CONTENT CỦA SẢN PHẨM -------------------------------------------------------------//


// Hàm lấy dữ liệu từ product.json và lưu vào localStorage
// async function saveProductsToLocalStorage() {
//     try {
//          // Fetch dữ liệu từ file product.json
//         const response = await fetch('product.json');
//         const products = await response.json();

//         // Lưu dữ liệu vào localStorage với tên "Products"
//         localStorage.setItem('Products', JSON.stringify(products));

//         console.log('Dữ liệu đã được lưu vào localStorage với key "Products".');
//     } catch (error) {
//         console.error('Lỗi khi tải hoặc lưu dữ liệu:', error);
//     }
// }
// Gọi hàm
// saveProductsToLocalStorage();


/* cart js */
let iconcart = document.querySelector('#cart-icon')
let body = document.querySelector('body')
let closecart = document.querySelector('.closee')
let listcart = document.querySelector('.list-cart')
let cartspan = document.querySelector('.cartspan')
let totalspan = document.querySelector('.total span')
let checkoutButton=document.querySelector('.checkout')

    checkoutButton.addEventListener('click', ()=>{
        let userlogin = JSON.parse(localStorage.getItem('userLogin'))
        let cart= userlogin.Cart
        if(cart.length>0){
        showAlertSuccess("Đang chuyển hướng sang trang thanh toán")
        setTimeout(() => {
            window.location.href='checkout/checkout.html';
        },1500);
        }else showAlertFailure("Giỏ hàng phải có sản phẩm")
    })




iconcart.addEventListener('click',()=>{
    body.classList.add('showCart')
    Overlay.style.display ='block'
    document.body.classList.add('no-scroll')
})

closecart.addEventListener('click',()=>{
    body.classList.remove('showCart')
    Overlay.style.display ='none'
    document.body.classList.remove('no-scroll')
})

Overlay.addEventListener('click',() =>{
    body.classList.remove('showCart')
    Overlay.style.display ='none'
    document.body.classList.remove('no-scroll')
})
const addcart = (id) => {
    let productlocal = JSON.parse(localStorage.getItem('Products'));
    let product = productlocal.find((value) => value.Id === id);
    let userlogin = JSON.parse(localStorage.getItem('userLogin'));
    let users = JSON.parse(localStorage.getItem('Users'));
    let quantityinput = document.querySelector('.quantity-input')
    let spanactive = document.querySelector('.size span.active');
    let quantity = parseInt(quantityinput.value,10)
    if (!userlogin) {
        showAlertFailure("Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng");
    } else if (!spanactive) {
        showAlertFailure("Vui lòng chọn size");
        
    } else if(quantity<1){
        showAlertFailure("Vui lòng chọn số lượng phù hợp");
        return;
    } else { 
        
        let cart = userlogin.Cart || [];
        let size = spanactive.textContent;
        let productincart = cart.findIndex((value) => value.product_id === id && value.size === size); 
        let uniqueid = id + "_" + size

      
        if (cart.length <= 0) {
            cart = [{
                uniqueID:uniqueid,
                product_id: id,
                quantity: quantity,
                size: size,
                color: product.Colour,
                price: product.Price*quantity,
                image : product.image,
                type : product.Category,
                name : product.ProductName

            }];
        } 

        else if (productincart < 0) {
            cart.push({
                uniqueID:uniqueid,
                product_id: id,
                quantity: quantity,
                size: size,
                color: product.Colour,
                price: product.Price*quantity,
                image : product.image,
                type : product.Category,
                name : product.ProductName

            });
        } 

        else {
            cart[productincart].quantity = cart[productincart].quantity + quantity
            cart[productincart].price = product.Price * cart[productincart].quantity;
        }

        userlogin.Cart = cart

      
        users = users.map(user => user.userId === userlogin.userId ? {...user, Cart: cart} : user);

     
        localStorage.setItem('userLogin', JSON.stringify(userlogin));
        localStorage.setItem('Users', JSON.stringify(users));

        showAlertSuccess("Thêm vào giỏ hàng thành công");
    }
    addcarttohtml();
   
    

};

const buydirect = (id) => {
    let productlocal = JSON.parse(localStorage.getItem('Products'));
    let product = productlocal.find((value) => value.Id === id);
    let userlogin = JSON.parse(localStorage.getItem('userLogin'));
    let users = JSON.parse(localStorage.getItem('Users'));
    let quantityinput = document.querySelector('.quantity-input')
    let spanactive = document.querySelector('.size span.active');
    let quantity = parseInt(quantityinput.value,10)
    
    if (!userlogin) {
        showAlertFailure("Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng");
    } else if (!spanactive) {
        showAlertFailure("Vui lòng chọn size");
    } else if(quantity<1){
        showAlertFailure("Vui lòng chọn số lượng phù hợp");
        return;
    } else { 
        
        let cart = userlogin.Cart || [];
        
        let size = spanactive.textContent;
        let productincart = cart.findIndex((value) => value.product_id === id && value.size === size); 
        let uniqueid = id + "_" + size

      
        if (cart.length <= 0) {
            cart = [{
                uniqueID:uniqueid,
                product_id: id,
                quantity: quantity,
                size: size,
                color: product.Colour,
                price: product.Price*quantity,
                image : product.image,
                type : product.Category,
                name : product.ProductName

            }];
        } 

        else if (productincart < 0) {
            cart.push({
                uniqueID:uniqueid,
                product_id: id,
                quantity: quantity,
                size: size,
                color: product.Colour,
                price: product.Price*quantity,
                image : product.image,
                type : product.Category,
                name : product.ProductName

            });
        } 

        else {
            cart[productincart].quantity = cart[productincart].quantity + quantity
            cart[productincart].price = product.Price * cart[productincart].quantity;
        }

        userlogin.Cart = cart
        users = users.map(user => user.userId === userlogin.userId ? {...user, Cart: cart} : user);

     
        localStorage.setItem('userLogin', JSON.stringify(userlogin));
        localStorage.setItem('Users', JSON.stringify(users));

        showAlertSuccess("Đang chuyển hướng sang trang thanh toán")
        setTimeout(() => {
            window.location.href='checkout/checkout.html';
        }, 1500);

        
    }
    addcarttohtml();
};

const addcarttohtml = () =>{
    let total = 0;
    let totalbill = 0;
    let productlocal = JSON.parse(localStorage.getItem('Products'));
    let userlogin = JSON.parse(localStorage.getItem('userLogin'));
    let cart = userlogin.Cart
    listcart.innerHTML='';
    if(cart.length>0){
        cart.forEach(cart =>{
            total = total + cart.quantity; // tong so sp trong gio hang   
            let newcart = document.createElement('div');        
            newcart.classList.add('item');
            let positionproduct = productlocal.findIndex((value)=> value.Id==cart.product_id);
            let info= productlocal[positionproduct];
            newcart.dataset.id=cart.uniqueID;
            totalbill = totalbill + cart.quantity*info.Price;
            newcart.innerHTML=`
                    <div class="image">
                        <img src="${info.image}">
                    </div>
                    <div class="name">${info.ProductName}</div>
                    <div class="size">Size ${cart.size}</div>
                    <div class="price">${cart.price}$</div>
                    <div class="quantity">
                        <span class="minus"">-</span>
                        <span>${cart.quantity}</span>
                        <span class="plus">+</span>
                    </div>
                    `
                    listcart.appendChild(newcart);
        })
    }
    cartspan.innerText = total; // hien so sp trong gio hang
    totalspan.innerText = totalbill+"$"; //hien tong gia tien 
}
let buttonlogin = document.querySelector('.bnt-login')

buttonlogin.addEventListener('click',()=>{
    setTimeout(() => {
        let userlog = JSON.parse(localStorage.getItem('userLogin'));
        if (userlog) {
            addcarttohtml();
        }
    }, 500);  
    
})

window.addEventListener('load', function () {
    let userlog = JSON.parse(localStorage.getItem('userLogin'));
        if (userlog) {
            addcarttohtml();
        }
    

})



listcart.addEventListener('click', (event) =>{
    let positionclick = event.target;
    if(positionclick.classList.contains('minus')|| positionclick.classList.contains('plus')){
        let product_id = positionclick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if(positionclick.classList.contains('plus')){
            type = 'plus';
        }
        changequanlity(product_id,type);
    }
    })
    const changequanlity = (product_id,type) =>{
        let productlocal = JSON.parse(localStorage.getItem('Products'))
        let userlogin = JSON.parse(localStorage.getItem('userLogin'))
        let cart = userlogin.Cart
        let users = JSON.parse(localStorage.getItem('Users'))
        let [id, size] = product_id.split("_");

        let positionitemincart = cart.findIndex((value)=> value.product_id == id&& value.size == size);
        console.log(positionitemincart); 
        let product = productlocal.find((value) => String(value.Id) === String(id));
        
        if(positionitemincart  >=0){
            switch(type){
                case 'plus':
                    cart[positionitemincart].quantity=cart[positionitemincart].quantity + 1;
                    cart[positionitemincart].price = product.Price * cart[positionitemincart].quantity
                    break;
                default:    
                    let valuechange = cart[positionitemincart].quantity - 1;
                    if(valuechange>0){
                        cart[positionitemincart].quantity = valuechange;
                        cart[positionitemincart].price =  cart[positionitemincart].price - product.Price;
                    }else {
                        cart.splice(positionitemincart,1);
                        
                    }break;
                    
            }
        }
    userlogin.Cart = cart;
    users = users.map(user => user.userId === userlogin.userId ? { ...user, Cart: cart } : user);

    localStorage.setItem('userLogin', JSON.stringify(userlogin)); 
    localStorage.setItem('Users', JSON.stringify(users)); 
    addcarttohtml();
}
function backToAdmin(){
    window.location.href = "../doan/Admin/Admin.html"
}













