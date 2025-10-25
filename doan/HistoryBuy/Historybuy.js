const ImgContent = document.getElementById('ImgContent');
const HomeService = document.querySelector('.home-service');
const Center = document.querySelector('#Center');
const historyBuyCtn = document.getElementById('order-history')
let productlocal = JSON.parse(localStorage.getItem('Products'))
let userlogin = JSON.parse(localStorage.getItem('userLogin'))
let CheckOut = JSON.parse(localStorage.getItem('CheckOut')) || []
let Users = JSON.parse(localStorage.getItem('Users')) || []
let userindex = Users.findIndex(u => u?.username === userlogin?.username)
let productbuy = (userindex >= 0 && Users[userindex].ProductBuy) ? Users[userindex].ProductBuy : [];  
let ID,PurchasedDate,SpecificAddress,Region,PaymentMethod


let elements = [ImgContent, HomeService, Center];


function showHistoryBuy(e) {
    e.preventDefault();
    // Always refresh latest data before rendering
    productlocal = JSON.parse(localStorage.getItem('Products'))
    userlogin = JSON.parse(localStorage.getItem('userLogin'))
    Users = JSON.parse(localStorage.getItem('Users')) || []
    userindex = Users.findIndex(u => u?.username === userlogin?.username)
    productbuy = (userindex >= 0 && Users[userindex].ProductBuy) ? Users[userindex].ProductBuy : [];
    elements.forEach(element => {
        element.style.display = 'none';
    });
    historyBuyCtn.style.display = 'block';
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    let mainAccountBody = document.querySelector('.main-account-body');
    // Xóa nội dung cũ nếu cần
    mainAccountBody.innerHTML = '';
    if(!productbuy || productbuy.length === 0){
        mainAccountBody.innerHTML=`
        <img class="img-empty" src="../image/empty.png">
        `
        return
    }

    productbuy.forEach((product, index)=> {
        let productDiv = document.createElement('div');
        productDiv.className = 'main-account-body-col';
        productDiv.id = 'ORD'+index;

        // Nội dung HTML của từng sản phẩm
        let productDivContent = `
            <div class="historybuy-list">
                <ul class="historybuy-list-ul">
                    <!-- Có thể thêm các mục sản phẩm vào đây -->
                </ul>
            </div>
            <div class='status-sumprice-products'>
                <div class="sumprice-product">
                    <p>GRAND TOTAL</p>
                    <small>${product.totalprice}$</small>
                </div>
                <div class="status-product">
                    <p class="status-historybuy ORD${index}">Status:</p>
        `;

        if (product.status === 0) {
            productDivContent += `
                <p style="background-color: #dc4949; cursor: pointer;" onclick="userCancelOrder(${index}, event)" class="user-cancel ${index}">
                    Cancel Order
                </p>
            `;
        }else if (product.status === 2) {
            productDivContent += `
            <p class="delete-historybuy ORD${index}" style="background-color: #353432;; cursor: pointer; color: white" onclick="userDeleteCancelOrder(${index}, event)">
                Delete Order
            </p>
        `;
        }

        productDivContent += `
                    <small class="detail-historybuy ORD${index}" onclick="showDetailHistoryBuy(${index})">
                        Details <i class="fa-solid fa-memo-circle-info"></i>
                    </small>
                </div>
            </div>
        `;

        productDiv.innerHTML = productDivContent;
        mainAccountBody.appendChild(productDiv);
        const statusText = document.querySelector(`.status-historybuy.ORD${index}`);
        if (product.status == 1) {
            statusText.classList.add('received'); 
            statusText.innerHTML = 'Received <i class="fa-solid fa-octagon-check"></i>';
        } else if (product.status == 0) {
            statusText.classList.add('processing');
            statusText.innerHTML = 'Processing <i class="fa-solid fa-spinner fa-spin"></i>';
        } else if(product.status == 2) {
            statusText.classList.add('canceled'); 
            statusText.innerHTML = 'Canceled <i class="fa-solid fa-ban"></i>'; 
        }else {
            statusText.classList.add('delivering'); 
            statusText.innerHTML = 'Delivering <i class="fa-solid fa-truck-clock"></i>'; 
        }
    });

    if (productbuy.length === 0) {
    } else {
        // Duyệt qua mỗi đơn hàng trong productbuy
        productbuy.forEach((productBuy, index) => {

            const historyList = document.querySelector(`#ORD${index} .historybuy-list-ul`);
            // Không cần phải xóa nội dung historyList ở đây nữa
            let cartinproduct = productBuy.cartProduct;
            // Duyệt qua các sản phẩm trong giỏ hàng của đơn hàng này
            cartinproduct.forEach(products => {
                const listItem = document.createElement('li');
                listItem.className = 'body-col';
                listItem.innerHTML = `
                    <div class="history-img">
                        <img src="${products.image}">
                    </div>
                    <div class="information-product-historybuy">
                        <h3 class="name-product">${products.name}</h3>
                        <small class="product-id">Id product: ${products.product_id}</small>
                        <small class="product-id">Type product: ${products.type}</small>
                        <small class="product-id">Color product: ${products.color}</small>
                        <small class="product-size">Size: ${products.size}</small>
                    </div>
                    <div class="number-price-of-product">
                        <small class="number-of-product"><i class="fa-regular fa-x"></i>${products.quantity}</small>
                        <small class="price-of-product">${products.price}$</small>
                    </div>
                `;
                historyList.appendChild(listItem);
            });
        });
    }

    
}

