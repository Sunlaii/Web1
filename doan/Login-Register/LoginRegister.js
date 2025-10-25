const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const dangNhap = document.querySelector('#dangnhap');
const dangKy = document.querySelector('#dangky');
const close = document.querySelector('.icon-close');
const Information = document.getElementById('thongtintk')
const historyBuy = document.getElementById('historybuy')
let tenTK = document.querySelector('#tentk')
const admin = document.getElementById('admin')
let soDienThoai = document.getElementById('sodienthoai')
let email = document.getElementById('email')
let diaChiDetail = document.getElementById('diachi-detail')
let diaChiCity = document.getElementById('diachi-thanhpho')
let diaChiDistrict = document.getElementById('diachi-quan')
let diaChiWard = document.getElementById('diachi-phuong')
let currentPass = document.getElementById('current-password-text')
let newPass = document.getElementById('new-password-text')
let cfNewPass = document.getElementById('cf-new-password-text')
let users = JSON.parse(localStorage.getItem("Users")) || [];
let userLogin = JSON.parse(localStorage.getItem("userLogin"))|| null;
const Overlay = document.getElementById('overlay')
if (users.length === 0) {
    const defaultAdmin = {Cart: [],ProductBuy:  [],address: "",date: '08/12/2024',email: "",password: "admin",phone : "0808080808",
        role: "admin",status:"Hoat Dong",userId: 80962,username: "admin1"};
        const user1 = {
            Cart: [],
            ProductBuy: [],
            address: "123 Main St",
            date: '08/12/2024',
            email: "user1@example.com",
            password: "user1pass",
            phone: "0909090909",
            role: "user",
            status: "Hoat Dong",
            userId: 10001,
            username: "user1"
        };
        
        const user2 = {
            Cart: [],
            ProductBuy: [],
            address: "456 Elm St",
            date: '05/12/2024',
            email: "user2@example.com",
            password: "user2pass",
            phone: "0919191919",
            role: "user",
            status: "Hoat Dong",
            userId: 10002,
            username: "user2"
        };
        
        const user3 = {
            Cart: [],
            ProductBuy: [],
            address: "789 Oak St",
            date: '01/12/2024',
            email: "user3@example.com",
            password: "user3pass",
            phone: "0929292929",
            role: "user",
            status: "Khong Hoat Dong",
            userId: 10003,
            username: "user3"
        };
        
        const user4 = {
            Cart: [],
            ProductBuy: [],
            address: "321 Pine St",
            date: '03/12/2024',
            email: "user4@example.com",
            password: "user4pass",
            phone: "0939393939",
            role: "user",
            status: "Hoat Dong",
            userId: 10004,
            username: "user4"
        };
        
        const user5 = {
            Cart: [],
            ProductBuy: [],
            address: "654 Maple St",
            date: '20/12/2024',
            email: "user5@example.com",
            password: "user5pass",
            phone: "0949494949",
            role: "user",
            status: "Hoat Dong",
            userId: 10005,
            username: "user5"
        };
        
    users.push(defaultAdmin,user1,user2,user3,user4,user5);
    localStorage.setItem('Users', JSON.stringify(users));
}
// Kiểm tra khi trang được tải
window.addEventListener('load', function () { 
    // Kiểm tra xem key 'userLogin' có tồn tại trong localStorage hay không
    if (localStorage.getItem('userLogin')) {
        if (userLogin.role == 'admin'){
            historyBuy.style.display = 'none'
            admin.style.display = 'block'
        }
        document.querySelector('.auth-container').classList.add('active')
        const index =users.findIndex(user => user.username === userLogin.username && user.password === userLogin.password);
        const user= users[index];
        document.querySelector('.text-nameaccout').innerText = user.username
    } else {
        document.querySelector('.auth-container').classList.remove('active')
    }
});
// -------cua sổ thông báo ------
let alertTimeout
 function showAlert() {
    document.getElementById('alert').classList.add('active')
    alertTimeout = setTimeout(closeAlert,2000)
}
function closeAlert () {
    document.getElementById('alert').classList.remove('active')
}

