"use strict";
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }
  };

  /* Barra de progreso */
  const progress = $(".progress");
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? h.scrollTop / max * 100 : 0) + "%";
      ticking = false;
    });
  }, { passive: true });

  /* Cursor personalizado: solo con mouse real */
  if (matchMedia("(pointer:fine) and (min-width:900px)").matches) {
    document.body.classList.add("has-cursor");
    const dot = $(".cursor-dot"), ring = $(".cursor-ring");
    let mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px"; }, { passive: true });
    (function loop() { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.left = rx + "px"; ring.style.top = ry + "px"; requestAnimationFrame(loop); })();
    $$("a,button").forEach(el => {
      el.addEventListener("mouseenter", () => { ring.style.width = ring.style.height = "48px"; });
      el.addEventListener("mouseleave", () => { ring.style.width = ring.style.height = "32px"; });
    });
  }

  /* Modal (solo imágenes de la lista permitida) */
  const modal = $("#modal"), mImg = $("#modalImg"), mTitle = $("#modalTitle"), mCat = $("#modalCat");
  const thumbs = $$(".thumb");
  const SAFE_IMG = /^thumbnail-[a-z]+\.webp$/;
  let idx = 0, lastFocus = null;
  function show(i) {
    idx = (i + thumbs.length) % thumbs.length;
    const d = thumbs[idx].dataset;
    if (!SAFE_IMG.test(d.image)) return;
    mImg.src = d.image; mImg.alt = d.title;
    mTitle.textContent = d.title; mCat.textContent = d.cat;
  }
  function openModal(i) {
    lastFocus = document.activeElement; show(i);
    modal.hidden = false; modal.classList.add("open"); document.body.style.overflow = "hidden";
    $("#close").focus();
  }
  function closeModal() {
    modal.classList.remove("open"); modal.hidden = true; document.body.style.overflow = "";
    mImg.removeAttribute("src"); if (lastFocus) lastFocus.focus();
  }
  thumbs.forEach((b, i) => b.addEventListener("click", () => openModal(i)));
  $("#close").addEventListener("click", closeModal);
  $("#prev").addEventListener("click", () => show(idx - 1));
  $("#next").addEventListener("click", () => show(idx + 1));
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "Tab") { // atrapa el foco dentro del modal
      const f = $$("button", modal), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Menú móvil */
  const menu = $("#menu"), nav = $("#nav");
  const setMenu = o => { nav.classList.toggle("mobile-open", o); menu.setAttribute("aria-expanded", String(o)); };
  menu.addEventListener("click", () => setMenu(!nav.classList.contains("mobile-open")));
  $$("#nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));

  /* Animación al entrar en pantalla */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }), { threshold: .08 });
  $$(".card,.step,.big-statement,.about-content").forEach(el => { el.classList.add("reveal"); io.observe(el); });

  /* Idiomas: texto plano, sin innerHTML.
     "\n" = salto de línea; lo que va entre |barras| se envuelve en data-wrap (span/em). */
  const T = {
    es: {
      work: "TRABAJOS", process: "PROCESO", about: "SOBRE MÍ", contact: "CONTACTO",
      designer: "THUMBNAIL DESIGNER / 2026", status: "DISPONIBLE PARA PROYECTOS",
      kicker: "DISEÑO QUE NO PASA DESAPERCIBIDO.", heroTitle: "Tu video\n|empieza aquí.|",
      heroText: "Creo miniaturas pensadas para llamar la atención, contar una idea en segundos y hacer que tu video destaque.",
      viewWork: "Ver mis trabajos", wantThumb: "Quiero una miniatura", scroll: "SCROLL ↓",
      workEyebrow: "01 / TRABAJOS", workTitle: "Lo que\n|he creado.|", workText: "Miniaturas hechas para diferentes ideas, estilos y tipos de contenido.",
      meta1: "04 PROYECTOS", meta2: "100% DISEÑO", open: "ABRIR",
      stmtEyebrow: "02 / MI ENFOQUE", stmt: "Una buena miniatura tiene que |vender el clic| antes de que el espectador vea el video.", howWork: "Así trabajo ↓",
      processEyebrow: "03 / PROCESO", processTitle: "Simple.\n|Directo.|", processText: "Sin vueltas innecesarias. Cada parte tiene un propósito.",
      s1t: "Me cuentas la idea", s1p: "Qué trata el video, qué quieres destacar y qué estilo buscas.",
      s2t: "Construyo la escena", s2p: "Personajes, fondos, texto, colores y composición trabajando juntos.",
      s3t: "Le damos impacto", s3p: "Retoque, contraste y detalles para que funcione incluso en pequeño.",
      s4t: "Lista para publicar", s4p: "Te entrego la miniatura final en alta calidad.",
      aboutEyebrow: "04 / SOBRE MÍ", aboutTitle: "Diseño para que\n|te miren.|",
      aboutText: "Soy Jhonarki y me gusta convertir ideas simples en miniaturas que se sienten grandes. Me enfoco en composición, personajes, retoque y detalles que hagan que una imagen tenga presencia.",
      sk1: "RETOQUE", sk2: "COMPOSICIÓN",
      contactEyebrow: "05 / CONTACTO", contactTitle: "¿QUIERES\nTRABAJAR\nCONMIGO?", contactSub: "HABLEMOS.",
      contactText: "Cuéntame qué tienes en mente y vemos cómo convertir la idea en una miniatura que destaque.",
      mail: "Correo", copyHint: "Haz clic para copiar mi usuario de Discord.", copied: "Copiado: "
    },
    en: {
      work: "WORK", process: "PROCESS", about: "ABOUT", contact: "CONTACT",
      designer: "THUMBNAIL DESIGNER / 2026", status: "AVAILABLE FOR PROJECTS",
      kicker: "DESIGN THAT DOESN'T GET IGNORED.", heroTitle: "Your video\n|starts here.|",
      heroText: "I create thumbnails built to grab attention, communicate an idea in seconds, and make your video stand out.",
      viewWork: "View my work", wantThumb: "I want a thumbnail", scroll: "SCROLL ↓",
      workEyebrow: "01 / WORK", workTitle: "What I've\n|created.|", workText: "Thumbnails made for different ideas, styles and types of content.",
      meta1: "04 PROJECTS", meta2: "100% DESIGN", open: "OPEN",
      stmtEyebrow: "02 / MY APPROACH", stmt: "A good thumbnail has to |sell the click| before the viewer ever sees the video.", howWork: "How I work ↓",
      processEyebrow: "03 / PROCESS", processTitle: "Simple.\n|Direct.|", processText: "No unnecessary steps. Every part has a purpose.",
      s1t: "You tell me the idea", s1p: "What the video is about, what you want to highlight and the style you're after.",
      s2t: "I build the scene", s2p: "Characters, backgrounds, text, colors and composition working together.",
      s3t: "We add impact", s3p: "Retouching, contrast and details so it works even at small sizes.",
      s4t: "Ready to publish", s4p: "I deliver the final thumbnail in high quality.",
      aboutEyebrow: "04 / ABOUT", aboutTitle: "Design made to\n|get noticed.|",
      aboutText: "I'm Jhonarki and I love turning simple ideas into thumbnails that feel big. I focus on composition, characters, retouching and details that give an image presence.",
      sk1: "RETOUCHING", sk2: "COMPOSITION",
      contactEyebrow: "05 / CONTACT", contactTitle: "WANT TO\nWORK WITH\nME?", contactSub: "LET'S TALK.",
      contactText: "Tell me what you have in mind and we'll turn the idea into a thumbnail that stands out.",
      mail: "Email", copyHint: "Click to copy my Discord username.", copied: "Copied: "
    }
  };
  let lang = "es";
  function render(el, text) {
    el.textContent = "";
    const wrap = el.dataset.wrap;
    text.split("|").forEach((seg, i) => {
      const host = (i % 2 && wrap) ? el.appendChild(document.createElement(wrap)) : el;
      seg.split("\n").forEach((line, j) => {
        if (j) host.appendChild(document.createElement("br"));
        host.appendChild(document.createTextNode(line));
      });
    });
  }
  function setLanguage(l) {
    if (!Object.hasOwn(T, l)) l = "es";
    lang = l; document.documentElement.lang = l;
    $$("[data-i18n]").forEach(el => { const v = T[l][el.dataset.i18n]; if (v !== undefined) render(el, v); });
    $$(".lang").forEach(b => { const on = b.dataset.lang === l; b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on)); });
    store.set("jhonarki-lang", l);
  }
  $$(".lang").forEach(b => b.addEventListener("click", () => setLanguage(b.dataset.lang)));
  setLanguage(store.get("jhonarki-lang") === "en" ? "en" : "es");

  /* Tema */
  const themeBtn = $("#theme");
  themeBtn.addEventListener("click", () => {
    const calm = document.body.classList.toggle("calm");
    themeBtn.textContent = calm ? "☀" : "◐";
  });

  /* Copiar Discord */
  const dBtn = $(".discord-copy"), note = $("#copy-note");
  let timer;
  dBtn.addEventListener("click", async () => {
    const v = dBtn.dataset.discord;
    let ok = true;
    try { await navigator.clipboard.writeText(v); } catch { ok = false; }
    note.textContent = ok ? T[lang].copied + v : "Discord: " + v;
    clearTimeout(timer);
    timer = setTimeout(() => { note.textContent = T[lang].copyHint; }, 2200);
  });
})();