function closeHistoryBuy(){
    elements.forEach(element => {
        element.style.display = 'flex';
    });
    historyBuyCtn.style.display = 'none';
}
const detailHistoryBuyBnt = document.querySelector('.status-product>.detail-historybuy')
const detailHistoryBuyCtn = document.querySelector('#order-history .order-history-detail-container')
const detailHistoryBuyCls = document.querySelector('.order-history-detail-container .close-historybuy-detail')

const idOrderIp = document.querySelector('.id-order-ip')
const recipientNameIp = document.querySelector('.recipient-name-ip')
const recipientNumberIp = document.querySelector('.recipient-number-ip')
const phuchaseDateIp = document.querySelector('.phuchase-date-ip')
const specificAddressIp = document.querySelector('.specific-address-ip')
const regionIp = document.querySelector('.region-ip')
const paymentMethodIp = document.querySelector('.payment-method-ip')

function showDetailHistoryBuy(index){
    detailHistoryBuyCtn.style.display = 'block'
    Overlay.style.display = 'block'
    document.body.classList.add('no-scroll');
    idOrderIp.innerText = productbuy[index].orderId
    recipientNameIp.innerText = productbuy[index].fullname
    recipientNumberIp.innerText = productbuy[index].phone
    phuchaseDateIp.innerText = productbuy[index].date
    specificAddressIp.innerText = productbuy[index].addressdetail
    regionIp.innerText = productbuy[index].ward + ", " +productbuy[index].district + ", "+productbuy[index].city
    paymentMethodIp.innerText = productbuy[index].paymentMethod
    

}

detailHistoryBuyCls.addEventListener('click',() =>{
    detailHistoryBuyCtn.style.display = 'none'
    Overlay.style.display = 'none'
    document.body.classList.remove('no-scroll');
})


function userCancelOrder(index, e) {
    e.preventDefault();
    // Cập nhật trạng thái trong productbuy
    productbuy[index].status = 2;
    console.log(productbuy[index])
    userlogin.ProductBuy[index] = productbuy[index]
    console.log(userlogin)

    // Lưu lại dữ liệu
    localStorage.setItem('userLogin', JSON.stringify(userlogin));

    const checkIndex = CheckOut.findIndex(c => c.orderId == userlogin.ProductBuy[index].orderId)
    CheckOut[checkIndex]=userlogin.ProductBuy[index]
    localStorage.setItem('CheckOut', JSON.stringify(CheckOut));
    let users = JSON.parse(localStorage.getItem("Users")) || [];
    const userIndex = users.findIndex(u => u.username === userlogin.username)
    users[userIndex] = userlogin
    localStorage.setItem('Users',JSON.stringify(users))
    showAlertSuccess("Đã hủy đơn hàng");
    showHistoryBuy(e);
}