function showAlertSuccess(massege){
    document.getElementById('alertMessage').innerText = massege;
    document.querySelector('.alertTitle').innerText = 'Success'
    document.getElementById('alert').classList.add('alertSuccess')
    showAlert()
    setTimeout(function(){
        document.getElementById('alert').classList.remove('alertSuccess')
    }, 2000)
}
function showAlertFailure(massege){
    document.getElementById('alertMessage').innerText = massege;
    document.querySelector('.alertTitle').innerText = 'Fail'
    document.getElementById('alert').classList.add('alertFailure')
    showAlert()
    setTimeout(function(){
        document.getElementById('alert').classList.remove('alertFailure')
    }, 2000)
}
// -------cua sổ thông báo ------

// Các sự kiện điều khiển giao diện
registerLink.addEventListener('click', (e) => {
    wrapper.classList.add('active');
    e.preventDefault()
});
loginLink.addEventListener('click', (e) => {
    wrapper.classList.remove('active');
    e.preventDefault();
});
dangNhap.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.add('active-popup');
    wrapper.classList.remove('active');

    document.body.classList.add('no-scroll');
    Overlay.style.display = 'block';
});
dangKy.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.add('active-popup');
    wrapper.classList.add('active');
    document.body.classList.add('no-scroll');
    Overlay.style.display = 'block';
});
close.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.remove('active-popup');
    document.body.classList.remove('no-scroll');
    Overlay.style.display = 'none';
});

// Hàm quay về đầu trang
function quayVeDauTrang() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------------- Kiểm tra các trường nhập liệu ----------------//
const fullname = document.querySelector('#register-username');
const phone = document.querySelector('#register-phone');
const password = document.querySelector('#register-password');
const confirmPassword = document.querySelector('#cf-password');
const loginPassword = document.querySelector('.login-password');
const registerForm = document.querySelector('#form-register');


const eyeIcon1 = document.querySelector('.icon #eye1');
const eyeIcon2 = document.querySelector('.icon #eye2');
const eyeIcon3= document.querySelector('.icon #eye3');
const EyeIcon = [eyeIcon1,eyeIcon2,eyeIcon3]
const passInput = [loginPassword,password,confirmPassword]

// Lắng nghe sự kiện 'input' trên trường mật khẩu
for (let index = 0; index < passInput.length; index++) {
    const element = passInput[index];
    element.addEventListener('input', () => {
        if (loginPassword.value.length > 0) {
            EyeIcon[index].style.visibility = 'visible';
        } else {
            EyeIcon[index].style.visibility = 'hidden';
        }
    });
}


// Lắng nghe sự kiện 'click' trên biểu tượng mắt
for (let index = 0; index < EyeIcon.length; index++) {
    const element = EyeIcon[index];
    element.addEventListener('click', () => {
        const isPasswordVisible = passInput[index].getAttribute('type') === 'text';
        passInput[index].setAttribute('type', isPasswordVisible ? 'password' : 'text');
        element.classList.toggle('fa-eye');
        element.classList.toggle('fa-eye-slash');
    });
    
}


function showError(input, message) {
    let parent = input.parentElement;
    let small = parent.querySelector('small');
    parent.classList.add('error');
    small.innerText = message;
}

// Xóa lỗi
function showSuccess(input) {
    let parent = input.parentElement;
    let small = parent.querySelector('small');
    parent.classList.remove('error');
    small.innerText = '';
}

// Kiểm tra trường nhập liệu trống
function checkEmptyError(listInput) {
    let isEmptyError = false;
    listInput.forEach(input => {
        input.value = input.value.trim();
        if (!input.value) {
            showError(input, 'Cannot be left blank');
            isEmptyError = true;
        } else {
            showSuccess(input);
        }
    });
    return isEmptyError;
}

// Kiểm tra độ dài trường nhập liệu
function checkLengthError(input, min, max) {
    input.value = input.value.trim();
    if (input.value.length < min) {
        showError(input, `There must be at least ${min} characters`);
        return true;
    }
    if (input.value.length > max) {
        showError(input, `There must be less ${max} characters`);
        return true;
    }
    showSuccess(input);
    return false;
}

