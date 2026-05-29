/* slidedeck — framework de presentaciones HTML
   https://github.com/Spktro/slidedeck

   Uso mínimo:
     <link rel="stylesheet" href="deck.css">
     <div class="deck" id="deck" data-brand="Mi charla" data-home="../index.html">
       <section class="slide" data-chapter="Intro" data-topic="Bienvenida"> ... </section>
       ...
     </div>
     <script src="deck.js"></script>

   Config en el contenedor .deck:
     data-brand : texto del pie de marca (lo anterior al primer " · " va en negrita)
     data-home  : href del botón "← Índice" (si se omite, no se muestra)
   Por slide (opcional, para el navegador):
     data-chapter : agrupador  ·  data-topic : tema
*/
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    const deck = document.getElementById("deck") || document.querySelector(".deck");
    if (!deck) return;
    const slides = Array.from(deck.querySelectorAll(".slide"));
    if (!slides.length) return;

    const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

    /* ---------- Chrome ---------- */
    // Barra de progreso
    const progress = el("div", "progress");
    document.body.appendChild(progress);

    // Link al índice
    const homeHref = deck.dataset.home;
    if (homeHref) {
      const a = document.createElement("a");
      a.className = "home-link";
      a.href = homeHref;
      a.textContent = "← Índice";
      document.body.appendChild(a);
    }

    // Barra superior: tema + selector de tamaño
    const sizer = el("div", "sizer");
    const themeBtn = el("button", "theme-toggle");
    themeBtn.type = "button";
    themeBtn.title = "Modo claro / oscuro";
    themeBtn.setAttribute("aria-label", "Cambiar tema");
    sizer.appendChild(themeBtn);
    sizer.appendChild(el("span", "sizer-div"));
    const lbl = el("span", "lbl");
    lbl.textContent = "Tamaño";
    sizer.appendChild(lbl);
    const SIZES = [["fit", "Ajustar"], ["m", "Cómodo"], ["l", "Grande"], ["xl", "Enorme"]];
    SIZES.forEach(([id, label]) => {
      const b = el("button");
      b.dataset.size = id;
      b.textContent = label;
      sizer.appendChild(b);
    });
    document.body.appendChild(sizer);

    // Marca (pie izquierdo)
    const brandText = deck.dataset.brand;
    if (brandText) {
      const brand = el("div", "brand");
      const idx = brandText.indexOf(" · ");
      if (idx > -1) {
        const b = document.createElement("b");
        b.textContent = brandText.slice(0, idx);
        brand.appendChild(b);
        brand.appendChild(document.createTextNode(brandText.slice(idx)));
      } else {
        brand.textContent = brandText;
      }
      document.body.appendChild(brand);
    }

    // Paginador
    const pager = el("div", "pager");
    const cur = document.createElement("span");
    const total = document.createElement("span");
    cur.textContent = "1";
    total.textContent = slides.length;
    pager.appendChild(cur);
    pager.appendChild(document.createTextNode(" / "));
    pager.appendChild(total);
    document.body.appendChild(pager);

    /* ---------- Botón "Copiar" en cada bloque de código ---------- */
    deck.querySelectorAll("pre.code").forEach((pre) => {
      const wrap = el("div", "code-wrap");
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      const btn = el("button", "copy-btn");
      btn.type = "button";
      btn.textContent = "Copiar";
      const flash = (txt, ok) => {
        btn.textContent = txt;
        btn.classList.toggle("copied", !!ok);
        setTimeout(() => { btn.textContent = "Copiar"; btn.classList.remove("copied"); }, 1500);
      };
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(pre.innerText);
          flash("¡Copiado!", true);
        } catch (err) {
          try {
            const r = document.createRange();
            r.selectNodeContents(pre);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(r);
            document.execCommand("copy");
            sel.removeAllRanges();
            flash("¡Copiado!", true);
          } catch (_) { flash("Error", false); }
        }
      });
      wrap.appendChild(btn);
    });

    /* ---------- Tema claro / oscuro (compartido vía localStorage) ---------- */
    let theme = localStorage.getItem("deckTheme") || "light";
    function applyTheme() {
      document.documentElement.setAttribute("data-theme", theme);
      themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    }
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      theme = theme === "dark" ? "light" : "dark";
      localStorage.setItem("deckTheme", theme);
      applyTheme();
    });
    window.addEventListener("storage", (e) => {
      if (e.key === "deckTheme" && e.newValue) { theme = e.newValue; applyTheme(); }
    });
    applyTheme();

    /* ---------- Selector de tamaño (escala el lienzo 1280x720) ---------- */
    let sizeId = localStorage.getItem("deckSize") || "m";
    function computeFit() {
      const fw = window.innerWidth / 1280;
      const fh = window.innerHeight / 720;
      let z;
      if (sizeId === "fit") z = Math.min(fw, fh);
      else if (sizeId === "l") z = fw * 1.2;
      else if (sizeId === "xl") z = fw * 1.4;
      else z = fw;
      document.documentElement.style.setProperty("--fit", z.toFixed(3));
    }
    function syncSizer() {
      sizer.querySelectorAll("button[data-size]").forEach((b) => b.classList.toggle("on", b.dataset.size === sizeId));
    }
    sizer.querySelectorAll("button[data-size]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        sizeId = b.dataset.size;
        localStorage.setItem("deckSize", sizeId);
        computeFit();
        syncSizer();
      });
    });
    window.addEventListener("resize", computeFit);
    computeFit();
    syncSizer();

    /* ---------- Navegación ---------- */
    let thumbEls = [];
    let i = 0;
    function show(idx) {
      i = Math.max(0, Math.min(slides.length - 1, idx));
      slides.forEach((s, n) => s.classList.toggle("active", n === i));
      cur.textContent = i + 1;
      progress.style.width = ((i + 1) / slides.length * 100) + "%";
      if (location.hash !== "#" + (i + 1)) history.replaceState(null, "", "#" + (i + 1));
      thumbEls.forEach((t, n) => t.classList.toggle("current", n === i));
      if (thumbEls[i]) thumbEls[i].scrollIntoView({ block: "nearest" });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { show(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { show(i - 1); e.preventDefault(); }
      else if (e.key === "Home") { show(0); }
      else if (e.key === "End") { show(slides.length - 1); }
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("a, pre, code, input, button, .filmstrip")) return;
      const x = e.clientX / window.innerWidth;
      if (x > 0.5) show(i + 1); else show(i - 1);
    });

    window.addEventListener("hashchange", () => {
      const n = parseInt((location.hash || "#1").slice(1), 10);
      if (!isNaN(n)) show(n - 1);
    });

    /* ---------- Filmstrip (miniaturas con capítulo · tema) ---------- */
    (function buildFilmstrip() {
      const film = el("div", "filmstrip");
      const hot = el("div", "filmstrip-hot");
      slides.forEach((s, n) => {
        const thumb = el("button", "thumb");
        thumb.type = "button";
        const frame = el("div", "thumb-frame");
        const canvas = el("div", "thumb-canvas");
        const clone = s.cloneNode(true);
        clone.classList.remove("active");
        clone.classList.add("thumb-slide");
        clone.removeAttribute("id");
        clone.querySelectorAll(".copy-btn").forEach((b) => b.remove());
        canvas.appendChild(clone);
        frame.appendChild(canvas);
        const num = el("span", "thumb-num");
        num.textContent = n + 1;
        frame.appendChild(num);
        thumb.appendChild(frame);

        const chapter = s.dataset.chapter || (s.querySelector(".slide-eyebrow") || {}).textContent || "";
        const topic = s.dataset.topic || (s.querySelector(".slide-title, .title") || {}).textContent || "";
        const label = el("div", "thumb-label");
        if (chapter) { const c = el("span", "thumb-chapter"); c.textContent = chapter; label.appendChild(c); }
        if (topic) { const t = el("span", "thumb-topic"); t.textContent = topic; label.appendChild(t); }
        thumb.appendChild(label);

        thumb.addEventListener("click", (e) => { e.stopPropagation(); show(n); });
        film.appendChild(thumb);
        thumbEls.push(thumb);
      });
      document.body.appendChild(film);
      document.body.appendChild(hot);
      hot.addEventListener("mouseenter", () => film.classList.add("open"));
      film.addEventListener("mouseleave", () => film.classList.remove("open"));
    })();

    /* ---------- Inicio ---------- */
    const initial = parseInt((location.hash || "#1").slice(1), 10);
    show(isNaN(initial) ? 0 : initial - 1);
  });
})();