function userDeleteCancelOrder(index,e){
    e.preventDefault()
    productbuy.splice(index,1)
    console.log(productbuy)
    userlogin.ProductBuy = productbuy
    localStorage.setItem('userLogin',JSON.stringify(userlogin))
    let users = JSON.parse(localStorage.getItem("Users")) || [];
    const userIndex = users.findIndex(u => u.username === userlogin.username)
    users[userIndex] = userlogin
    localStorage.setItem('Users',JSON.stringify(users))
    showAlertSuccess("Đã xóa đơn hàng")
    showHistoryBuy(e)
}

// //---footer click
// const veChungToi = document.getElementById('vechungtoi')
// const dieuKhoan = document.getElementById('dieukhoan')
// const cacHangGiay = document.getElementById('cachanggiay')
// const lienHe = document.getElementById('lienhe')
// const tinTuc = document.getElementById('tintuc')
// const ftItemsCtn = document.getElementById('ft-items-container')

// const buttons = [veChungToi, dieuKhoan, cacHangGiay, lienHe, tinTuc];





// // Mảng các hàm xử lý cho từng nút
// const handlers = [
//     showVeChungToi,
//     showDieuKhoan,
//     showCacLoaiGiay,
//     showLienHe,
//     showTinTuc,
// ];

// // Gắn sự kiện click cho mỗi nút
// buttons.forEach((button, index) => {
//     button.addEventListener('click', () => {
//         // Ẩn tất cả các phần tử
//         elements.forEach(element => {
//             element.style.display = 'none';
//         });
//         // Gọi hàm tương ứng với nút bấm
//         ftItemsCtn.style.display = 'block'
//         handlers[index]();
//     });
// });

    
// function showVeChungToi() {
//     ftItemsCtn.innerHTML=`
//         <div id="about-us">
//             <h2>Về Chúng Tôi</h2>
//             <p>
//                 <strong>The Nike Store</strong> được thành lập vào năm 2010, với mục tiêu mang đến cho khách hàng những đôi giày
//                 thời trang, chất lượng và giá cả hợp lý. Chúng tôi luôn tin rằng một đôi giày tốt không chỉ nâng niu bước chân của bạn
//                 mà còn là cách bạn thể hiện phong cách và cá tính của mình.
//             </p>
//             <h3>Lịch Sử Hình Thành</h3>
//             <p>
//                 Bắt đầu từ một cửa hàng nhỏ tại trung tâm TP.HCM, <strong>XYZ</strong> đã phát triển thành một chuỗi cửa hàng giày lớn
//                 với hơn 20 chi nhánh trên toàn quốc. Chúng tôi không ngừng mở rộng và nâng cao chất lượng sản phẩm để đáp ứng nhu cầu
//                 ngày càng cao của khách hàng. Từ những ngày đầu tiên, chúng tôi luôn giữ vững tôn chỉ: "Chất lượng là ưu tiên hàng đầu".
//             </p>
//             <h3>Tầm Nhìn và Sứ Mệnh</h3>
//             <ul>
//                 <li><strong>Tầm Nhìn:</strong> Trở thành thương hiệu giày hàng đầu tại Việt Nam và vươn tầm ra thị trường quốc tế.</li>
//                 <li><strong>Sứ Mệnh:</strong> Đem đến trải nghiệm mua sắm tốt nhất cho khách hàng với sản phẩm chất lượng cao, giá cả cạnh tranh và dịch vụ chuyên nghiệp.</li>
//             </ul>
//             <h3>Giá Trị Cốt Lõi</h3>
//             <ol>
//                 <li><strong>Chất lượng:</strong> Mỗi sản phẩm đều được kiểm tra kỹ lưỡng trước khi đến tay khách hàng.</li>
//                 <li><strong>Thời trang:</strong> Cập nhật các xu hướng mới nhất để bạn luôn tự tin sải bước.</li>
//                 <li><strong>Khách hàng là trung tâm:</strong> Chúng tôi luôn lắng nghe và phục vụ khách hàng bằng cả trái tim.</li>
//             </ol>
//             <h3>Nhận Diện Thương Hiệu</h3>
//             <p>
//                 Biểu tượng của chúng tôi là hình ảnh đôi cánh, tượng trưng cho sự tự do và bay cao. Logo <strong>XYZ</strong> đại diện
//                 cho sự gắn kết giữa thời trang và chất lượng. Màu sắc chủ đạo của chúng tôi là xanh lam và trắng – thể hiện sự tin cậy
//                 và chuyên nghiệp.
//             </p>
//             <h3>Thông Tin Liên Hệ</h3>
//             <ul>
//                 <li><strong>Địa chỉ:</strong> 273 An Dương Vương, Phường 3, Quận 5, TP Hồ Chí Minh</li>
//                 <li><strong>Giờ mở cửa:</strong> 9:00 - 21:00 (Thứ 2 - Chủ Nhật)</li>
//                 <li><strong>Hotline:</strong> 0123 456 789 || 0768 123 227</li>
//                 <li><strong>Email:</strong> abc@domain.com || TheNikestore@domain.com</li>
//                 <li><strong>Website:</strong> <a href="HomePage.html" target="_blank">www.thenikestore.com</a></li>
//             </ul>
//             <h3>Chúng Tôi Cam Kết</h3>
//             <p>
//                 Tại <strong>Cửa Hàng Giày XYZ</strong>, bạn không chỉ mua được giày mà còn nhận được sự tận tâm, chuyên nghiệp từ đội
//                 ngũ nhân viên của chúng tôi. Hãy để chúng tôi đồng hành cùng bạn trên từng bước đường thành công!
//             </p>
//         </div>


