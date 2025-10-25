(() => {
  const root = document.getElementById('orders-root');
  const ORDERS_PER_PAGE = 5;
  let currentPage = 1;

  function getData() {
    const userLogin = JSON.parse(localStorage.getItem('userLogin') || 'null');
    const users = JSON.parse(localStorage.getItem('Users') || '[]');
    if (!userLogin) return { user: null, orders: [] };
    const idx = users.findIndex(u => u?.username === userLogin?.username);
    const orders = idx >= 0 && users[idx].ProductBuy ? users[idx].ProductBuy : [];
    return { user: userLogin, orders };
  }

  function renderPagination(total, onPageChange) {
    const totalPages = Math.max(1, Math.ceil(total / ORDERS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    const pager = document.createElement('div');
    pager.style.display = 'flex';
    pager.style.gap = '8px';
    pager.style.justifyContent = 'center';
    pager.style.marginTop = '16px';

    const makeBtn = (label, page, disabled = false, active = false) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.padding = '6px 10px';
      b.style.borderRadius = '8px';
      b.style.border = '1px solid rgba(0,0,0,0.1)';
      b.style.cursor = disabled ? 'not-allowed' : 'pointer';
      b.style.background = active ? 'linear-gradient(90deg, var(--theme-color-1), var(--theme-color-2))' : '#fff';
      b.style.color = active ? '#fff' : '#333';
      b.disabled = disabled;
      if (!disabled) b.addEventListener('click', () => { currentPage = page; onPageChange(); });
      return b;
    };

    pager.appendChild(makeBtn('Prev', Math.max(1, currentPage - 1), currentPage === 1));
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);
    if (start > 1) pager.appendChild(makeBtn('1', 1, false, currentPage === 1));
    if (start > 2) pager.appendChild(makeBtn('...', currentPage, true));
    for (let p = start; p <= end; p++) pager.appendChild(makeBtn(String(p), p, false, currentPage === p));
    if (end < totalPages - 1) pager.appendChild(makeBtn('...', currentPage, true));
    if (end < totalPages) pager.appendChild(makeBtn(String(totalPages), totalPages, false, currentPage === totalPages));
    pager.appendChild(makeBtn('Next', Math.min(totalPages, currentPage + 1), currentPage === totalPages));
    return pager;
  }

  function render() {
    const { user, orders } = getData();
    if (!user) {
      root.innerHTML = `
        <div style="text-align:center; margin:40px 0">
          <p>Please login to view your orders.</p>
          <a href="HomePage.html">Back to Home</a>
        </div>`;
      return;
    }
    if (!orders || orders.length === 0) {
      root.innerHTML = `
        <div style="text-align:center; margin:40px 0">
          <img src="image/empty.png" alt="No orders" style="max-width:280px; opacity:.9" />
          <p style="margin-top:12px; color:#666">You have no orders yet.</p>
        </div>`;
      return;
    }

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gridTemplateColumns = '1fr';
    list.style.gap = '16px';

    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const pageOrders = orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

    pageOrders.forEach((order, localIndex) => {
      const index = startIndex + localIndex;
      const card = document.createElement('div');
      card.style.border = '1px solid rgba(0,0,0,0.08)';
      card.style.borderRadius = '12px';
      card.style.background = 'rgba(255,255,255,0.9)';
      card.style.backdropFilter = 'blur(10px)';
      card.style.padding = '16px';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px">
          <div>
            <div style="font-weight:600">Order #${String(order.orderId).padStart(6,'0')}</div>
            <div style="color:#666; font-size:14px">${order.date}</div>
            <div style="color:#666; font-size:14px">${order.paymentMethod}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:600">Total: ${order.totalprice}$</div>
            <div style="color:#666; font-size:14px">Items: ${order.totalquantity}</div>
          </div>
        </div>
        <div style="margin-top:12px; display:flex; flex-wrap:wrap; gap:10px" class="items"></div>
        <div style="margin-top:12px; display:flex; gap:10px; justify-content:flex-end">
          <button class="btn-print" style="padding:8px 12px; border:none; border-radius:8px; background: linear-gradient(90deg, var(--theme-color-1), var(--theme-color-2)); color:#fff; cursor:pointer">Print</button>
        </div>
      `;

      const itemsCtn = card.querySelector('.items');
      (order.cartProduct || []).forEach(p => {
        const pill = document.createElement('div');
        pill.style.display = 'flex';
        pill.style.alignItems = 'center';
        pill.style.gap = '8px';
        pill.style.border = '1px solid rgba(0,0,0,0.06)';
        pill.style.borderRadius = '10px';
        pill.style.padding = '6px 10px';
        pill.innerHTML = `
          <img src="${p.image}" alt="${p.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px" />
          <div style="display:flex; flex-direction:column">
            <span style="font-weight:600">${p.name}</span>
            <span style="color:#666; font-size:12px">Size ${p.size} · ${p.quantity} × ${p.price}$</span>
          </div>
        `;
        itemsCtn.appendChild(pill);
      });

      card.querySelector('.btn-print').addEventListener('click', () => {
        window.print();
      });

      list.appendChild(card);
    });

    root.innerHTML = '';
    root.appendChild(list);
    root.appendChild(renderPagination(orders.length, render));
  }

  document.addEventListener('DOMContentLoaded', render);
})();


