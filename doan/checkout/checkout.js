    let listcarts = JSON.parse(localStorage.getItem('cart'));
    let closeButton = document.querySelector('.close1');
    let body = document.querySelector('body');
    let paymentSelect = document.querySelector('#payment')
    let closeButton1 = document.querySelector('.close2')
    let nameincard = document.querySelector("#cardname")
    let cardnumber = document.querySelector("#number")
    let exp = document.querySelector("#exp")
    let cvv = document.querySelector("#cvv")
    let checkoutbtn = document.querySelector(".checkout-btn") 
    let namecheckout = document.querySelector("#name")
    let phone = document.querySelector("#phone")
    let address = document.querySelector("#address-detail")
    let city = document.querySelector("#city")
    let proceed = document.querySelector('.submit-btn')
    let boxaddressacount = document.querySelector('#addressaccount')
    let boxaddressnew = document.querySelector('#addressaddress')
    let districtInput = document.querySelector('#diachi-quan')
    let wardInput= document.querySelector('#diachi-phuong')
    let districtList = document.querySelector('#district-list')
    let wardList = document.querySelector('#ward-list')
    let closeForm = document.querySelector('.close')
    let confirmButton = document.querySelector('.confirm-btn')
    let totalq =0 ;
    let totalp = 0;
    const districtContent = document.querySelector("#district-list").closest('.content');
    const wardContent = document.querySelector("#ward-list").closest('.content');

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

    closeButton1.addEventListener('click',()=>{
        body.classList.remove('showcard');
    })

    closeForm.addEventListener('click',()=>{
        body.classList.remove('showoverlay')
        body.classList.remove('showform')

    })

    confirmButton.addEventListener('click',()=>{
        let selectedIndex = city.selectedIndex;
        let productlocal = JSON.parse(localStorage.getItem('Products'))
        let users = JSON.parse(localStorage.getItem('Users'))
        let userlogin = JSON.parse(localStorage.getItem('userLogin'))
        const Checkoutt=JSON.parse(localStorage.getItem('CheckOut'))||[]
        let productbuy = userlogin.ProductBuy || []
        let cart = userlogin.Cart
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        if(cart.length>0) {
            if(boxaddressnew.checked){
                productbuy.push({
                    orderId : Checkoutt.length,
                    fullname: namecheckout.value,
                    phone: phone.value,
                    paymentMethod: paymentSelect.value,
                    cartProduct: cart,
                    date: formattedDate,
                    addressdetail : address.value,
                    city : city.options[selectedIndex].textContent,    
                    district: districtInput.value,
                    ward: wardInput.value,
                    totalprice : totalp,
                    totalquantity : totalq,
                    status : 0 ,
                    nameincard : nameincard.value,
                    cardnumber : cardnumber.value,
                    userId: userlogin.userId

                })
            }else if(boxaddressacount.checked){
            let addressAccount = userlogin.address;
                productbuy.push({
                    orderId : Checkoutt.length,
                    fullname: namecheckout.value,
                    phone: phone.value,
                    paymentMethod: paymentSelect.value,
                    cartProduct: cart,
                    date: formattedDate,
                    addressdetail : addressAccount.detail,
                    city : addressAccount.city,
                    district: addressAccount.district,
                    ward: addressAccount.ward,
                    totalprice : totalp,
                    totalquantity : totalq,
                    status : 0 ,
                    nameincard : nameincard.value,
                    cardnumber : cardnumber.value,
                    userId: userlogin.userId
                })
            } 

        }

        users = users.map(user => user.userId === userlogin.userId ? {...user, ProductBuy: productbuy,Cart:[]} : user);
        userlogin.ProductBuy = productbuy
        userlogin.Cart = []
        addcarttohtml();
        const temp = productbuy.find(p => p.orderId === Checkoutt.length)
        Checkoutt.push(temp)
        localStorage.setItem('CheckOut',JSON.stringify(Checkoutt))
        localStorage.setItem('userLogin', JSON.stringify(userlogin));
        localStorage.setItem('Users', JSON.stringify(users));
        showAlertSuccess("Đặt hàng thành công! Đang về trsng chính ");
        setTimeout(() => {
            window.location.href='../HomePage.html';
        }, 2000);

    })






    checkoutbtn.addEventListener('click',(event)=>{
        if(paymentSelect.value === "Credit Card"){
            if (nameincard.value === "") {
                showAlertFailure("Vui lòng điền đầy đủ thông tin credit card!");
                body.classList.add('showcard')
                return; // Dừng lại nếu thông tin thẻ không đầy đủ
            } else if (cardnumber.value === "") {
                showAlertFailure("Vui lòng điền đầy đủ thông tin credit card!");
                body.classList.add('showcard')
                return; // Dừng lại nếu thông tin thẻ không đầy đủ
            } else if (exp.value === "") {
                showAlertFailure("Vui lòng điền đầy đủ thông tin credit card!");
                body.classList.add('showcard')
                return; // Dừng lại nếu thông tin thẻ không đầy đủ
            } else if (cvv.value === "") {
                showAlertFailure("Vui lòng điền đầy đủ thông tin credit card!");
                body.classList.add('showcard')
                return; // Dừng lại nếu thông tin thẻ không đầy đủ
            }
        }
        
        if (namecheckout.value === "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            namecheckout.focus();
        } else if (phone.value === "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            phone.focus();
        }else if (!/^0\d{9}$/.test(phone.value)) { 
            showAlertFailure("Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số!");
            phone.focus();
        } else if (address.value === "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            address.focus();
        } else if (paymentSelect.value=== ""){
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            paymentSelect.focus();
        } else if (city.value=== "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            city.focus();
        } else if(districtInput.value===""){
            showAlertFailure("Vui lòng điền đầy đủ thông tin! ")
            districtInput.focus();  
        }else if(wardInput.value===""){
            showAlertFailure("Vui lòng điền đầy đủ thông tin! ")
            wardInput.focus();
        }else if(city.value===""){
            showAlertFailure("Vui lòng điền đầy đủ thông tin! ")
            city.focus();
        } else {
            event.preventDefault()
            adddatatoconfirm()
            body.classList.add('showoverlay')
            body.classList.add('showform')
            
        } 
    })

    proceed.addEventListener('click', (event) => {
    
        // Kiểm tra các trường hợp chưa điền đầy đủ thông tin
        if (nameincard.value === "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            nameincard.focus();
        } else if (cardnumber.value === "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            cardnumber.focus();
        } else if (!/^(\d{4}-){3}\d{4}$/.test(cardnumber.value)) {
            showAlertFailure("Nhập đúng định dạng thẻ:1111-2222-3333-4444");
            cardnumber.focus();
        } else if (exp.value === "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
            exp.focus();
        } else if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(exp.value)) {
            showAlertFailure("Nhập đúng định dạng MM/YYYY");
            exp.focus();
        } else if (cvv.value === "") {
            showAlertFailure("Vui lòng điền đầy đủ thông tin!");
        } else if (cvv.value.length !== 4 || isNaN(cvv.value)) {
            showAlertFailure("Vui lòng nhập đúng 4 chữ số cho CVV!");
        } else {
            showAlertSuccess("Thanh toán thành công!");
            event.preventDefault();
            body.classList.remove('showcard');
        }
    });
    


    paymentSelect.addEventListener('change',()=>{
        if(paymentSelect.value==='Credit Card'){
            body.classList.add('showcard')
        }
    })

    function addcarttohtml(){
        let productlocal = JSON.parse(localStorage.getItem('Products'));
        let userlogin = JSON.parse(localStorage.getItem('userLogin'));
        let cart = userlogin.Cart;
        console.log(userlogin)
        console.log(productlocal)
        let listcart= document.querySelector('.returncart .list');
        listcart.innerHTML='';
        let totalquantity = document.querySelector('.totalquantity');
        let totalprice = document.querySelector('.totalprice');
 

        if (cart.length>0){
            cart.forEach(cart =>{
                let newp = document.createElement('div');
                newp.classList.add('item');
                totalq = totalq+cart.quantity;
                totalp = totalp + cart.price;
                newp.innerHTML=`
                            <div class="image">
                                <img src="${cart.image}">
                            </div>
                            <div class="name">${cart.name}</div>
                             <div class="size">Size ${cart.size}</div>
                            <div class="quantity">${cart.quantity}</div>   
                            <div class="price">${cart.price}$</div>
                            `
                            listcart.appendChild(newp);
            })
        }
        totalprice.innerText=totalp+'$';
        totalquantity.innerText=totalq;
    }       
    addcarttohtml();

    function adddatatoconfirm(){
        let totalspan = document.querySelector('.product-total')
        let namespan = document.querySelector('.nameform')
        let addressspan = document.querySelector('.addressform')
        let phonespan = document.querySelector('.phoneform')
        let paymentspan = document.querySelector('.paymentform')
        let namecard = document.querySelector('.namecard')
        let numbercard = document.querySelector('.numbercard')
        let productlocal = JSON.parse(localStorage.getItem('Products'));
        let userlogin = JSON.parse(localStorage.getItem('userLogin'));
        let cart = userlogin.Cart;
        let totalprice = 0 ;
        console.log(userlogin)
        console.log(productlocal)
        let listform = document.querySelector('.product-item');
        listform.innerHTML=''
        if(cart.length>0){
            cart.forEach(cart=>{
                totalprice = totalprice + cart.price
                let newp = document.createElement('div');
                newp.classList.add('itemform');
                newp.innerHTML=`
                    <div class="itemform">
                    <span class="product-image">
                        <img src="${cart.image}" >
                    </span>
                    <span class="product-name">${cart.name}</span>
                    <span class="product-size">Size: ${cart.size}</span>
                    <span class="product-quantity">Quantity: ${cart.quantity}</span>
                    <span class="product-price">Price: ${cart.price}</span>
                    </div>               
                
                `
                listform.appendChild(newp);
            })
        }
        console.log(namecheckout.value);  // Kiểm tra giá trị của namecheckout
        let selectedIndex = city.selectedIndex;
        namespan.innerHTML=`<strong>Full Name:  </strong>${namecheckout.value}`
        phonespan.innerHTML=`<strong>Phone Number:  </strong>${phone.value}`
        addressspan.innerHTML=`<strong>Address:  </strong>${address.value},${wardInput.value},${districtInput.value} ,${city.options[selectedIndex].textContent}`   
        paymentspan.innerHTML=`<strong>Payment Method:  </strong>${paymentSelect.value}`
        if(paymentSelect.value === "Credit Card"){
            namecard.innerHTML = `<strong>Name Card: </strong>${nameincard.value}`
            numbercard.innerHTML = `<strong>Number Card: </strong>${cardnumber.value}`

        }
        totalspan.innerText='Tổng tiền: '+totalp+'$'


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
                "Quận 12": ["An Phú Đông", "Đông Hưng Thuận", "Hiệp Thành", "Tân Chánh Hiệp", "Tân Hưng Thuận"],
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

    city.addEventListener('change', function() {

        const selectedCity = city.value
        if (selectedCity && cityData[selectedCity]) {
            districtInput.removeAttribute("readonly");
            districtInput.value = "";
            wardInput.value="";
            districtList.innerHTML = "";
            wardList.innerHTML = "";
            updateDistrictOptions(selectedCity);  
        } else {
            districtInput.setAttribute("readonly", true);
            wardInput.setAttribute("readonly", true);
            districtList.innerHTML = "";
            wardList.innerHTML = "";
        }
    });



    // Sự kiện click vào ô nhập quận
    districtInput.addEventListener('focus', function() {
        if (city.value) {
            const selectedDistrict = city.value
            if (selectedDistrict && cityData[selectedDistrict] && !districtInput.readOnly) {
                
                districtContent.style.display="block"
                wardContent.style.display="none"
            } else {
                wardInput.setAttribute("readonly", true);
                wardList.innerHTML = "";
            }   
        }
    });


    wardInput.addEventListener('focus', function() {
        if (districtInput.value && !districtInput.readOnly) {
            
            wardContent.style.display="block"
            districtContent.style.display="none"
        }
    });

    // Cập nhật danh sách quận
    function updateDistrictOptions() {
        const districts = cityData[cityKey]?.districts;
        if (districts) {
            Object.keys(districts).forEach(district => {
                const li = document.createElement("li");
                li.textContent = district;
                li.addEventListener("click", function() {
                    districtInput.value = this.textContent;
                    updateWardOptions(cityKey, this.textContent);  // Cập nhật phường khi chọn quận
                    wardInput.value = "";      // Xóa phường đã chọn trước đó
                    districtContent.style.display="none";
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
                    wardContent.style.display="none"
                });
                wardList.appendChild(li);
            });
        }
        wardInput.readOnly = false;  // Cho phép người dùng chọn phường
    }

    const addressaccount = () => {
        let click = document.querySelector('#addressaccount')
        let clicked1 = document.querySelector('#addressaddress')
        if(clicked1.checked) {
            city.removeAttribute("disabled"); 
            address.removeAttribute("readonly") 
        }else if(click.checked){
            city.setAttribute("disabled","true")
            districtInput.setAttribute("readonly",true)
            wardInput.setAttribute("readonly","true")
            address.setAttribute("readonly", true);
        }
    }

// dùng để hiện thị sẵn địa chỉ có sẵn trong tài khoản 

    if (boxaddressacount.checked) {
        let userlogin = JSON.parse(localStorage.getItem('userLogin'));
        let addressAccount = userlogin.address;
    
        
        const cityMapping = {
            'Hà Nội': 'hanoi',
            'Hồ Chí Minh': 'hochiminh',
            'Đà Nẵng': 'danang'
        };
        const cityValue = cityMapping[addressAccount.city];
        city.value = cityValue || ''; 
        districtInput.value = addressAccount.district || '';
        wardInput.value = addressAccount.ward || '';
        address.value = addressAccount.detail || '';
    }
// end

// kiểm tra khi có thay đổi thì sẽ xóa value trước đó 

    boxaddressacount.addEventListener('change',()=>{
    if (boxaddressacount.checked) {
        let userlogin = JSON.parse(localStorage.getItem('userLogin'));
        let addressAccount = userlogin.address;
    
      
        const cityMapping = {
            'Hà Nội': 'hanoi',
            'Hồ Chí Minh': 'hochiminh',
            'Đà Nẵng': 'danang'
        };
        const cityValue = cityMapping[addressAccount.city];
        city.value = cityValue || ''; 
        districtInput.value = addressAccount.district || '';
        wardInput.value = addressAccount.ward || '';
        address.value = addressAccount.detail || '';
    }
})

    boxaddressnew.addEventListener('change',()=>{
        if (boxaddressnew.checked) {
            city.value = "";
            districtInput.value = "";
            wardInput.value = "";
            address.value = "";
        }
    });
    