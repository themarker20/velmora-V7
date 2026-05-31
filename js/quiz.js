(function(){
  const KEYS = ["mystery","elegance","freshness","seduction","power","warmth"];
  let stage = "intro", currentId = VELMORA.startQuestionId;
  let history = [], scores = empty(), tStart = 0, speed = null, result = null;

  function empty(){ return {mystery:0,elegance:0,freshness:0,seduction:0,power:0,warmth:0}; }
  function normalize(s){
    const out = {...s};
    const max = Math.max(...Object.values(out),1);
    KEYS.forEach(k=> out[k]=Math.round((out[k]/max)*100));
    return out;
  }
  function matchArch(s){
    let best = VELMORA.archetypes[0], bestSim = -Infinity;
    for (const a of VELMORA.archetypes){
      let d=0,mu=0,ma=0;
      KEYS.forEach(k=>{ d+=s[k]*a.weights[k]; mu+=s[k]*s[k]; ma+=a.weights[k]*a.weights[k]; });
      const sim = d / (Math.sqrt(mu)*Math.sqrt(ma) || 1);
      if (sim>bestSim){ bestSim=sim; best=a; }
    }
    return best;
  }
  function matchProduct(arch){ return VELMORA.products.find(p=>p.id===arch.matchProductId) || VELMORA.products[0]; }

  function begin(){ scores=empty(); history=[]; currentId=VELMORA.startQuestionId; stage="quiz"; tStart=Date.now(); render(); }
  function reset(){ stage="intro"; result=null; render(); }
  function back(){
    if (!history.length) return;
    const last = history.pop();
    currentId = last.qId; render();
  }
  function pick(opt){
    const elapsed = Date.now()-tStart;
    const delta = {...opt.delta};
    if (elapsed<2000) delta.power = (delta.power||0)+5;
    else if (elapsed>8000) delta.elegance = (delta.elegance||0)+5;
    const next = {...scores};
    Object.keys(delta).forEach(k=> next[k]=(next[k]||0)+(delta[k]||0));
    scores = next;
    const cur = VELMORA.questions.find(q=>q.id===currentId);
    history.push({qId:cur.id, optId:opt.id});

    let nextId = null;
    if (opt.next && !history.some(h=>h.qId===opt.next)) nextId = opt.next;
    else {
      for (const id of ["q_memory","q_aura","q_season"]){
        if (!history.some(h=>h.qId===id)){ nextId=id; break; }
      }
    }
    if (!nextId || history.length>=6){
      speed = elapsed<3000 ? "decisive" : "analytical";
      finish();
    } else { currentId = nextId; tStart = Date.now(); render(); }
  }
  function finish(){
    stage = "decoding"; render();
    setTimeout(()=>{
      const norm = normalize(scores);
      const arch = matchArch(norm);
      result = { arch, product: matchProduct(arch), scores: norm };
      stage = "result"; render();
    }, 2400);
  }

  function render(){
    const lang = VELMORA.getLang();
    const root = document.getElementById("quiz-root"); if (!root) return;
    const t = VELMORA.t;

    if (stage==="intro"){
      root.innerHTML = `<div class="quiz-intro fade-up">
        <p class="kicker">6 ${lang==='ar'?'أسئلة':'QUESTIONS'} · 2 ${lang==='ar'?'دقيقتان':'MINUTES'}</p>
        <h3 class="serif xl">${t("quiz_sub")}</h3>
        <button class="gold-btn lg" id="q-start">${t("quiz_start")}</button>
      </div>`;
      document.getElementById("q-start").onclick = begin;
      return;
    }
    if (stage==="decoding"){
      root.innerHTML = `<div class="quiz-decoding fade-up">
        <div class="loader"></div>
        <p class="serif xl shimmer">${t("quiz_decoding")}</p>
      </div>`;
      return;
    }
    if (stage==="result"){
      const r = result;
      root.innerHTML = `<div class="quiz-result fade-up">
        <div>
          <p class="kicker">${t("quiz_your_id")}</p>
          <h3 class="serif xxl gold-shimmer">${r.arch.name[lang]}</h3>
          <p class="serif italic">"${r.arch.tagline[lang]}"</p>
          <p class="muted-lg">${r.arch.description[lang]}</p>
          <div class="scores">
            ${KEYS.map(k=>`<div class="score">
              <div class="srow"><span>${t("scoreL_"+k)}</span><span class="gold">${r.scores[k]}%</span></div>
              <div class="sbar"><span style="width:${r.scores[k]}%"></span></div>
            </div>`).join("")}
          </div>
          <div class="dna-grid">
            <div><p class="kicker">${t("quiz_dna")}</p><ul>${r.arch.dna[lang].map(d=>`<li>· ${d}</li>`).join("")}</ul></div>
            <div><p class="kicker">${t("quiz_best_time")}</p><ul>${r.arch.bestTime[lang].map(d=>`<li>· ${d}</li>`).join("")}</ul></div>
          </div>
          ${speed?`<p class="speed-hint">${
            lang==='ar'
              ? (speed==='decisive'?'أسلوب اختيارك حاسم — شخصية تعرف ما تريد.':'أسلوب اختيارك تحليلي — شخصية متأمّلة دقيقة.')
              : (speed==='decisive'?'Your choice style is decisive — a person who knows what they want.':'Your choice style is analytical — thoughtful and precise.')
          }</p>`:""}
        </div>
        <div>
          <p class="kicker center">${t("quiz_recommended")}</p>
          <div class="match-card">
            <img src="${r.product.image}" alt="">
            <span class="match-badge">PERFECT MATCH</span>
          </div>
          <h4 class="serif xl center">${r.product.name[lang]}</h4>
          <p class="muted center italic">${r.product.tagline[lang]}</p>
          <p class="serif xl center gold">ج.م${r.product.price}</p>
          <div class="result-actions">
            <button class="gold-btn" id="r-add">${t("quiz_shop")}</button>
            <button class="ghost-btn" id="r-share">${t("quiz_share")}</button>
            <button class="ghost-btn" id="r-reset">${t("quiz_retake")}</button>
          </div>
        </div>
      </div>`;
      document.getElementById("r-add").onclick = ()=> VELMORA.addToCart(r.product.id);
      document.getElementById("r-reset").onclick = reset;
      document.getElementById("r-share").onclick = ()=>{
        const txt = lang==="ar"
          ? `هويتي العطرية: ${r.arch.name.ar} — اكتشف عطرك على VELMORA PARIS`
          : `My scent identity: ${r.arch.name.en} — discover yours at VELMORA PARIS`;
        if (navigator.share) navigator.share({title:"VELMORA",text:txt,url:location.href}).catch(()=>{});
        else { navigator.clipboard.writeText(txt+" "+location.href); VELMORA.toast(lang==="ar"?"تم نسخ الرابط":"Link copied"); }
      };
      return;
    }

    const q = VELMORA.questions.find(x=>x.id===currentId);
    const idx = history.length;
    const progress = Math.min(100, (idx/6)*100);
    root.innerHTML = `<div class="quiz-step fade-up">
      <div class="qhead"><span>${idx+1} / 6</span>${idx>0?`<button id="q-back" class="link">← ${t("quiz_back")}</button>`:""}</div>
      <div class="progress"><span style="width:${progress}%"></span></div>
      <h3 class="serif xl q-prompt">${q.prompt[lang]}</h3>
      <div class="q-options">
        ${q.options.map((o,i)=>`<button class="q-opt" data-i="${i}">
          <span class="emo">${o.emoji||""}</span>
          <span class="lbl">${o.label[lang]}</span>
          <span class="arr">→</span>
        </button>`).join("")}
      </div>
    </div>`;
    if (idx>0) document.getElementById("q-back").onclick = back;
    root.querySelectorAll(".q-opt").forEach(btn=>{
      btn.onclick = ()=> pick(q.options[parseInt(btn.dataset.i,10)]);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("langchange", render);
})();