// Kiểm tra số điện thoại
function checkPhoneLengthError(input) {
    input.value = input.value.trim();
    if (input.value.length === 10) {
        showSuccess(input);
        return false;
    } else {
        showError(input, 'Must be 10 correct numbers');
        return true;
    }
}
function checkPhoneValueError(input){
    input.value = input.value.trim();
    const phoneregex = /^0[0-9]/;
    if(!phoneregex.test(input.value)){
        showError(input, 'Invalid');
        return true;
    }
    return false;
}
// Kiểm tra xac nhan mk
function checkConfirmPasswordError(password, confirmPassword){
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Confirmation password does not match!');
        return true;
    } else {
        showSuccess(confirmPassword);
        return false
    }
}
//mắt

// Kiem tra email
function checkEmailError(input) {
    input.value = input.value.trim(); // Loại bỏ khoảng trắng đầu và cuối
    const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.(gmail\.com|edu\.vn|yahoo\.com|outlook\.com|edu.vn)$/;
    if (emailRegex.test(input.value) || input.value === '') {
        showSuccess(input); // Hàm này sẽ đánh dấu input hợp lệ
        return false; // Không có lỗi
    } else {
        showError(input, 'Invalid email.'); // Hàm này hiển thị lỗi
        return true; // Có lỗi
    }
}

// Kiểm tra đăng ký người dùng
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let isEmptyError = checkEmptyError([fullname, phone, password, confirmPassword]);
    let isFullnameLengthError = checkLengthError(fullname, 3, 10);
    let isPasswordLengthError = checkLengthError(password, 3, 10);
    let isConfirmPasswordError = checkConfirmPasswordError(password,confirmPassword);
    let isPhoneLengthError = checkPhoneLengthError(phone);
    let isPhoneValueError = checkPhoneValueError(phone);
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    const user = {
                userId: Math.ceil(Math.random() *100000000), 
                date: formattedDate,
                username: fullname.value,
                phone: phone.value, 
                password: password.value, 
                email: email.value, 
                address: {
                    detail: '',
                    city: '',
                    district: '',
                    ward: ''
                },
                 status: "Hoat Dong",
                 role:"user",
                 Cart: [],
                 ProductBuy:[]
                }
    // Kiểm tra mật khẩu xác nhận
    
    email.value = ''
    if (users.some(user => user.username === fullname.value)) {
        showError(fullname, 'Username already exists!');
    } else if (!isEmptyError && !isFullnameLengthError && !isPasswordLengthError && !isPhoneLengthError && !isConfirmPasswordError && !isPhoneValueError) {
        // Nếu không có lỗi, lưu thông tin vào mảng users
        users.push(user);
        // alert("Đăng ký thành công!");
        showAlertSuccess("Registered successfully!")
        // Lưu lại danh sách người dùng vào localStorage
        localStorage.setItem("Users", JSON.stringify(users));
  
        console.log("Update user list:", users);

        wrapper.classList.remove('active');
        // Reset form sau khi đăng ký thành công
        registerForm.reset();
    }
});
// ---------------- Kiểm tra các trường nhập liệu cho đăng nhập ----------------//
const loginUsername = document.querySelector('.login-username');
const loginForm = document.querySelector('#form-login');


// Kiểm tra đăng nhập
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("Users")) || [];
    const username = loginUsername.value;
    const password = loginPassword.value;
    
    // Tìm người dùng trong mảng
    const index = users.findIndex(user => user.username === username && user.password === password && user.status === 'Hoat Dong');
    const user = users[index];
    if (index > -1) {
        localStorage.setItem("userLogin",JSON.stringify(user));
        document.querySelector('.auth-container').classList.add('active')
        document.querySelector('.text-nameaccout').innerText = user.username
        showAlertSuccess(`Log in successfully! Welcome ${user.username}`)
        loginForm.reset();
        console.log("User information:", user);
        wrapper.classList.remove('active-popup');
        document.body.classList.remove('no-scroll');
        Overlay.style.display = 'none';
        if (user.role == 'admin'){
            historyBuy.style.display = 'none'
            admin.style.display = 'block'
        }
        setTimeout(() => {
            window.location.reload()
        }, 2000);
    }else {
        const index = users.findIndex(user => user.username === username && user.password === password && user.status !== 'Hoat Dong');
        if(index > 0){
            showAlertFailure("Accout were block");
        }else{
        showAlertFailure("The username or password is incorrect!");
        }
    }
});
// Kiểm tra trạng thái đăng nhập khi tải lại trang

