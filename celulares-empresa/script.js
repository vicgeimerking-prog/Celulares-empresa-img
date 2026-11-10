// ===== Datos de ejemplo (se usan si no hay Google Sheet configurada) =====
const EJEMPLO = [
  { marca: "OPPO", modelo: "A54", precio: "3499", precio_anterior: "3999", procesador: "Helio P35", ram: "4 GB", almacenamiento: "128 GB", camara: "13 MP + 2 MP + 2 MP", bateria: "5000 mAh", pantalla: '6.51" HD+', color: "Azul", foto: "", descripcion: "Batería para todo el día y triple cámara con IA.", etiqueta: "Oferta", disponible: "si" },
  { marca: "Apple", modelo: "iPhone 15", precio: "15999", precio_anterior: "", procesador: "A16 Bionic", ram: "6 GB", almacenamiento: "128 GB", camara: "48 MP + 12 MP", bateria: "3349 mAh", pantalla: '6.1" OLED', color: "Negro", foto: "", descripcion: "Dynamic Island, USB-C y cámara principal de 48 MP.", etiqueta: "Nuevo", disponible: "si" },
  { marca: "Samsung", modelo: "Galaxy A55", precio: "7999", precio_anterior: "8999", procesador: "Exynos 1480", ram: "8 GB", almacenamiento: "256 GB", camara: "50 MP + 12 MP + 5 MP", bateria: "5000 mAh", pantalla: '6.6" AMOLED 120 Hz', color: "Lila", foto: "", descripcion: "Diseño en metal y cristal, resistente al agua IP67.", etiqueta: "Oferta", disponible: "si" },
  { marca: "Xiaomi", modelo: "Redmi Note 13", precio: "4999", precio_anterior: "", procesador: "Snapdragon 685", ram: "8 GB", almacenamiento: "256 GB", camara: "108 MP + 8 MP + 2 MP", bateria: "5000 mAh", pantalla: '6.67" AMOLED 120 Hz', color: "Verde", foto: "", descripcion: "Cámara de 108 MP y carga rápida de 33 W.", etiqueta: "", disponible: "si" },
  { marca: "Motorola", modelo: "Moto G84", precio: "5499", precio_anterior: "", procesador: "Snapdragon 695", ram: "12 GB", almacenamiento: "256 GB", camara: "50 MP + 8 MP", bateria: "5000 mAh", pantalla: '6.55" pOLED', color: "Magenta", foto: "", descripcion: "12 GB de RAM y pantalla pOLED de 120 Hz.", etiqueta: "", disponible: "no" },
  { marca: "Samsung", modelo: "Galaxy S24", precio: "17499", precio_anterior: "", procesador: "Exynos 2400", ram: "8 GB", almacenamiento: "256 GB", camara: "50 MP + 12 MP + 10 MP", bateria: "4000 mAh", pantalla: '6.2" AMOLED 120 Hz', color: "Gris", foto: "", descripcion: "Galaxy AI, zoom óptico 3x y 7 años de actualizaciones.", etiqueta: "Nuevo", disponible: "si" },
];

// Especificaciones que se muestran (columna de la Sheet → etiqueta)
const SPECS = [
  ["procesador", "Procesador", "⚡"],
  ["ram", "RAM", "🧠"],
  ["almacenamiento", "Almacenamiento", "💾"],
  ["camara", "Cámara", "📷"],
  ["bateria", "Batería", "🔋"],
  ["pantalla", "Pantalla", "📱"],
  ["color", "Color", "🎨"],
];
const SPECS_TARJETA = ["procesador", "ram", "almacenamiento", "camara", "bateria"];

// Lee el número más grande de un texto: "50 MP + 12 MP" → 50
const maxNum = (t) => Math.max(0, ...(String(t || "").match(/\d+(\.\d+)?/g) || []).map(Number));

