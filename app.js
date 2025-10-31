// Edita con tu número y correo
const WHATSAPP_NUMBER = "573012304799";
const EMAIL_TO = "gradivacolombia@gmail.com";

// Utilidades
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Ejecuta cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  setupSplash();
  setupYear();
  setupHeaderScroll();
  setupMobileNav();
  setupHeroSlider();
  setupParallax();
  setupRevealObserver();
  setupTopbarCTA();
  setupCTAs();
});

/* Splash: muestra logo al inicio y desvanece */
function setupSplash(){
  const splash = document.querySelector('.splash');
  if (!splash) return;

  const hide = () => {
    if (!splash) return;
    splash.classList.add('splash--hide');
    const remove = () => splash.remove();
    splash.addEventListener('transitionend', remove, { once: true });
    // Fallback por si no dispara transitionend
    setTimeout(() => splash?.remove(), 800);
  };

  // Clic o tecla para cerrar antes
  splash.addEventListener('click', hide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') hide();
  }, { once: true });

  // Al terminar de cargar recursos, oculta tras 5 segundos
  window.addEventListener('load', () => setTimeout(hide, 2000));
}

/* Año en footer */
function setupYear(){
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

/* Header: blur + sombra al hacer scroll */
function setupHeaderScroll(){
  const header = $("#site-header");
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});
}

/* Menú móvil accesible */
function setupMobileNav(){
  const btn = $(".menu-toggle");
  const nav = $("#main-nav");
  if (!btn || !nav) return;

  const toggle = () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", toggle);

  // Cierra al seleccionar enlace
  $$(".nav__list a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

/* Slider del hero con crossfade y autoplay */
function setupHeroSlider(){
  const slider = $(".hero__slider");
  const slides = $$(".hero__slide");
  const prevBtn = $(".hero__control--prev");
  const nextBtn = $(".hero__control--next");
  if (!slider || slides.length === 0) return;

  let index = 0;
  let timer = null;
  const INTERVAL = 7000;

  const show = (i) => {
    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
  };
  const next = () => { index = (index + 1) % slides.length; show(index); };
  const prev = () => { index = (index - 1 + slides.length) % slides.length; show(index); };

  const start = () => { stop(); timer = setInterval(next, INTERVAL); };
  const stop = () => { if (timer) clearInterval(timer); };

  // Controles
  prevBtn?.addEventListener("click", () => { prev(); start(); });
  nextBtn?.addEventListener("click", () => { next(); start(); });

  // Pausa al hover
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  // Accesibilidad por teclado
  [prevBtn, nextBtn].forEach(btn => btn?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { next(); start(); }
    if (e.key === "ArrowLeft") { prev(); start(); }
  }));

  show(index);
  start();
}

/* Parallax sutil del texto en hero utilizando rAF */
function setupParallax(){
  const content = $(".hero__content");
  const hero = $(".hero");
  if (!content || !hero) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    // Desplaza entre 0 y ~20px según el scroll
    const progress = Math.min(1, Math.max(0, (0 - rect.top) / (rect.height || 1)));
    const offset = Math.round(progress * 20);
    content.style.setProperty("--parallax", `${offset}px`);
  };
  const onScroll = () => {
    if (!ticking){ requestAnimationFrame(update); ticking = true; }
  };
  update();
  window.addEventListener("scroll", onScroll, {passive:true});
}

/* Reveal on scroll para secciones y tarjetas */
function setupRevealObserver(){
  const nodes = $$(".reveal, .card");
  if (nodes.length === 0) return;

  const obs = new IntersectionObserver((entries, io) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add("show");
        io.unobserve(e.target);
      }
    });
  }, {rootMargin: "0px 0px -10% 0px", threshold: 0.1});

  nodes.forEach(n => obs.observe(n));
}

/* CTA de Topbar con número de WhatsApp */
function setupTopbarCTA(){
  const topbarWA = $("#topbar-whatsapp");
  if (topbarWA){
    const msg = encodeURIComponent("Hola, quisiera más información sobre sus servicios legales.");
    topbarWA.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }
  const heroWA = $("#cta-hero-whatsapp");
  if (heroWA){
    const msg = encodeURIComponent("Hola, me gustaría agendar una consulta.");
    heroWA.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  }
}

/* Handlers de envío por WhatsApp y correo + validación básica */
function setupCTAs(){
  const form = $("#contact-form");
  const btnWA = $("#send-whatsapp");
  const btnEmail = $("#send-email");
  if (!form || !btnWA || !btnEmail) return;

  const fields = {
    nombre: $("#nombre"),
    telefono: $("#telefono"),
    correo: $("#correo"),
    mensaje: $("#mensaje"),
  };

  const setError = (el, msg) => {
    const err = el.parentElement.querySelector(".field__error");
    if (err) err.textContent = msg || "";
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  };

  const validate = () => {
    let ok = true;
    // Nombre
    if (!fields.nombre.value.trim()){
      setError(fields.nombre, "Por favor ingresa tu nombre.");
      ok = false;
    } else setError(fields.nombre, "");

    // Teléfono (mínimo 7 dígitos)
    const digits = fields.telefono.value.replace(/\D+/g,"");
    if (digits.length < 7){
      setError(fields.telefono, "Ingresa un teléfono válido.");
      ok = false;
    } else setError(fields.telefono, "");

    // Correo (opcional)
    if (fields.correo.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.correo.value)){
      setError(fields.correo, "El correo no parece válido.");
      ok = false;
    } else setError(fields.correo, "");

    // Mensaje
    if (!fields.mensaje.value.trim() || fields.mensaje.value.trim().length < 5){
      setError(fields.mensaje, "Cuéntanos brevemente tu consulta.");
      ok = false;
    } else setError(fields.mensaje, "");

    return ok;
  };

  const buildText = () => {
    const nombre = fields.nombre.value.trim();
    const tel = fields.telefono.value.trim();
    const correo = fields.correo.value.trim();
    const mensaje = fields.mensaje.value.trim();

    const body =
`Hola, soy ${nombre}.
Teléfono: ${tel}${correo ? `\nCorreo: ${correo}` : ""}
Mensaje:
${mensaje}

Enviado desde el sitio web de Chocontá & Jiménez — Abogadas.`;

    return {subject: `Consulta legal — ${nombre}`, body};
  };

  btnWA.addEventListener("click", () => {
    if (!validate()) return;
    const { body } = buildText();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    window.open(url, "_blank", "noopener");
  });

  btnEmail.addEventListener("click", () => {
    if (!validate()) return;
    const { subject, body } = buildText();
    const url = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  });
}