// --------logout--------
const logout = document.querySelector('.logout-container')
function bntLogout(){
    logout.classList.add('active')
}
function closeLogout(){
    logout.classList.remove('active')
}
function sbtLogout (){

    localStorage.removeItem("userLogin");
    closeLogout()
    document.querySelector('.auth-container').classList.remove('active')
    showAlertSuccess('Signing out...')
    setTimeout(function(){
        window.location.reload();
    }, 2000)
}
// --------------------information accout--------

const informationContainer = document.querySelector('.information-container')
const formChangePass = document.getElementById('change-password-form')
const formChangeInformation = document.getElementById('information-accout-content')
let changePass = document.getElementById('btn-change-pass')

// const citySelect = document.getElementById("city");
// const districtSelect = document.getElementById("district");
// const wardSelect = document.getElementById("ward");
// const defaultOption = citySelect.querySelectorAll('select option[value=""]');
// defaultOption.style.display = 'none' // Xóa mục mặc định

Information.addEventListener('click', (e) => {
    e.preventDefault()
    Overlay.style.display = 'block'
    document.body.classList.add('no-scroll')
    informationContainer.classList.add('active-popup')
    informationContainer.classList.remove('active')
    updateUserInformation()
})

function closeInformation(){
    informationContainer.classList.remove('active-popup')
    showSuccess(tenTK)
    showSuccess(soDienThoai)
    showSuccess(email)
    showSuccess(currentPass)
    showSuccess(newPass)
    showSuccess(cfNewPass)
    formChangePass.reset()
    formChangeInformation.reset()
    Overlay.style.display = 'none'
    document.body.classList.remove('no-scroll')
}

function returnInformation(){
    informationContainer.classList.remove('active')
    showSuccess(tenTK)
    showSuccess(soDienThoai)
    showSuccess(email)
    updateUserInformation()
}
function changePasswordActive(e){
    e.preventDefault()
    informationContainer.classList.add('active')
    showSuccess(currentPass)
    showSuccess(newPass)
    showSuccess(cfNewPass)
    formChangePass.reset()
}
// kiểm tra tên nguoi dung da ton tại
function checkUsernameExists(username, users, currentUsername) {
    const trimmedUsername = username.trim();
    return users.some(user => user.username === trimmedUsername && user.username !== currentUsername);
}




