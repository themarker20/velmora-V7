// VELMORA Nich Perfume — Aromatic Oils renderer (uses VELMORA.oils template)
(function(){
  function card(o, lang){
    const img = o.image
      ? `<img src="${o.image}" alt="${o.name[lang]}" loading="lazy" style="width:84px;height:84px;object-fit:cover;border-radius:50%;box-shadow:0 0 40px rgba(212,175,55,.35);margin-bottom:1rem">`
      : `<div class="oil-drop"></div>`;
    const cta = o.available
      ? `<button class="gold-btn small" data-add="${o.id}">${VELMORA.t("add_to_cart")}</button>`
      : `<span class="oil-soon">${VELMORA.t("coming_soon")}</span>`;
    return `<article class="oil-card reveal">
      ${img}
      <h3 class="oil-name">${o.name[lang]}</h3>
      ${o.volume?`<span class="oil-volume">${o.volume}</span>`:""}
      <p class="oil-tag">${o.tagline[lang]}</p>
      <p class="oil-notes">${o.notes[lang].join(" · ")}</p>
      <div class="oil-foot">
        ${o.available?`<span class="oil-price">ج.م${o.price}</span>`:`<span></span>`}
        ${cta}
      </div>
    </article>`;
  }
  function render(){
    const lang = VELMORA.getLang();
    const grid = document.getElementById("oils-grid"); if (!grid) return;
    const list = VELMORA.oils || [];
    grid.innerHTML = list.length
      ? list.map(o=>card(o,lang)).join("")
      : `<p class="muted center">—</p>`;
    // re-trigger reveal observer
    const io = new IntersectionObserver(es => es.forEach(en => en.isIntersecting && en.target.classList.add("visible")), {threshold:0.12});
    grid.querySelectorAll(".reveal").forEach(el => io.observe(el));
  }
  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("langchange", render);
  document.addEventListener("click", e=>{
    const a = e.target.closest("[data-add]");
    if (a && (VELMORA.oils||[]).some(o=>o.id===a.dataset.add)){
      VELMORA.addToCart(a.dataset.add);
    }
  });
})();