//     `
// }
// function showDieuKhoan(){
//     ftItemsCtn.innerHTML=`
//         <div id="about-us">
//             <h2>Điều Khoản Sử Dụng</h2>
//             <p>
//                 Chào mừng quý khách đến với Cửa Hàng Giày XYZ! Khi truy cập, mua sắm hoặc sử dụng dịch vụ tại cửa hàng chúng tôi, 
//                 quý khách đồng ý với các điều khoản sử dụng sau. Xin vui lòng đọc kỹ để đảm bảo quyền lợi và nghĩa vụ của cả hai bên.
//             </p>
//             <h3>1. Quyền Sở Hữu Trí Tuệ</h3>
//             <p>
//                 Tất cả nội dung trên website, bao gồm nhưng không giới hạn ở hình ảnh, văn bản, logo, thiết kế, video, và phần mềm 
//                 đều thuộc sở hữu của Cửa Hàng Giày XYZ hoặc các đối tác liên kết. Quý khách không được sao chép, sử dụng hoặc phân 
//                 phối nội dung này cho mục đích thương mại khi chưa được sự đồng ý bằng văn bản từ chúng tôi.
//             </p>
//             <h3>2. Điều Kiện Mua Hàng</h3>
//             <p>
//                 Sản phẩm tại cửa hàng hoặc website có thể thay đổi giá cả, mẫu mã mà không cần báo trước. Tất cả các giao dịch mua 
//                 hàng đều phải tuân thủ theo chính sách vận chuyển, đổi trả và bảo hành hiện hành.
//             </p>
//             <h3>3. Chính Sách Đổi Trả</h3>
//             <p>
//                 Quý khách có thể đổi/trả sản phẩm trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng nếu sản phẩm còn nguyên tem, 
//                 chưa qua sử dụng và đầy đủ hóa đơn. Các sản phẩm đã qua sử dụng, bị hư hại do lỗi của khách hàng hoặc không còn 
//                 nguyên vẹn sẽ không đủ điều kiện đổi trả.
//             </p>
//             <h3>4. Chính Sách Bảo Mật Thông Tin</h3>
//             <p>
//                 Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng. Dữ liệu của quý khách chỉ được sử dụng cho mục đích giao 
//                 dịch và cải thiện dịch vụ. Mọi thông tin cá nhân sẽ không được tiết lộ cho bên thứ ba nếu không có sự đồng ý của 
//                 quý khách, trừ khi có yêu cầu từ cơ quan pháp luật.
//             </p>
//             <h3>5. Nghĩa Vụ của Khách Hàng</h3>
//             <p>
//                 - Cung cấp thông tin chính xác khi mua sắm và liên lạc.<br>
//                 - Không sử dụng dịch vụ để thực hiện hành vi vi phạm pháp luật hoặc gây ảnh hưởng xấu đến cửa hàng và các khách hàng khác.
//             </p>
//             <h3>6. Giới Hạn Trách Nhiệm</h3>
//             <p>
//                 Cửa Hàng Giày XYZ không chịu trách nhiệm đối với các thiệt hại gián tiếp, ngẫu nhiên hoặc phát sinh từ việc sử dụng 
//                 sản phẩm hoặc dịch vụ của chúng tôi, trừ khi các thiệt hại đó do lỗi trực tiếp từ chúng tôi gây ra.
//             </p>
//             <h3>7. Thay Đổi Điều Khoản</h3>
//             <p>
//                 Chúng tôi có quyền thay đổi, cập nhật hoặc sửa đổi các điều khoản sử dụng này bất cứ lúc nào. Mọi thay đổi sẽ được 
//                 thông báo trên website chính thức của chúng tôi. Quý khách có trách nhiệm kiểm tra định kỳ để đảm bảo tuân thủ các 
//                 thay đổi mới nhất.
//             </p>
//         </div>
//     `
// }
// function showCacLoaiGiay(){
//     ftItemsCtn.innerHTML = `
//         <div id="about-us">
//             <h2>Phân Tích Các Loại Giày</h2>
//             <h3>Giày Bóng Rổ (Basketball)</h3>
//             <p>Giày bóng rổ được thiết kế để hỗ trợ tối đa trong các động tác nhảy, xoay người và chạy nhanh trên sân. Chúng thường có đế chống trượt, đệm tốt để giảm chấn động khi nhảy và phần cổ cao giúp bảo vệ mắt cá chân.</p>
//             <p><strong>Đặc điểm nổi bật:</strong></p>
//             <ul>
//                 <li>Cổ giày cao hoặc trung bình để hỗ trợ mắt cá chân.</li>
//                 <li>Đế giày chắc chắn, độ bám tốt để chống trơn trượt.</li>
//                 <li>Hệ thống đệm giảm chấn để bảo vệ bàn chân khi nhảy.</li>
//             </ul>
        