// Hàm cập nhật thông tin người dùng
function updateUserInformation() {
    // Lấy thông tin người dùng đã đăng nhập
    const userLogin = JSON.parse(localStorage.getItem("userLogin")) || [];
    const users = JSON.parse(localStorage.getItem("Users")) || [];

    if (!userLogin) {
        showAlertFailure("User information not found. Please log in again.");
        return;
    }

    // Gán giá trị hiện tại của người dùng vào các input
    tenTK.value = userLogin.username;
    soDienThoai.value = userLogin.phone;
    email.value = userLogin.email;
    diaChiDetail.value = userLogin.address.detail;
    diaChiCity.value = userLogin.address.city;
    diaChiDistrict.value = userLogin.address.district;
    diaChiWard.value = userLogin.address.ward;

    // Lưu thông tin khi người dùng nhấn nút "Lưu thay đổi"
    const saveButton = document.getElementById("save-change-information");

    saveButton.onclick = (e) => {
        e.preventDefault();
        let isEmailError = checkEmailError(email); // Kiểm tra email
        let isPhoneLengthError = checkPhoneLengthError(soDienThoai); // Kiểm tra độ dài số điện thoại
        let isPhoneValueError = checkPhoneValueError(soDienThoai); // Kiểm tra giá trị số điện thoại
        const userIndex = users.findIndex(u => u.username === userLogin.username); // Tìm người dùng trong danh sách
        let isNameLengthError = checkLengthError(tenTK, 3, 10); // Kiểm tra độ dài tên đăng nhập
        let isNameAlreadyExistsError = false;
    
        // Kiểm tra lỗi tên người dùng đã tồn tại (nếu người dùng đổi tên)
        if (users[userIndex].username !== tenTK.value.trim()) {
            isNameAlreadyExistsError = checkUsernameExists(tenTK.value, users, userLogin.username);
    
            // Nếu tên người dùng đã tồn tại, hiển thị thông báo lỗi
            if (isNameAlreadyExistsError) {
                showError(tenTK, "Username already exists, please choose another name.");
            }
        }
    
        // Nếu không có lỗi, cập nhật thông tin người dùng
        if (userIndex !== -1 && !isEmailError && !isPhoneLengthError && !isPhoneValueError && !isNameAlreadyExistsError && !isNameLengthError) {
            users[userIndex].email = email.value;
            users[userIndex].address.city = diaChiCity.value;
            users[userIndex].address.district = diaChiDistrict.value;
            users[userIndex].address.ward = diaChiWard.value;
            users[userIndex].address.detail = diaChiDetail.value;
            users[userIndex].phone = soDienThoai.value;
            users[userIndex].username = tenTK.value;
    
            localStorage.setItem("Users", JSON.stringify(users)); // Lưu danh sách người dùng
            localStorage.setItem("userLogin", JSON.stringify(users[userIndex])); // Cập nhật thông tin người dùng đang đăng nhập
    
            showAlertSuccess("The information has been updated successfully!");
            informationContainer.classList.remove('active-popup');
            Overlay.style.display = 'none'
            document.body.classList.remove('no-scroll')
            document.querySelector('.text-nameaccout').innerText = users[userIndex].username;
        } else {
            showAlertFailure("Unable to update information. Please try again!");
        }
    };
}
const cityData = {
    hanoi: {
        districts: {
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
        }
    },
    hochiminh: {
        districts: {
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
            "Quận 12": ["Tân Thới Hiệp","An Phú Đông", "Đông Hưng Thuận", "Hiệp Thành", "Tân Chánh Hiệp", "Tân Hưng Thuận"],
            "Quận Bình Tân": ["Bình Hưng Hòa", "Bình Hưng Hòa A", "Bình Hưng Hòa B", "Bình Trị Đông", "Bình Trị Đông A", "Bình Trị Đông B"],
            "Quận Bình Thạnh": ["1", "2", "3", "4", "5", "6"],
            "Quận Gò Vấp": ["1", "2", "3", "4", "5"],
            "Quận Phú Nhuận": ["1", "2", "3", "4", "5"],
            "Quận Thủ Đức": ["An Lợi Đông", "Bình An", "Bình Trưng Tây", "Long Bình", "Linh Đông", "Linh Trung", "Tam Bình"],
            "Huyện Bình Chánh": ["Bình Chánh", "Bình Hưng", "Bình Lợi", "Bình Tân"],
            "Huyện Củ Chi": ["An Phú", "An Nhơn", "Củ Chi", "Phước Hiệp"],
            "Huyện Hóc Môn": ["Bàu Cò", "Hoà Bình"]
        }
    },
    danang: {
        districts: {
            "Hải Châu": ["Bình Hiên", "Bình Thuận", "Cẩm Lệ", "Đà Nẵng", "Hải Châu"],
            "Thanh Khê": ["An Khê", "Hòa Cường", "Lê Duẩn"],
            "Sơn Trà": ["Thọ Quang", "Thọ Tiền"],
            "Liên Chiểu": ["Bình Dương", "Hoà Phát"],
            "Ngũ Hành Sơn": ["Hòa Hải", "Hòa Quý", "Khuê Mỹ", "Mỹ An", "Mỹ Khê", "Phước Mỹ", "Sơn Trà"],
            "Cẩm Lệ": ["Hòa An", "Hòa Phát", "Khuê Trung", "Phước Lý"],
            "Hòa Vang": ["Hòa Nhơn", "Hòa Phước", "Hòa Tiến", "Hòa Châu", "Hòa Khương", "Hòa Bắc", "Hòa Sơn"]
        }
    }
};
const cityInput = document.getElementById("diachi-thanhpho");
const districtInput = document.getElementById("diachi-quan");
const wardInput = document.getElementById("diachi-phuong");
const cityOptions = document.querySelectorAll("#city-list li");
const districtOptions = document.querySelectorAll("#district-list li");
const wardOptions = document.querySelectorAll("#ward-list li");
const districtList = document.getElementById("district-list");
const wardList = document.getElementById("ward-list");
const cityContent = document.querySelector("#city-list").closest('.content');
const districtContent = document.querySelector("#district-list").closest('.content');
const wardContent = document.querySelector("#ward-list").closest('.content');