// Accesos rápidos "Dinos qué buscas" (se calculan solos con los datos de la Sheet)
const USOS = [
  { id: "camara", icono: "📸", titulo: "Mejor cámara", texto: "Fotos de 50 MP o más", g: "linear-gradient(135deg,#7c3aed,#db2777)", test: (c) => maxNum(c.camara) >= 50 },
  { id: "bateria", icono: "🔋", titulo: "Batería que dura", texto: "5000 mAh o más", g: "linear-gradient(135deg,#059669,#0d9488)", test: (c) => maxNum(c.bateria) >= 5000 },
  { id: "economico", icono: "💰", titulo: "Económicos", texto: "Menos de $5,000", g: "linear-gradient(135deg,#f59e0b,#ea580c)", test: (c) => numero(c.precio) > 0 && numero(c.precio) < 5000 },
  { id: "potente", icono: "🚀", titulo: "Más potentes", texto: "8 GB de RAM o más", g: "linear-gradient(135deg,#2563eb,#7c3aed)", test: (c) => maxNum(c.ram) >= 8 },
];

const PALABRAS = ["tomar fotos", "jugar", "trabajar", "tus redes", "todo el día"];

let celulares = [];
let marcaActiva = "Todas";
let usoActivo = null;
const seleccion = new Set();

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ===== Utilidades =====

function parseCSV(texto) {
  const filas = [];
  let fila = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n") { fila.push(campo); filas.push(fila); fila = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }

  const normalizar = (h) => h.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_");
  const encabezados = filas.shift().map(normalizar);
  return filas
    .filter((f) => f.some((v) => v.trim()))
    .map((f) => Object.fromEntries(encabezados.map((h, i) => [h, (f[i] || "").trim()])));
}

const COLORES = { negro: "#1f2937", azul: "#2563eb", gris: "#6b7280", verde: "#059669", lila: "#a78bfa", morado: "#7c3aed", magenta: "#c026d3", rosa: "#ec4899", rojo: "#dc2626", blanco: "#e5e7eb", dorado: "#ca8a04", plata: "#9ca3af" };