//             <h3>Giày Bóng Đá (Football)</h3>
//             <p>Giày bóng đá được thiết kế chuyên dụng với đinh tán dưới đế để tạo độ bám tốt trên sân cỏ tự nhiên hoặc sân cỏ nhân tạo. Chất liệu nhẹ giúp tăng tốc độ và khả năng kiểm soát bóng tốt hơn.</p>
//             <p><strong>Đặc điểm nổi bật:</strong></p>
//             <ul>
//                 <li>Đinh giày (studs) giúp tạo độ bám trên các loại mặt sân khác nhau.</li>
//                 <li>Chất liệu da hoặc tổng hợp bền, nhẹ.</li>
//                 <li>Thiết kế ôm sát bàn chân, hỗ trợ kiểm soát bóng.</li>
//             </ul>
        
//             <h3>Giày Chạy Bộ (Running)</h3>
//             <p>Giày chạy bộ tập trung vào sự thoải mái và hỗ trợ bàn chân khi vận động liên tục. Đế giày thường có lớp đệm tốt để giảm chấn động và bảo vệ khớp gối.</p>
//             <p><strong>Đặc điểm nổi bật:</strong></p>
//             <ul>
//                 <li>Trọng lượng nhẹ giúp tiết kiệm sức lực khi chạy.</li>
//                 <li>Đệm êm ái giúp giảm áp lực lên bàn chân và khớp gối.</li>
//                 <li>Đế giày có độ đàn hồi và hỗ trợ lực đẩy tốt.</li>
//             </ul>
        