let selectedCity = '';



// Hiển thị content cho thành phố, quận và phường khi click
function showContent(contentElement) {
    contentElement.style.display = 'block';
}

// Ẩn content cho thành phố, quận và phường khi click
function hiddenContent(contentElement) {
    contentElement.style.display = 'none';
}

// Sự kiện click vào ô nhập thành phố
cityInput.addEventListener('focus', function() {
    showContent(cityContent);
    hiddenContent(districtContent);
    hiddenContent(wardContent);
    const selectedCity = cityInput.value
    if (selectedCity && cityData[selectedCity]) {
        districtInput.removeAttribute("readonly");
        updateDistrictOptions(selectedCity);  // Cập nhật danh sách quận khi chọn thành phố
    } else {
        districtInput.setAttribute("readonly", true);
        wardInput.setAttribute("readonly", true);
        districtList.innerHTML = "";
        wardList.innerHTML = "";
    }
});

// Sự kiện click vào ô nhập quận
districtInput.addEventListener('focus', function() {
    if (cityInput.value) {
        showContent(districtContent);
        hiddenContent(cityContent);
        hiddenContent(wardContent);
        const selectedDistrict = cityInput.value
        if (selectedDistrict && cityData[selectedDistrict]) {
            districtInput.removeAttribute("readonly");
            updateDistrictOptions(selectedDistrict);  // Cập nhật danh sách quận khi chọn thành phố
        } else {
            wardInput.setAttribute("readonly", true);
            wardList.innerHTML = "";
        }   
    }
});

// Sự kiện click vào ô nhập phường
wardInput.addEventListener('focus', function() {
    if (districtInput.value) {
        showContent(wardContent);
        hiddenContent(cityContent);
        hiddenContent(districtContent);
    }
});

// Sự kiện chọn thành phố
cityOptions.forEach(option => {
    option.addEventListener("click", function() {
        cityInput.value = this.textContent;
        selectedCity = this.getAttribute("data-value");
        updateDistrictOptions(selectedCity);
        districtInput.value = "";  // Xóa quận đã chọn trước đó
        wardInput.value = "";      // Xóa phường đã chọn trước đó
        closeSelectBox();          // Đóng danh sách khi chọn thành phố
    });
});

// Cập nhật danh sách quận
function updateDistrictOptions(cityKey) {
    const districts = cityData[cityKey]?.districts;
    if (districts) {
        Object.keys(districts).forEach(district => {
            const li = document.createElement("li");
            li.textContent = district;
            li.addEventListener("click", function() {
                districtInput.value = this.textContent;
                updateWardOptions(cityKey, this.textContent);  // Cập nhật phường khi chọn quận
                wardInput.value = "";      // Xóa phường đã chọn trước đó
                closeSelectBox();          // Đóng danh sách khi chọn quận
            });
            districtList.appendChild(li);
        });
    }
    districtInput.readOnly = false;  // Cho phép người dùng chọn quận
}

// Cập nhật danh sách phường
function updateWardOptions(cityKey, districtKey) {
    wardList.innerHTML = "";  // Xóa các phường cũ
    const wards = cityData[cityKey]?.districts[districtKey];
    if (wards) {
        wards.forEach(ward => {
            const li = document.createElement("li");
            li.textContent = ward;
            li.addEventListener("click", function() {
                wardInput.value = this.textContent;
                closeSelectBox();          // Đóng danh sách khi chọn phường
            });
            wardList.appendChild(li);
        });
    }
    wardInput.readOnly = false;  // Cho phép người dùng chọn phường
}

// Đóng danh sách khi nhấp vào bất kỳ đâu ngoài các phần tử select-box
function closeSelectBox() {
    document.querySelectorAll('.select-box .content').forEach(contentElement => {
        contentElement.style.display = 'none';
    });
}

// Khi người dùng nhấp ra ngoài input và danh sách, ẩn danh sách
document.addEventListener('click', function(event) {
    if (!event.target.closest('.select-box')) {
        closeSelectBox();
    }
});

