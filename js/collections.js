(function(){
  const filters = { category:"all", gender:"all", season:"all" };

  function card(p, lang){
    return `<article class="product-card tilt">
      <div class="pc-img">
        <img src="${p.image}" alt="${p.name[lang]}" loading="lazy">
        <span class="pc-badge">${p.category.toUpperCase()}</span>
      </div>
      <div class="pc-body">
        <h3 class="pc-name">${p.name[lang]}</h3>
        <p class="pc-tag">${p.tagline[lang]}</p>
        <p class="pc-notes"><span class="muted">${VELMORA.t("notes")}:</span> ${p.notes[lang].join(" · ")}</p>
        <div class="pc-foot">
          <span class="pc-price">ج.م${p.price}</span>
          <button class="gold-btn small" data-add="${p.id}">${VELMORA.t("add_to_cart")}</button>
        </div>
      </div>
    </article>`;
  }

  function applyFilters(){
    const lang = VELMORA.getLang();
    const list = VELMORA.products.filter(p => {
      if (filters.category!=="all" && p.category!==filters.category) return false;
      if (filters.gender!=="all" && p.gender!==filters.gender) return false;
      if (filters.season!=="all" && p.season!==filters.season && p.season!=="all") return false;
      return true;
    });
    const g = document.getElementById("products-grid");
    g.innerHTML = list.length ? list.map(p=>card(p,lang)).join("") :
      `<p class="muted center">—</p>`;
  }

  function render(){
    const lang = VELMORA.getLang();
    const cats = [
      ["all","filter_all"],["floral","filter_floral"],["oud","filter_oud"],
      ["citrus","filter_citrus"],["exclusive","filter_exclusive"]
    ];
    const gens = [["all","filter_all"],["women","filter_women"],["men","filter_men"]];
    const seas = [["all","filter_all"],["summer","filter_summer"],["winter","filter_winter"]];
    document.getElementById("filter-cats").innerHTML = cats.map(([v,k])=>
      `<button class="chip ${filters.category===v?'active':''}" data-f="category" data-v="${v}">${VELMORA.t(k)}</button>`).join("");
    document.getElementById("filter-gens").innerHTML = gens.map(([v,k])=>
      `<button class="chip ${filters.gender===v?'active':''}" data-f="gender" data-v="${v}">${VELMORA.t(k)}</button>`).join("");
    document.getElementById("filter-seas").innerHTML = seas.map(([v,k])=>
      `<button class="chip ${filters.season===v?'active':''}" data-f="season" data-v="${v}">${VELMORA.t(k)}</button>`).join("");
    applyFilters();
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    render();
    document.addEventListener("click", e=>{
      const f = e.target.closest("[data-f]");
      if (f){ filters[f.dataset.f] = f.dataset.v; render(); }
      const a = e.target.closest("[data-add]");
      if (a){ VELMORA.addToCart(a.dataset.add); }
    });
  });
  document.addEventListener("langchange", render);
})();