//             <h3>Giày Tập Gym (Gym)</h3>
//             <p>Giày tập gym thường được thiết kế để hỗ trợ nhiều loại bài tập khác nhau, từ nâng tạ đến các bài cardio. Chúng cần có độ bám tốt và cấu trúc ổn định để giảm nguy cơ chấn thương.</p>
//             <p><strong>Đặc điểm nổi bật:</strong></p>
//             <ul>
//                 <li>Đế giày phẳng, ổn định để hỗ trợ nâng tạ.</li>
//                 <li>Chất liệu thoáng khí, giúp giữ chân khô thoáng.</li>
//                 <li>Thiết kế đa năng, phù hợp với nhiều bài tập.</li>
//             </ul>
        
//             <h3>Giày Trượt Ván (Skateboarding)</h3>
//             <p>Giày trượt ván thường có đế phẳng để tăng diện tích tiếp xúc với ván trượt, giúp thực hiện các động tác kỹ thuật chính xác hơn. Chúng cũng được gia cố ở mũi và thân giày để chịu mài mòn.</p>
//             <p><strong>Đặc điểm nổi bật:</strong></p>
//             <ul>
//                 <li>Đế giày phẳng, tăng diện tích tiếp xúc với ván.</li>
//                 <li>Chất liệu bền bỉ, chịu mài mòn tốt.</li>
//                 <li>Thiết kế ôm chân, hỗ trợ cảm giác và kiểm soát ván tốt.</li>
//             </ul>
//         </div>
//     `
// }
// function showLienHe (){
//     ftItemsCtn.innerHTML = `
//     <div id="about-us">
//         <h2>Liên Hệ Với Chúng Tôi</h2>
//         <h3>Địa Chỉ Cửa Hàng</h3>
//         <p>Cửa hàng Giày XYZ nằm tại trung tâm thành phố, thuận tiện cho việc đi lại và mua sắm.</p>
//         <p><strong>Thông tin chi tiết:</strong></p>
//         <ul>
//             <li><strong>Địa chỉ:</strong> 123 Đường Thời Trang, Quận 1, TP.HCM</li>
//             <li><strong>Giờ mở cửa:</strong> 9:00 - 21:00 (Thứ 2 - Chủ Nhật)</li>
//             <li><strong>Số điện thoại:</strong> 0909 123 456</li>
//             <li><strong>Email:</strong> contact@giayxyz.com</li>
//         </ul>

//         <h3>Gửi Thông Tin Liên Hệ</h3>
//         <p>Hãy để lại thông tin của bạn, chúng tôi sẽ liên hệ lại sớm nhất!</p>
//         <form action="#" method="POST">
//             <div class="form-group">
//                 <label for="name">Họ và Tên:</label>
//                 <input type="text" id="name" name="name" placeholder="Nhập họ và tên của bạn" required>
//             </div>
//             <div class="form-group">
//                 <label for="email">Email:</label>
//                 <input type="email" id="email" name="email" placeholder="Nhập email của bạn" required>
//             </div>
//             <div class="form-group">
//                 <label for="message">Lời Nhắn:</label>
//                 <textarea id="message" name="message" rows="5" placeholder="Nhập lời nhắn của bạn" required></textarea>
//             </div>
//             <button type="submit" class="btn-submit">Gửi Liên Hệ</button>
//         </form>
//     </div>

//     `
// }
// function showTinTuc(){
//     ftItemsCtn.innerHTML = `
//         <div id="about-us>
//             <h2>Quản lý đơn hàng của bạn</h2>
//             <p>Xem chi tiết, trạng thái của những đơn hàng đã đặt.</p>
//         </div>
    
//     `
// }