// Chặn sự kiện click vào nội dung để ngừng sự kiện lan truyền
document.querySelectorAll('.select-box .content').forEach(contentElement => {
    contentElement.addEventListener('click', function(event) {
        event.stopPropagation(); // Chặn sự kiện lan truyền để không đóng các danh sách
    });
});
// Hàm tìm kiếm trong danh sách và ẩn content nếu không có kết quả
function searchInList(input, listId) {
    const filter = input.value.toLowerCase(); // Lấy giá trị nhập vào và chuyển thành chữ thường
    const listItems = document.querySelectorAll(`#${listId} li`); // Lấy tất cả các item trong danh sách
    const noResults = document.querySelector(`#${listId} p`)
    let hasVisibleItem = false
    listItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(filter)) {
            item.style.display = "block"; // Hiển thị mục nếu tìm thấy
            hasVisibleItem = true;
        } else {
            item.style.display = "none"; // Ẩn mục nếu không tìm thấy
        }
    });
    if (hasVisibleItem) {
        noResults.style.display = "none"; // Hiển thị content nếu có kết quả
    } else {
        noResults.style.display = "block"; // Ẩn content nếu không có kết quả
    }
}



// Gọi hàm search khi người dùng nhập vào districtInput
districtInput.addEventListener('input', function() {
    searchInList(districtInput, "district-list");
    // Kiểm tra nếu người dùng đã chọn quận
    const selectedDistrict = cityInput.value.toLowerCase();
    if (selectedDistrict && cityData[selectedDistrict]) {
        districtInput.removeAttribute("readonly");
        updateDistrictOptions(selectedDistrict);  // Cập nhật danh sách quận khi chọn thành phố
    } else {
        wardInput.setAttribute("readonly", true);
        wardList.innerHTML = "";
    }
});

// Gọi hàm search khi người dùng nhập vào wardInput
wardInput.addEventListener('input', function() {
    searchInList(wardInput, "ward-list");
    
});
// Khi người dùng nhập vào thành phố, quận sẽ được kích hoạt
cityInput.addEventListener('input', function() {
    searchInList(cityInput, "city-list");
    // Kiểm tra nếu người dùng đã chọn thành phố
    const selectedCity = cityInput.value.toLowerCase();
    if (selectedCity && cityData[selectedCity]) {
        districtInput.removeAttribute("readonly");
        updateDistrictOptions(selectedCity);  // Cập nhật danh sách quận khi chọn thành phố
    } else {
        districtInput.setAttribute("readonly", true);
        wardInput.setAttribute("readonly", true);
        districtList.innerHTML = "";
        wardList.innerHTML = "";
    }
});

  
// ------change Password-----
function checkcurrentpass(event){
    event.preventDefault();
    const userLogin = JSON.parse(localStorage.getItem("userLogin")) || [];
    const users = JSON.parse(localStorage.getItem("Users")) || [];
    const userIndex = users.findIndex(u => u.username === userLogin.username);
    
    let isLengthError = checkLengthError(newPass,3,10)
    let isCfPasswodError = checkConfirmPasswordError(newPass,cfNewPass)
    if(currentPass.value.trim() === users[userIndex].password){
        showSuccess(currentPass)
        if(!isLengthError && !isCfPasswodError){
            users[userIndex].password = newPass.value;
            showAlertSuccess('Đổi mật khẩu thành công')
            localStorage.setItem("Users", JSON.stringify(users));
            localStorage.setItem("userLogin", JSON.stringify(users[userIndex])); 
            formChangePass.reset()
        }
    }else(showError(currentPass,'Mật khẩu hiện tại không đúng')) 
}
//---------forgot Passworld-------
// DOM Elements
const forgotPass = document.querySelector('.forgot-passworld-link');
const forgotPassCtn = document.querySelector('.forgotpass-container');
const searchAccForm = document.querySelector('#forgot-password-form');
const searchAccText = document.querySelector('#search-acc-ip');
const resultSearch = document.querySelector('.result-search');
const resetPasswordContainer = document.querySelector('.reset-password-container');
const newPasswordInput = document.querySelector('.new-password-ip');
const confirmPasswordInput = document.querySelector('.confirm-password-ip');
const resetPasswordBtn = document.querySelector('.reset-password-btn');
const contactPhone = document.querySelector('.contact-phone');
// Hiển thị form Forgot Password
forgotPass.addEventListener('click', () => {
    forgotPassCtn.style.transform = "scale(1)";
    document.body.classList.add('no-scroll');
    wrapper.classList.remove('active-popup'); 
    
});

