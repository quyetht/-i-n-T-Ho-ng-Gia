let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentCategory = "Tất cả";

const fmt = (n) => n.toLocaleString("vi-VN");
const $ = (id) => document.getElementById(id);

// Đưa thông tin cấu hình lên trang
$("shop-name").textContent = CONFIG.shopName;
$("year").textContent = new Date().getFullYear();
$("zalo-link").textContent = CONFIG.zaloPhone;
$("zalo-link").href = `https://zalo.me/${CONFIG.zaloPhone}`;
$("mail-link").textContent = CONFIG.email;
$("mail-link").href = `mailto:${CONFIG.email}`;

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartCount();
}

function renderCartCount() {
  $("cart-count").textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function renderFilters() {
  $("filters").innerHTML = CATEGORIES.map(c => `
    <button class="chip ${c === currentCategory ? "active" : ""}"
            onclick="setCategory('${c}')">${c}</button>
  `).join("");
}

function setCategory(c) {
  currentCategory = c;
  renderFilters();
  renderProducts();
}

function renderProducts() {
  const items = currentCategory === "Tất cả"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === currentCategory);

  $("product-list").innerHTML = items.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="card-body">
        <span class="tag">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="card-foot">
          <span class="price">${fmt(p.price)} đ</span>
          ${p.inStock
            ? `<button class="btn primary small" onclick="addToCart(${p.id})">Thêm</button>`
            : `<span class="out">Hết hàng</span>`}
        </div>
      </div>
    </article>
  `).join("") || "<p>Chưa có sản phẩm trong mục này.</p>";
}

function renderNews() {
  $("news-list").innerHTML = NEWS.map(n => `
    <a class="news-card" href="${n.link}">
      <small>${n.date}</small>
      <h3>${n.title}</h3>
      <p>${n.summary}</p>
    </a>
  `).join("");
}

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  cart = cart.filter(i => i.qty > 0);
  saveCart();
  renderCart();
}

function renderCart() {
  let total = 0;
  $("cart-items").innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    const sum = p.price * item.qty;
    total += sum;
    return `
      <li>
        <span>${p.name} × ${item.qty}</span>
        <span>${fmt(sum)} đ</span>
        <button onclick="changeQty(${p.id}, 1)">+</button>
        <button onclick="changeQty(${p.id}, -1)">−</button>
      </li>`;
  }).join("") || "<li class='empty'>Giỏ hàng trống</li>";

  $("cart-total").textContent = fmt(total);
}

function checkout() {
  const name = $("customer-name").value.trim();
  const phone = $("customer-phone").value.trim();
  const address = $("customer-address").value.trim();

  if (!cart.length) return alert("Giỏ hàng đang trống.");
  if (!name || !phone || !address) return alert("Vui lòng nhập đầy đủ thông tin.");
  if (!/^0\d{9}$/.test(phone)) return alert("Số điện thoại không hợp lệ.");

  const lines = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id);
    return `- ${p.name} × ${item.qty}`;
  });
  const total = cart.reduce((s, i) => s + PRODUCTS.find(x => x.id === i.id).price * i.qty, 0);

  const message = `ĐƠN HÀNG MỚI - ${CONFIG.shopName}
${lines.join("\n")}
Tổng: ${fmt(total)} đ
Khách: ${name} - ${phone}
Địa chỉ: ${address}`;

  navigator.clipboard.writeText(message).catch(() => {});
  alert("Đã sao chép nội dung đơn. Dán vào Zalo để gửi cho shop.");
  window.open(`https://zalo.me/${CONFIG.zaloPhone}`, "_blank");

  cart = [];
  saveCart();
  renderCart();
}

$("btn-cart").onclick = () => $("cart").classList.remove("hidden");
$("btn-close-cart").onclick = () => $("cart").classList.add("hidden");
$("btn-checkout").onclick = checkout;

renderFilters();
renderProducts();
renderNews();
renderCart();
renderCartCount();