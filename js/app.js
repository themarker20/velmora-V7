// VELMORA — i18n, cart, header/footer, checkout (shared on every page)
(function(){
  const D = VELMORA.dict;
  let lang = localStorage.getItem("velmora_lang") || "ar";

  function t(k){ return (D[k] && D[k][lang]) || k; }
  function setLang(l){
    lang = l; localStorage.setItem("velmora_lang", l);
    applyLang();
  }
  function applyLang(){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    const btn = document.getElementById("lang-toggle");
    if (btn) btn.textContent = lang === "ar" ? "EN" : "ع";
    document.dispatchEvent(new CustomEvent("langchange",{detail:{lang}}));
  }
  VELMORA.t = t; VELMORA.getLang = () => lang; VELMORA.setLang = setLang;

  // === Header / Footer ===
  function header(){
    const links = [
      ["index.html","nav_home"],
      ["collections.html","nav_collections"],
      ["story.html","nav_story"],
      ["quiz.html","nav_quiz"],
      ["bespoke.html","nav_bespoke"],
      ["journal.html","nav_journal"],
      ["contact.html","nav_contact"],
    ];
    const current = location.pathname.split("/").pop() || "index.html";
    return `
    <header class="navbar">
      <div class="nav-inner">
        <a href="index.html" class="brand">Veyvora <br> <span style="font-size: 11px; letter-spacing: 1px;">Essence Beyond Time</span></a>
        <nav class="nav-links">
          ${links.map(([h,k])=>`<a href="${h}" class="${h===current?'active':''}" data-i18n="${k}">${t(k)}</a>`).join("")}
        </nav>
        <div class="nav-actions">
          <button id="lang-toggle" class="lang-btn" aria-label="language">${lang==='ar'?'EN':'ع'}</button>
          <button id="cart-btn" class="cart-btn" aria-label="cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span class="cart-count" id="cart-count">0</span>
          </button>
          <button id="menu-btn" class="menu-btn" aria-label="menu">☰</button>
        </div>
      </div>
      <nav class="nav-mobile" id="nav-mobile">
        ${links.map(([h,k])=>`<a href="${h}" data-i18n="${k}">${t(k)}</a>`).join("")}
      </nav>
    </header>`;
  }
  function footer(){
    return `
    <footer class="footer">
      <p class="footer-brand">Veyvora  -  Essence Beyond Time</p>
      <p class="footer-sub">Egypt · SINCE 2007</p>
      <div class="divider"></div>
      <div class="socials">
        <a href="#" aria-label="ig">IG</a><a href="#" aria-label="fb">FB</a><a href="#" aria-label="tw">TW</a>
        <a href="https://wa.me/${VELMORA.WHATSAPP}" target="_blank" aria-label="wa">WA</a>
      </div>
      <p class="rights" data-i18n="rights">${t("rights")}</p>
    </footer>`;
  }
  function cartDrawer(){
    return `
    <div class="cart-overlay" id="cart-overlay"></div>
    <aside class="cart-drawer" id="cart-drawer">
      <div class="cart-head">
        <h3 data-i18n="cart">${t("cart")}</h3>
        <button class="x" id="cart-close">×</button>
      </div>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-foot">
        <div class="cart-sub"><span data-i18n="cart_subtotal">${t("cart_subtotal")}</span><span id="cart-total">ج.م0</span></div>
        <button class="gold-btn full" id="cart-checkout" data-i18n="cart_checkout">${t("cart_checkout")}</button>
      </div>
    </aside>`;
  }
  function checkoutModal(){
    return `
    <div class="modal-overlay" id="co-overlay"></div>
    <div class="modal" id="co-modal" role="dialog" aria-modal="true">
      <button class="x modal-x" id="co-close">×</button>
      <h3 data-i18n="co_title">${t("co_title")}</h3>
      <p class="muted" data-i18n="co_sub">${t("co_sub")}</p>
      <form id="co-form" class="co-form">
        <label><span data-i18n="co_name">${t("co_name")}</span><input name="name" required></label>
        <label><span data-i18n="co_phone">${t("co_phone")}</span><input name="phone" required></label>
        <label><span data-i18n="co_phone2">${t("co_phone2")}</span><input name="phone2"></label>
        <label><span data-i18n="co_city">${t("co_city")}</span><input name="city" required></label>
        <label class="full"><span data-i18n="co_address">${t("co_address")}</span><textarea name="address" rows="3" required></textarea></label>
        <label class="full"><span data-i18n="co_notes">${t("co_notes")}</span><textarea name="notes" rows="2"></textarea></label>
        <button type="submit" class="gold-btn full" data-i18n="co_send">${t("co_send")}</button>
      </form>
    </div>`;
  }

  // === CART STATE ===
  let cart = JSON.parse(localStorage.getItem("velmora_cart")||"[]");
  function saveCart(){ localStorage.setItem("velmora_cart", JSON.stringify(cart)); renderCart(); }
  function addToCart(id){
    const ex = cart.find(c=>c.id===id);
    if (ex) ex.qty++; else cart.push({id, qty:1});
    saveCart(); toast(t("added_toast")); openCart();
  }
  function removeFromCart(id){ cart = cart.filter(c=>c.id!==id); saveCart(); }
  function changeQty(id,d){
    const it = cart.find(c=>c.id===id); if(!it) return;
    it.qty += d; if (it.qty<=0) cart = cart.filter(c=>c.id!==id);
    saveCart();
  }
  function renderCart(){
    const items = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");
    const total = document.getElementById("cart-total");
    if (!items) return;
    const total$ = cart.reduce((s,c)=>{ const p = VELMORA.products.find(x=>x.id===c.id); return s + (p?p.price*c.qty:0); },0);
    const qty = cart.reduce((s,c)=>s+c.qty,0);
    count.textContent = qty;
    count.style.display = qty ? "flex" : "none";
    total.textContent = "ج.م" + total$;
    if (cart.length===0){
      items.innerHTML = `<p class="empty" data-i18n="cart_empty">${t("cart_empty")}</p>`;
      return;
    }
    items.innerHTML = cart.map(c=>{
      const p = VELMORA.products.find(x=>x.id===c.id); if(!p) return "";
      return `<div class="cart-item">
        <img src="${p.image}" alt="">
        <div class="ci-body">
          <p class="ci-name">${p.name[lang]}</p>
          <p class="ci-price">ج.م${p.price}</p>
          <div class="ci-qty">
            <button data-qty="-1" data-id="${p.id}">−</button>
            <span>${c.qty}</span>
            <button data-qty="1" data-id="${p.id}">+</button>
            <button class="ci-rm" data-rm="${p.id}" data-i18n="remove">${t("remove")}</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }
  VELMORA.addToCart = addToCart;

  function openCart(){ document.getElementById("cart-drawer").classList.add("open"); document.getElementById("cart-overlay").classList.add("open"); }
  function closeCart(){ document.getElementById("cart-drawer").classList.remove("open"); document.getElementById("cart-overlay").classList.remove("open"); }
  function openCheckout(){
    if (cart.length===0) { toast(t("cart_empty")); return; }
    document.getElementById("co-modal").classList.add("open");
    document.getElementById("co-overlay").classList.add("open");
  }
  function closeCheckout(){
    document.getElementById("co-modal").classList.remove("open");
    document.getElementById("co-overlay").classList.remove("open");
  }

  function sendWhatsApp(data){
    const isAr = lang === "ar";
    const lines = [];
    lines.push(isAr ? "🌹 طلب جديد من Veyvora  -  Essence Beyond Time" : "🌹 New Veyvora  -  Essence Beyond Time order");
    lines.push("");
    lines.push((isAr?"الاسم: ":"Name: ") + data.name);
    lines.push((isAr?"الهاتف: ":"Phone: ") + data.phone);
    if (data.phone2) lines.push((isAr?"هاتف إضافي: ":"Alt phone: ") + data.phone2);
    lines.push((isAr?"المدينة: ":"City: ") + data.city);
    lines.push((isAr?"العنوان: ":"Address: ") + data.address);
    if (data.notes) lines.push((isAr?"ملاحظات: ":"Notes: ") + data.notes);
    lines.push("");
    lines.push(isAr ? "— تفاصيل الطلب —" : "— Order Details —");
    let total = 0;
    cart.forEach(c=>{
      const p = VELMORA.products.find(x=>x.id===c.id); if(!p) return;
      total += p.price * c.qty;
      lines.push(`• ${p.name[lang]} × ${c.qty} = ج.م${p.price*c.qty}`);
    });
    lines.push("");
    lines.push((isAr?"الإجمالي: ":"Total: ") + "ج.م" + total);
    const msg = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${VELMORA.WHATSAPP}?text=${msg}`, "_blank");
  }

  function toast(msg){
    let el = document.getElementById("toast");
    if (!el){ el = document.createElement("div"); el.id="toast"; el.className="toast"; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add("show");
    clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove("show"), 2200);
  }
  VELMORA.toast = toast;

  // === MOUNT ===
  document.addEventListener("DOMContentLoaded", () => {
    const h = document.getElementById("site-header"); if (h) h.innerHTML = header();
    const f = document.getElementById("site-footer"); if (f) f.innerHTML = footer();
    document.body.insertAdjacentHTML("beforeend", cartDrawer() + checkoutModal());

    applyLang();
    renderCart();

    document.getElementById("lang-toggle")?.addEventListener("click", ()=> setLang(lang==="ar"?"en":"ar"));
    document.getElementById("cart-btn")?.addEventListener("click", openCart);
    document.getElementById("cart-close")?.addEventListener("click", closeCart);
    document.getElementById("cart-overlay")?.addEventListener("click", closeCart);
    document.getElementById("cart-checkout")?.addEventListener("click", ()=>{ closeCart(); openCheckout(); });
    document.getElementById("co-close")?.addEventListener("click", closeCheckout);
    document.getElementById("co-overlay")?.addEventListener("click", closeCheckout);
    document.getElementById("menu-btn")?.addEventListener("click", ()=> document.getElementById("nav-mobile").classList.toggle("open"));

    document.getElementById("cart-items")?.addEventListener("click", e=>{
      const t1 = e.target;
      if (t1.dataset.qty) changeQty(t1.dataset.id, parseInt(t1.dataset.qty,10));
      if (t1.dataset.rm) removeFromCart(t1.dataset.rm);
    });

    document.getElementById("co-form")?.addEventListener("submit", e=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      sendWhatsApp(Object.fromEntries(fd.entries()));
      closeCheckout();
    });

    // reveal on scroll
    const io = new IntersectionObserver(es => es.forEach(en => en.isIntersecting && en.target.classList.add("visible")), {threshold:0.12});
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  });

  document.addEventListener("langchange", renderCart);
})();


// === Custom Cursor ===
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
let mx = 0, my = 0, cx = 0, cy = 0;

if (cursor && cursorDot) {
  window.addEventListener('mousemove', e => { 
    mx = e.clientX; my = e.clientY; 
    cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; 
  });
  
  function animateCursor() {
    cx += (mx - cx) * 0.15; 
    cy += (my - cy) * 0.15;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, .product-card, input, .quiz-option')) {
      cursor.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, .product-card, input, .quiz-option')) {
      cursor.classList.remove('hover');
    }
  });
}