// Đóng form Forgot Password
function closeForgotpass() {
    forgotPassCtn.style.transform = "scale(0)";
    Overlay.style.display = 'none';
    document.body.classList.remove('no-scroll');
    resetPasswordContainer.style.display = 'none'; // Ẩn form đặt lại mật khẩu
}
function maskPhoneNumber(phone) {
    // Thay các số đầu bằng *
    const visibleDigits = 4; // Số lượng chữ số cuối cần hiển thị
    return phone.slice(0, -visibleDigits).replace(/\d/g, '*') + phone.slice(-visibleDigits);
}
// Xử lý tìm kiếm tài khoản
searchAccForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resultSearch.innerHTML = ""; // Xóa kết quả cũ
    const searchUsername = searchAccText.value.trim();

    if (!searchUsername) {
        resultSearch.innerHTML = `
            <div class="result-item error">
                <p>Please enter your username.</p>
            </div>
        `;
        return;
    }

    // Kiểm tra tài khoản trong localStorage
    const users = JSON.parse(localStorage.getItem("Users")) || [];
    const userIndex = users.findIndex(user => user.username === searchUsername);

    if (userIndex < 0) {
        resultSearch.innerHTML = `
            <div class="result-item error">
                <p>No accounts found.</p>
            </div>
        `;
    } else {
        
        
        resultSearch.innerHTML = `
            <div class="result-item success">
                <p><strong>Account:</strong> ${users[userIndex].username}</p>
                <p><strong>Phone number:</strong> ${maskPhoneNumber(users[userIndex].phone)}</p>
                <button 
                    class="btn-reset-password" 
                    onclick="showContactPhone(${userIndex})">
                    Reset Password
                </button>
            </div>
        `;
        
    }
});
function showContactPhone(userIndex) {
    resultSearch.innerHTML = ''; // Xóa kết quả tìm kiếm
    searchAccForm.innerHTML = '';
    contactPhone.style.display = 'block'
    // Lấy mã xác nhận là 4 số cuối của số điện thoại
    const verificationCode = users[userIndex].phone.slice(-4);

    // Hiển thị thông báo mã xác nhận
    contactPhone.innerHTML = `
        <div>
            <p><strong>We have sent a confirmation code to your phone number:</strong> ${maskPhoneNumber(users[userIndex].phone)}</p>
            <p><strong>Confirmation code:</strong> </p>
            <input type="text" class="verification-code-input" placeholder="Confirmation code" />
            <button class="verify-code-btn">Confirm</button>
        </div>
    `;

    // Xử lý khi nhấn nút "Xác nhận"
    document.querySelector('.verify-code-btn').onclick = function () {
        const enteredCode = document.querySelector('.verification-code-input').value.trim();
        if (enteredCode === verificationCode) {
            showResetPasswordForm(userIndex); // Chuyển sang bước đặt lại mật khẩu
        } else {
            showAlertFailure("Confirmation code is incorrect. Please try again.");
        }
    };
}

// Hiển thị form đặt lại mật khẩu
function showResetPasswordForm(userIndex) {
    resetPasswordContainer.style.display = 'block'; // Hiển thị form
    resultSearch.innerHTML = ''; // Xóa kết quả tìm kiếm
    searchAccForm.innerHTML = '';
    contactPhone.style.display = 'none'
    resetPasswordBtn.onclick = function () {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (newPassword === confirmPassword && newPassword.length >= 3) {
            const users = JSON.parse(localStorage.getItem("Users")) || [];
            users[userIndex].password = newPassword;
            localStorage.setItem("Users", JSON.stringify(users)); 
            showAlertSuccess("Password has been reset successfully!");
            closeForgotpass();
        } else {
            showAlertFailure("Password does not match or is too short. Please try again.");
        }
    };
}
