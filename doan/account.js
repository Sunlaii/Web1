// === NGUYỄN ĐĂNG THỤY - Phần tài khoản ===

// Hàm lấy danh sách tài khoản
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

// Hàm lưu danh sách tài khoản
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Xử lý đăng ký
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {
      alert("Mật khẩu không khớp!");
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      alert("Email đã tồn tại!");
      return;
    }

    users.push({ fullname, email, password, role: "user" });
    saveUsers(users);
    alert("Đăng ký thành công!");
    window.location.href = "login.html";
  });
}

// Xử lý đăng nhập
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      alert("Sai thông tin đăng nhập!");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));

    // Nếu là admin → vào trang admin
    if (user.role === "admin") {
      window.location.href = "Admin/Admin.html";
    } else {
      window.location.href = "profile.html";
    }
  });
}

// Xử lý hiển thị profile
const profileDiv = document.getElementById("profileInfo");
if (profileDiv) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "login.html";
  } else {
    profileDiv.innerHTML = `
      <p><strong>Họ tên:</strong> ${user.fullname}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });

  document.getElementById("editBtn").addEventListener("click", () => {
    const newName = prompt("Nhập họ tên mới:", user.fullname);
    if (newName && newName.trim() !== "") {
      user.fullname = newName.trim();
      localStorage.setItem("currentUser", JSON.stringify(user));

      const users = getUsers();
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx !== -1) users[idx] = user;
      saveUsers(users);
      alert("Cập nhật thành công!");
      window.location.reload();
    }
  });
}

