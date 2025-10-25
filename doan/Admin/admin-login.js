document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Đây là nơi bạn sẽ kiểm tra thông tin đăng nhập.
    // Ví dụ đơn giản:
    if (username === 'admin' && password === 'password') {
        // Đăng nhập thành công, chuyển hướng đến trang admin.html
        window.location.href = 'Admin.html';
    } else {
        // Đăng nhập thất bại, hiển thị thông báo lỗi
        errorMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.';
    }
});