// Silueta de celular cuando no hay foto
function fotoGenerica(c) {
  const col = COLORES[(c.color || "").toLowerCase()] || "#7c3aed";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="#1e0a3c"/></linearGradient><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c1d95"/><stop offset=".6" stop-color="#a21caf"/><stop offset="1" stop-color="#f472b6"/></linearGradient></defs><rect x="40" y="20" width="120" height="260" rx="22" fill="url(#g)"/><rect x="47" y="27" width="106" height="246" rx="16" fill="url(#p)"/><rect x="85" y="34" width="30" height="8" rx="4" fill="#0b0218"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function urlFoto(c) {
  const url = c.foto;
  if (!url) return fotoGenerica(c);
  const m = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
  if (url.includes("drive.google.com") && m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`;
  return url;
}

function numero(p) { return Number(String(p || "").replace(/[^\d.]/g, "")) || 0; }

function formatoPrecio(p) {
  const n = numero(p);
  if (!n) return p || "Consultar";
  return n.toLocaleString("es-MX", { style: "currency", currency: CONFIG.moneda, maximumFractionDigits: 0 });
}

function disponible(c) {
  return !["no", "agotado", "false", "0"].includes((c.disponible || "si").toLowerCase());
}

function linkWhats(msg) {
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}

function msgEquipo(c) {
  return `Hola, me interesa el ${c.marca} ${c.modelo}${c.almacenamiento ? " de " + c.almacenamiento : ""} (${formatoPrecio(c.precio)}). ¿Está disponible?`;
}

function esc(t) {
  return String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function etiquetaHTML(c) {
  if (!disponible(c)) return '<span class="etiqueta etiqueta--agotado">Agotado</span>';
  const e = (c.etiqueta || "").trim();
  const oferta = numero(c.precio_anterior) > numero(c.precio);
  if (oferta && !e) return '<span class="etiqueta etiqueta--oferta">Oferta</span>';
  if (!e) return "";
  return `<span class="etiqueta ${/oferta/i.test(e) ? "etiqueta--oferta" : ""}">${esc(e)}</span>`;
}

function precioHTML(c) {
  const ant = numero(c.precio_anterior) > numero(c.precio) ? `<span class="precio-ant">${formatoPrecio(c.precio_anterior)}</span>` : "";
  return `<div class="precio">${ant}${formatoPrecio(c.precio)}</div>`;
}

function specsHTML(c, claves) {
  return `<ul class="specs">${SPECS.filter(([k]) => (!claves || claves.includes(k)) && c[k])
    .map(([k, l, ico]) => `<li><span><i class="spec__icono">${ico}</i>${l}</span><span>${esc(c[k])}</span></li>`).join("")}</ul>`;
}

function descuento(c) {
  const p = numero(c.precio), a = numero(c.precio_anterior);
  return a > p && p ? Math.round((1 - p / a) * 100) : 0;
}

// Barras de "qué tan bueno es" en cada aspecto (0 a 100)
function nivelesHTML(c) {
  const niveles = [
    ["📷 Cámara", Math.min(100, (maxNum(c.camara) / 108) * 100), maxNum(c.camara) ? maxNum(c.camara) + " MP" : ""],
    ["🔋 Batería", Math.min(100, (maxNum(c.bateria) / 6000) * 100), maxNum(c.bateria) ? maxNum(c.bateria) + " mAh" : ""],
    ["🧠 Velocidad", Math.min(100, (maxNum(c.ram) / 12) * 100), maxNum(c.ram) ? maxNum(c.ram) + " GB" : ""],
    ["💾 Espacio", Math.min(100, (maxNum(c.almacenamiento) / 512) * 100), maxNum(c.almacenamiento) ? maxNum(c.almacenamiento) + " GB" : ""],
  ].filter(([, , v]) => v);
  if (!niveles.length) return "";
  return `<div class="niveles">${niveles.map(([l, pct, v]) =>
    `<div class="nivel"><span>${l}</span><div class="nivel__barra"><i data-w="${Math.max(8, pct)}"></i></div><b>${esc(v)}</b></div>`).join("")}</div>`;
}

// ===== Render =====

function renderFiltros() {
  const marcas = ["Todas", ...new Set(celulares.map((c) => c.marca).filter(Boolean))];
  $("#filtros").innerHTML = marcas
    .map((m) => `<button class="chip ${m === marcaActiva ? "activo" : ""}" data-marca="${esc(m)}">${esc(m)}</button>`)
    .join("");
}

function renderGrid() {
  const q = $("#buscador").value.toLowerCase().trim();
  const orden = $("#orden").value;
  let lista = celulares
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => (marcaActiva === "Todas" || c.marca === marcaActiva) && `${c.marca} ${c.modelo}`.toLowerCase().includes(q))
    .filter(({ c }) => !usoActivo || usoActivo.test(c));

  const aviso = $("#usoActivo");
  aviso.hidden = !usoActivo;
  if (usoActivo) aviso.innerHTML = `${usoActivo.icono} Mostrando: <strong>${usoActivo.titulo}</strong> (${usoActivo.texto}) <button data-quitar-uso>Quitar ✕</button>`;

  if (orden) lista.sort((a, b) => (numero(a.c.precio) - numero(b.c.precio)) * (orden === "asc" ? 1 : -1));
  else lista.sort((a, b) => disponible(b.c) - disponible(a.c)); // agotados al final

  $("#estado").textContent = lista.length ? "" : "No se encontraron modelos con esa búsqueda.";
  $("#grid").innerHTML = lista.map(({ c, i }, n) => `
    <article class="card revelar ${disponible(c) ? "" : "card--agotado"}" data-i="${i}" style="--d:${(n % 4) * 0.08}s">
      <span class="card__luz"></span>
      ${etiquetaHTML(c)}
      <label class="comparar-check"><input type="checkbox" data-comparar="${i}" ${seleccion.has(i) ? "checked" : ""}> Comparar</label>
      <div class="card__img" data-detalle="${i}">
        <img src="${urlFoto(c)}" alt="${esc(c.marca + " " + c.modelo)}" loading="lazy">
        <span class="card__ver">👁 Ver detalles</span>
      </div>
      <div class="card__nombre"><h3>${esc(c.modelo)}</h3><span>${esc(c.marca)}</span></div>
      ${specsHTML(c, SPECS_TARJETA)}
      <div class="card__pie">
        <div>${precioHTML(c)}${descuento(c) ? `<span class="card__ahorro">Ahorras ${formatoPrecio(numero(c.precio_anterior) - numero(c.precio))}</span>` : ""}</div>
        <button class="btn btn--morado btn--chico" data-detalle="${i}">Ver más</button>
      </div>
    </article>`).join("");
  observarRevelar();
  activarTilt();
}

function renderUsos() {
  $("#usos").innerHTML = USOS.map((u) => {
    const n = celulares.filter(u.test).length;
    return `<button class="uso revelar ${usoActivo === u ? "activo" : ""}" data-uso="${u.id}" style="--g:${u.g}">
      <span class="uso__icono">${u.icono}</span>
      <strong>${u.titulo}</strong>
      <small>${u.texto}</small>
      <span class="uso__cuenta">${n} modelo${n === 1 ? "" : "s"}</span>
    </button>`;
  }).join("");
  $$(".uso").forEach((el, i) => el.style.setProperty("--d", i * 0.08 + "s"));
}

function renderOfertas() {
  const ofertas = celulares.map((c, i) => ({ c, i })).filter(({ c }) => descuento(c) && disponible(c));
  $("#ofertas").hidden = !ofertas.length;
  $("#carrusel").innerHTML = ofertas.map(({ c, i }) => `
    <article class="oferta" data-detalle="${i}">
      <span class="oferta__desc">-${descuento(c)}%</span>
      <img src="${urlFoto(c)}" alt="${esc(c.modelo)}">
      <div>
        <small>${esc(c.marca)}</small>
        <h3>${esc(c.modelo)}</h3>
        ${precioHTML(c)}
        <span class="oferta__ahorro">Ahorras ${formatoPrecio(numero(c.precio_anterior) - numero(c.precio))}</span>
      </div>
    </article>`).join("");
}

function renderMarcas() {
  const marcas = [...new Set(celulares.map((c) => c.marca).filter(Boolean))];
  if (!marcas.length) return;
  const bloque = Array(Math.ceil(8 / marcas.length)).fill(marcas).flat();
  $("#marcasPista").innerHTML = [...bloque, ...bloque].map((m) => `<span>${esc(m)}</span>`).join("");
}

// ===== Efectos =====

let obsRevelar;
function observarRevelar() {
  if (!obsRevelar) {
    obsRevelar = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("visible"); obsRevelar.unobserve(en.target); }
    }), { threshold: 0.12 });
  }
  $$(".revelar:not(.visible)").forEach((el) => obsRevelar.observe(el));
}

function activarTilt() {
  if (!matchMedia("(hover: hover)").matches) return;
  $$(".card").forEach((card) => {
    if (card.dataset.tilt) return;
    card.dataset.tilt = 1;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--x", x * 100 + "%");
      card.style.setProperty("--y", y * 100 + "%");
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-5px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

function contar(el, final) {
  const inicio = performance.now(), dur = 1200;
  const paso = (t) => {
    const p = Math.min(1, (t - inicio) / dur);
    el.textContent = Math.round(final * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

function rotarPalabra() {
  const el = $("#palabraRotativa");
  let i = 0;
  setInterval(() => {
    el.classList.add("saliendo");
    setTimeout(() => { i = (i + 1) % PALABRAS.length; el.textContent = PALABRAS[i]; el.classList.remove("saliendo"); }, 350);
  }, 2400);
}

function abrirModal(html) {
  $("#modalContenido").innerHTML = html;
  $("#modal").hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => requestAnimationFrame(() =>
    $$(".nivel__barra i").forEach((b) => (b.style.width = b.dataset.w + "%"))));
}

function cerrarModal() {
  $("#modal").hidden = true;
  document.body.style.overflow = "";
}

function abrirDetalle(c) {
  abrirModal(`
    <div class="detalle">
      <div class="detalle__img"><img src="${urlFoto(c)}" alt="${esc(c.modelo)}"></div>
      <div>
        <span class="detalle__marca">${esc(c.marca)}</span>
        <h2>${esc(c.modelo)}</h2>
        ${c.descripcion ? `<p class="detalle__desc">${esc(c.descripcion)}</p>` : ""}
        ${nivelesHTML(c)}
        ${specsHTML(c)}
        ${precioHTML(c)}
        <div class="detalle__botones">
          ${disponible(c)
            ? `<a class="btn btn--whats" href="${linkWhats(msgEquipo(c))}" target="_blank" rel="noopener">💬 Lo quiero</a>`
            : `<a class="btn btn--morado" href="${linkWhats(`Hola, ¿cuándo vuelve a estar disponible el ${c.marca} ${c.modelo}?`)}" target="_blank" rel="noopener">Avísame cuando llegue</a>`}
        </div>
      </div>
    </div>`);
}

function abrirComparador() {
  const lista = [...seleccion].map((i) => celulares[i]);
  const filas = [["precio", "Precio"], ...SPECS];
  abrirModal(`
    <h2 class="titulo-modal">Comparar modelos</h2>
    <div class="tabla-comp-wrap">
      <table class="tabla-comp">
        <thead><tr><th></th>${lista.map((c) => `<th><img src="${urlFoto(c)}" alt=""><strong>${esc(c.modelo)}</strong><br><small>${esc(c.marca)}</small></th>`).join("")}</tr></thead>
        <tbody>
          ${filas.map(([k, l]) => `<tr><td>${l}</td>${lista.map((c) => `<td>${k === "precio" ? `<strong>${formatoPrecio(c.precio)}</strong>` : esc(c[k] || "—")}</td>`).join("")}</tr>`).join("")}
          <tr><td></td>${lista.map((c) => `<td>${disponible(c) ? `<a class="btn btn--whats btn--chico" href="${linkWhats(msgEquipo(c))}" target="_blank" rel="noopener">Lo quiero</a>` : "Agotado"}</td>`).join("")}</tr>
        </tbody>
      </table>
    </div>`);
}

function actualizarBarraComparar() {
  $("#compararBarra").hidden = seleccion.size === 0;
  $("#compararTexto").textContent = `${seleccion.size} de 3 seleccionados`;
  $("#btnComparar").disabled = seleccion.size < 2;
  $("#btnComparar").style.opacity = seleccion.size < 2 ? .5 : 1;
}

// ===== Contenido desde CONFIG =====

function renderContenido() {
  $$(".js-nombre").forEach((el) => (el.textContent = CONFIG.nombreEmpresa));
  $$(".js-eslogan").forEach((el) => (el.textContent = CONFIG.eslogan));
  $$(".js-whats-general").forEach((el) => (el.href = linkWhats("Hola, quiero información sobre sus celulares")));
  document.title = `${CONFIG.nombreEmpresa} | Catálogo de celulares`;
  $("#anio").textContent = new Date().getFullYear();
  $("#metodosPago").innerHTML = CONFIG.metodosPago.map((m) => `<span>${esc(m)}</span>`).join("");
  $("#entregas").innerHTML = CONFIG.entregas.map((m) => `<span>${esc(m)}</span>`).join("");
  $("#horario").textContent = CONFIG.horario;
  $("#direccion").textContent = CONFIG.direccion;
  $("#listaTerminos").innerHTML = CONFIG.terminos
    .map((t, i) => `<details ${i === 0 ? "open" : ""}><summary>${esc(t.titulo)}</summary><p>${esc(t.texto)}</p></details>`)
    .join("");

  if (CONFIG.imagenHero) {
    const hero = $("#inicio");
    hero.classList.add("hero--foto");
    hero.style.backgroundImage = `url("${CONFIG.imagenHero}")`;
  }
}

// ===== Carga de datos =====

async function cargarCatalogo() {
  if (!CONFIG.sheetCSV) return EJEMPLO;
  try {
    const sep = CONFIG.sheetCSV.includes("?") ? "&" : "?";
    const res = await fetch(`${CONFIG.sheetCSV}${sep}t=${Date.now()}`);
    if (!res.ok) throw new Error(res.status);
    return parseCSV(await res.text());
  } catch (e) {
    console.error("No se pudo cargar la Google Sheet:", e);
    $("#estado").textContent = "No se pudo cargar el catálogo. Intenta más tarde.";
    return [];
  }
}

// ===== Eventos =====

function eventos() {
  $("#buscador").addEventListener("input", renderGrid);
  $("#orden").addEventListener("change", renderGrid);

  $("#filtros").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    marcaActiva = b.dataset.marca;
    renderFiltros();
    renderGrid();
  });

  $("#grid").addEventListener("click", (e) => {
    const d = e.target.closest("[data-detalle]");
    if (d) abrirDetalle(celulares[d.dataset.detalle]);
  });

  $("#grid").addEventListener("change", (e) => {
    const cb = e.target.closest("[data-comparar]");
    if (!cb) return;
    const i = Number(cb.dataset.comparar);
    if (cb.checked) {
      if (seleccion.size >= 3) { cb.checked = false; alertaBreve("Puedes comparar hasta 3 modelos"); return; }
      seleccion.add(i);
    } else seleccion.delete(i);
    actualizarBarraComparar();
  });

  // Accesos "Dinos qué buscas"
  $("#usos").addEventListener("click", (e) => {
    const b = e.target.closest("[data-uso]");
    if (!b) return;
    const u = USOS.find((x) => x.id === b.dataset.uso);
    usoActivo = usoActivo === u ? null : u;
    renderUsos(); $$(".uso").forEach((el) => el.classList.add("visible"));
    renderGrid();
    if (usoActivo) $("#catalogo").scrollIntoView({ behavior: "smooth" });
  });
  $("#usoActivo").addEventListener("click", (e) => {
    if (!e.target.closest("[data-quitar-uso]")) return;
    usoActivo = null;
    renderUsos(); $$(".uso").forEach((el) => el.classList.add("visible"));
    renderGrid();
  });

  // Carrusel de ofertas
  $("#carrusel").addEventListener("click", (e) => {
    const d = e.target.closest("[data-detalle]");
    if (d) abrirDetalle(celulares[d.dataset.detalle]);
  });
  $$("[data-mover]").forEach((b) => b.addEventListener("click", () => {
    const car = $("#carrusel");
    car.scrollBy({ left: car.clientWidth * 0.8 * Number(b.dataset.mover), behavior: "smooth" });
  }));

  $("#btnComparar").addEventListener("click", () => seleccion.size >= 2 && abrirComparador());
  $("#btnLimpiar").addEventListener("click", () => { seleccion.clear(); actualizarBarraComparar(); renderGrid(); });

  $("#modal").addEventListener("click", (e) => e.target.hasAttribute("data-cerrar") && cerrarModal());
  document.addEventListener("keydown", (e) => e.key === "Escape" && cerrarModal());

  // Menú móvil
  $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("nav--abierto"));
  $$(".nav__link").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("nav--abierto")));

  // Header sólido al hacer scroll
  const header = $("#header");
  const alScroll = () => {
    header.classList.toggle("header--solido", scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    $("#progreso").style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  };
  addEventListener("scroll", alScroll, { passive: true });
  alScroll();

  // Resalta la sección actual en el menú
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (en.isIntersecting) {
        $$(".nav__link").forEach((a) => a.classList.toggle("nav__link--activo", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["catalogo", "comprar", "terminos"].forEach((id) => obs.observe(document.getElementById(id)));
}

function alertaBreve(texto) {
  const t = $("#compararTexto");
  const antes = t.textContent;
  t.textContent = texto;
  setTimeout(() => (t.textContent = antes), 1800);
}

// ===== Inicio =====

async function init() {
  renderContenido();
  eventos();
  celulares = await cargarCatalogo();
  $("#totalModelos").dataset.final = celulares.length;
  $("#totalMarcas").dataset.final = new Set(celulares.map((c) => c.marca)).size;
  $$("[data-contar]").forEach((el) => contar(el, Number(el.dataset.final)));
  rotarPalabra();
  renderMarcas();
  renderUsos();
  renderOfertas();
  renderFiltros();
  renderGrid();
  observarRevelar();
}

init();
