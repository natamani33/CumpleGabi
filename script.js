/* ===== CONFIGURACIÓN: edita aquí el nombre y la fecha ===== */
const CONFIG = {
  nombre: "Gabi",
  fecha: "7 de octubre de 2026",
};

const $ = (sel) => document.querySelector(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Pone el nombre y la fecha en todos los elementos que lo pidan
document.querySelectorAll("[data-nombre]").forEach((el) => (el.textContent = CONFIG.nombre));
document.querySelectorAll("[data-fecha]").forEach((el) => (el.textContent = CONFIG.fecha));

/* ===== NAVEGACIÓN ENTRE ETAPAS ===== */
function goTo(id) {
  document.querySelectorAll(".stage").forEach((s) => {
    s.classList.toggle("is-active", s.id === id);
    if (s.id === id) s.scrollTop = 0; // cada etapa empieza desde arriba
  });
}

async function changeStage(id) {
  const curtain = $("#curtain");
  curtain.classList.add("is-on");   // la pantalla se oscurece
  await wait(950);
  goTo(id);                          // cambiamos de etapa "a oscuras"
  await wait(150);
  curtain.classList.remove("is-on"); // y la cortina se retira
}

/* ===== ETAPA 1 ===== */
const cake = $("#cake");
const candle = $("#candle");
const copy = document.querySelector(".copy");
const message = $("#message");
const continueBtn = $("#continue");

// Partículas doradas de fondo (muy sutiles; menos en pantallas pequeñas)
function createSpecks() {
  const box = $("#specks");
  const count = innerWidth < 500 ? 10 : 16;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = 9 + Math.random() * 9 + "s";
    s.style.animationDelay = -Math.random() * 12 + "s";
    box.appendChild(s);
  }
}

// Secuencia de entrada: torta -> frase 1 -> frase 2 -> pista
async function playIntro() {
  await wait(300);  cake.classList.add("is-visible");
  await wait(1700); $("#line1").classList.add("is-visible");
  await wait(1900); $("#line2").classList.add("is-visible");
  await wait(1900); $("#hint").classList.add("is-visible");
  candle.disabled = false; // recién ahora se puede tocar la vela
}

// Al tocar la vela
async function blowOut() {
  candle.disabled = true;
  cake.classList.add("is-out");   // apaga la llama y suelta humo
  copy.classList.add("is-done");  // oculta el texto de introducción
  launchConfetti();
  await wait(900);
  message.classList.add("is-visible");
  await wait(1300);
  message.classList.add("is-ready");
  continueBtn.disabled = false;
}

/* ===== CONFETI (canvas) ===== */
function launchConfetti() {
  if (reduceMotion) return;
  const canvas = $("#confetti");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // limita para cuidar el rendimiento
  // Se usa el tamaño real del canvas (no innerWidth/innerHeight) para que no falle
  // cuando la barra del navegador móvil aparece o desaparece.
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const colors = ["#C9A24B", "#F6EFE2", "#8E1F36", "#E3C98A", "#B8334A"];
  const r = candle.getBoundingClientRect();
  const originX = r.left + r.width / 2, originY = r.top + r.height * 0.2;
  const spread = Math.min(W / 40, 9); // en pantallas angostas el confeti no sale volando fuera

  const count = W < 500 ? 60 : 90;    // menos piezas en celulares
  const pieces = Array.from({ length: count }, () => ({
    x: originX, y: originY,
    vx: (Math.random() - 0.5) * spread * 1.2, vy: -Math.random() * 9 - 3,
    size: 5 + Math.random() * 5,
    rot: Math.random() * 6, vrot: (Math.random() - 0.5) * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
    heart: Math.random() < 0.2,
    life: 1,
  }));

  let last = performance.now();
  (function frame(now) {
    const dt = Math.min((now - last) / 16.7, 2); last = now;
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of pieces) {
      p.vy += 0.18 * dt; p.vx *= 0.99;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vrot * dt; p.life -= 0.005 * dt;
      if (p.life <= 0 || p.y > H + 20) continue;
      alive = true;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      if (p.heart) { ctx.font = p.size * 2 + "px serif"; ctx.textAlign = "center"; ctx.fillText("♥", 0, 0); }
      else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
  })(last);
}

/* ===== EVENTOS ===== */
candle.addEventListener("click", blowOut, { once: true });
continueBtn.addEventListener("click", () => changeStage("stage-diario"));

createSpecks();
playIntro();


/* =====================================================================
   ETAPA 2 — DIARIO / CARTA
   (código nuevo; la etapa 1 de arriba no se modifica)
   ===================================================================== */

/* ---------- TEXTO DE LA CARTA: edita aquí cada página ----------
   - encabezado: título pequeño arriba de la página
   - fecha: opcional (déjala "" si no quieres que aparezca)
   - parrafos: cada elemento es un párrafo. Puede ser un texto, o { t: "texto", tipo: "..." }
     donde tipo puede ser "saludo" o "destacado" (solo cambia el estilo, no el texto)
   - {nombre} (si lo escribes) se reemplaza por CONFIG.nombre
   Para agregar una página, copia un bloque { ... } completo. */
const CARTA = [
  {
    encabezado: "Cómo empezó todo",
    fecha: "",
    parrafos: [
      { t: "Gabi,", tipo: "saludo" },
      "No sé muy bien por dónde empezar esta carta, porque siento que hay demasiadas cosas que quiero decirte y que, si intento ponerlas todas de una vez, probablemente termine escribiendo un libro entero JAJAJAJAJ.",
      "Pero creo que quiero empezar por algo que siempre me ha parecido muy bonito y lindo de recordar: pensar en cómo empezó nuestra amistad.",
      "Si uno se pone a pensar, nosotras ya nos habíamos visto antes, incluso desde el colegio, pero en ese momento jamás me imaginé que unos años después ibas a convertirte en una de las personas más importantes para mí.",
      "Y creo que eso es de las cosas más bonitas que tiene la vida. A veces uno conoce personas sin saber lo importantes que van a llegar a ser después.",
      "Llegó 11 y, sin que yo lo supiera, ese año iba a terminar siendo muchísimo más especial de lo que imaginaba.",
      "Porque ahí fue cuando realmente empezamos a conocernos, a hablar, a pasar tiempo juntas y, poco a poco, a construir esta amistad que hoy significa tanto para mí.",
      "Y pensar que ya han pasado casi tres años desde que salimos del colegio me parece una locura. Porque han cambiado muchísimas cosas desde entonces, pero hay algo que sigue estando ahí: nuestra amistad.",
    ],
  },
  {
    encabezado: "Llegaste cuando más te necesitaba",
    fecha: "",
    parrafos: [
      "Creo que hay algo que nunca te he dicho completamente como quisiera.",
      "Tú llegaste a mi vida en un momento en el que, aunque probablemente no lo pareciera desde afuera, yo necesitaba muchísimo tener a alguien.",
      "Llevaba años con mis amigas en el colegio. Personas con las que había crecido desde pequeña y que pensé que iban a estar siempre ahí. Pero cuando llegamos a los últimos años, las cosas empezaron a cambiar. Las amistades se fueron complicando, aparecieron problemas y poco a poco terminé sintiéndome muy sola dentro de un lugar en el que había pasado tantos años.",
      "Y entonces llegó 11.",
      "Tú también estabas pasando por tus propias cosas y, de alguna manera, terminamos encontrándonos justo en ese momento.",
      "Creo que sin siquiera darnos cuenta, nos salvamos un poquito la una a la otra.",
      "Y puede sonar exagerado decirlo así, pero para mí no lo es.",
      "Porque yo realmente no sé cómo habría sido ese último año del colegio si tú no hubieras estado.",
      "Lo que pudo haber sido uno de los peores años para mí terminó convirtiéndose en uno de los años que recuerdo con más cariño.",
      "Y gran parte de eso fue por ti.",
      "Gracias por haber estado. Gracias por hacerme compañía. Gracias por escucharme, por entenderme, por hacerme reír y simplemente por estar ahí.",
      "Tal vez para ti muchas de esas cosas fueron pequeñas o normales, pero para mí significaron muchísimo más de lo que probablemente imaginaste.",
    ],
  },
  {
    encabezado: "Todos esos recuerdos",
    fecha: "",
    parrafos: [
      "Y obviamente no puedo hablar de nuestra amistad sin acordarme de todas las bobadas que vivimos en 11.",
      "Las veces que iba a tu casa y terminábamos las dos acostadas en la cama hablando de absolutamente cualquier cosa.",
      "Las partidas de Roblox.",
      "Las idas a la plaza solamente para sentarnos a mirar gente y chismosear JQJQJQJQJQ.",
      "Halloween, cuando terminamos las dos disfrazadas de policías (y Mayra metida en todo 🙄).",
      "Y obviamente no puedo olvidarme del dúo dinámico que eran tú y Galeano. Yo podía estar ahí simplemente mirándolos molestarse y pensar: “Dios mío, qué parche tan bueno”.",
      "También están todas esas historias que probablemente para cualquier otra persona no tendrían ningún sentido, pero que para nosotras inmediatamente traen un recuerdo.",
      "El famoso man de la moto.",
      "El DJ.",
      "Santimaye.",
      "Y todas esas pequeñas cosas que probablemente ni siquiera tendrían gracia si intentáramos explicárselas a alguien más.",
      "Pero creo que precisamente eso es lo bonito de esta amistad.",
      "Tener historias que solamente nosotras entiéndenos.",
      "Tener palabras que significan muchísimo más de lo que parecen.",
      "Tener recuerdos que pueden aparecer de la nada y hacerte reír porque solamente tú sabes todo lo que hay detrás.",
      "Y creo que si algo me encanta de nuestra amistad es que no solamente tengo una amiga con la que hablo. Tengo una persona con la que tengo una historia.",
      "Una historia llena de momentos que, aunque en ese momento parecían normales, hoy miro hacia atrás y pienso: qué bonito haberlos vivido contigo.",
    ],
  },
  {
    encabezado: "Lo que eres para mí",
    fecha: "",
    parrafos: [
      "Y aunque todos esos recuerdos son importantes para mí, creo que hay algo todavía más importante que todo lo que hemos vivido.",
      "Es lo que tú eres para mí hoy.",
      "Porque han pasado los años, nos graduamos, cada una empezó su propia etapa y nuestras vidas cambiaron muchísimo.",
      "Yo estoy en la universidad, tú tienes tus propias cosas, estamos en ciudades diferentes y ya no podemos simplemente decir “voy a tu casa” como antes.",
      "Y sí, a veces me da tristeza que las cosas hayan cambiado.",
      "Pero también me hace darme cuenta de algo: nuestra amistad no depende de estar todos los días juntas.",
      "Porque incluso estando lejos, sigues siendo una de las personas con las que más siento que puedo ser yo.",
      "Yo soy una persona que muchas veces escucha más de lo que habla. Me cuesta contar lo que siento, me cuesta hablar de mis problemas y muchas veces prefiero guardarme las cosas.",
      "Y cuando intento hablar, muchas veces siento que la otra persona está esperando su turno para hablar en lugar de realmente escucharme.",
      "Contigo no siento eso.",
      "Contigo siento que puedo hablar y que realmente me estás escuchando.",
      "Y también quiero que sepas que yo siempre voy a querer escucharte a ti.",
      "No solamente cuando estés feliz o cuando todo esté bien, sino también cuando tengas un día horrible, cuando estés cansada, cuando no sepas qué hacer o simplemente cuando necesites hablar.",
      "Porque eres esa persona para mí.",
      "Una persona en la que confío.",
      "Una persona que quiero muchísimo.",
      "Una persona que, sin darse cuenta, se volvió una partecita de mi corazón.",
    ],
  },
  {
    encabezado: "Todo lo que todavía nos falta vivir",
    fecha: "",
    parrafos: [
      "Y ahora que estamos creciendo, creo que lo que más ilusión me hace es pensar en todo lo que todavía nos falta vivir.",
      "Porque si hemos logrado mantener nuestra amistad durante todos estos cambios, quiero imaginar todas las cosas que todavía vamos a hacer juntas.",
      "Quiero que viajemos.",
      "Quiero que conozcamos lugares nuevos.",
      "Quiero que algún día podamos mirar hacia atrás y decir: “¿Te acuerdas cuando estábamos en el colegio y ni siquiera imaginábamos todo lo que nos iba a pasar?”",
      "Quiero que sigamos creciendo juntas, aunque cada una vaya construyendo su propia vida.",
      "Quiero que hagamos proyectos, que cumplamos nuestras metas, que nos apoyemos en nuestras locuras y que sigamos estando presentes en las etapas importantes de la vida de la otra.",
      "Porque no quiero que nuestra amistad se quede solamente en los recuerdos del colegio.",
      "Quiero que sigamos creando recuerdos nuevos.",
      "Que algún día tengamos otras historias que contar, otras anécdotas que solamente nosotras entendamos y probablemente otras personas de las que nos burlemos juntas jajaja.",
      "Quiero verte cumplir todo lo que quieres.",
      "Y quiero estar ahí para verlo.",
    ],
  },
  {
    encabezado: "Feliz cumpleaños, Gabi",
    fecha: "",
    parrafos: [
      "Y finalmente, quiero aprovechar tu cumpleaños para recordarte algo que espero que nunca olvides.",
      "Espero que aprendas a quererte muchísimo más.",
      "Que confíes más en ti.",
      "Que nunca dudes de todo lo que eres capaz de hacer.",
      "Porque eres una persona inteligente, fuerte, cariñosa, divertida, atenta y con muchísimo para darle al mundo.",
      "Y aunque a veces la vida te haga dudar de ti misma, quiero que recuerdes que hay personas que te quieren exactamente por quien eres.",
      "Yo soy una de ellas.",
      "Y también quiero que recuerdes que tienes personas que te quieren, que te apoyan y que quieren verte feliz.",
      "Así que para este nuevo año de vida te deseo salud, amor, tranquilidad, muchísima felicidad, metas cumplidas y muchas razones para sentirte orgullosa de ti.",
      "Espero que la vida te dé todo eso que sueñas y también cosas que todavía ni siquiera sabes que quieres.",
      "Gracias por haber llegado a mi vida.",
      "Gracias por haber estado conmigo en uno de los momentos en los que más necesitaba una amiga.",
      "Gracias por todas las risas, las conversaciones, los chismes, las bobadas, los recuerdos y también por todas esas cosas que probablemente nunca te dije que significaban tanto para mí.",
      "Y sobre todo, gracias por seguir aquí.",
      { t: "Feliz cumpleaños, Gabi.", tipo: "destacado" },
      "Te quiero muchísimo y espero que nunca olvides que, aunque ahora estemos lejos y nuestras vidas estén cambiando, todavía nos queda muchísimo por vivir.",
      { t: "Esto apenas comienza. 🤍", tipo: "destacado" },
    ],
  },
];

/* ---------- Elementos ---------- */
const book = $("#book");
const pagesBox = $("#pages");
const lockBtn = $("#lock");
const diaryHint = $("#diary-hint");
const controls = $("#controls");
const prevBtn = $("#prev");
const nextBtn = $("#next");
const counter = $("#counter");
let current = 0;            // índice de la página que se está viendo
let diaryOpen = false;      // el diario ya fue desbloqueado y abierto

/* ---------- Construir las hojas a partir de CARTA ----------
   Cada hoja tiene dos caras: frente (el texto) y reverso (papel liso, se ve al girar). */
function buildLeaves() {
  CARTA.forEach((pag, i) => {
    const leaf = document.createElement("div");
    leaf.className = "leaf";
    leaf.style.zIndex = CARTA.length - i;   // la primera hoja queda arriba

    const front = document.createElement("div");
    front.className = "leaf__face leaf__front";
    front.innerHTML = `
      <article class="page">
        <header class="page__head">
          <h3 class="page__title"></h3>
          <span class="page__fecha"></span>
        </header>
        <div class="page__body">
          <div class="page__text"></div>
          <div class="page__more" aria-hidden="true">↓ sigue</div>
        </div>
        <footer class="page__num">${i + 1}</footer>
        <svg class="page__flor ${i % 2 ? "page__flor--b" : "page__flor--a"}" aria-hidden="true"><use href="#flor"/></svg>
      </article>`;
    // textContent (no innerHTML) para que cualquier texto se muestre tal cual
    front.querySelector(".page__title").textContent = pag.encabezado.replace("{nombre}", CONFIG.nombre);
    front.querySelector(".page__fecha").textContent = pag.fecha || "";
    const textBox = front.querySelector(".page__text");
    pag.parrafos.forEach((item) => {
      const p = document.createElement("p");
      const texto = typeof item === "string" ? item : item.t;
      if (item.tipo) p.className = item.tipo;
      p.textContent = texto.replace("{nombre}", CONFIG.nombre);
      textBox.appendChild(p);
    });
    textBox.addEventListener("scroll", () => updateMoreCue(textBox), { passive: true });

    const back = document.createElement("div");
    back.className = "leaf__face leaf__back";

    const flip = document.createElement("div");
    flip.className = "leaf__flip";
    flip.append(front, back);
    leaf.appendChild(flip);
    pagesBox.appendChild(leaf);
  });
}

/* ---------- Ajuste automático del tamaño del texto ----------
   Para cada página prueba tamaños de mayor a menor y deja el más grande en el que
   TODO el texto cabe sin desplazarse. Si ni con el mínimo cabe (lo normal en celular
   con cartas largas), se queda en el mínimo legible y la página se desliza con el dedo.
   Nunca se recorta ni se elimina texto. */
function fitPage(text) {
  const sizes = innerWidth <= 360 ? [18, 17, 16, 15.5] : [20, 19, 18, 17, 16.5];
  let chosen = sizes[sizes.length - 1];
  for (const px of sizes) {
    text.style.setProperty("--fs", px + "px");
    if (text.scrollHeight <= text.clientHeight + 1) { chosen = px; break; }
  }
  text.style.setProperty("--fs", chosen + "px");
  updateMoreCue(text);
}

// Muestra "↓ sigue" solo si todavía hay texto por leer más abajo
function updateMoreCue(text) {
  const hayMas = text.scrollHeight > text.clientHeight + 4 &&
                 text.scrollTop + text.clientHeight < text.scrollHeight - 8;
  text.parentElement.classList.toggle("has-more", hayMas);
}

function fitAllPages() {
  pagesBox.querySelectorAll(".page__text").forEach(fitPage);
}

/* ---------- Mostrar la página actual ----------
   Las hojas anteriores a "current" quedan giradas (is-flipped); el resto, en su lugar. */
let settleTimer;
function updateDiary() {
  const leaves = pagesBox.querySelectorAll(".leaf");
  clearTimeout(settleTimer);

  // 1) Las hojas que van a girar salen del "reposo" y vuelven al modo 3D
  leaves.forEach((leaf, i) => {
    if (leaf.classList.contains("is-flipped") !== i < current) leaf.classList.remove("is-settled");
    leaf.setAttribute("aria-hidden", i === current ? "false" : "true");
  });
  void pagesBox.offsetWidth; // obliga al navegador a aplicar ese cambio antes de empezar a girar

  // 2) Ahora sí giran
  requestAnimationFrame(() => {
    leaves.forEach((leaf, i) => leaf.classList.toggle("is-flipped", i < current));
  });

  // 3) Al terminar el giro, la hoja actual queda en reposo (sin 3D) para poder desplazar el texto
  settleTimer = setTimeout(settleCurrent, 1100);

  counter.textContent = `${current + 1} / ${CARTA.length}`;
  prevBtn.disabled = current === 0;
  controls.classList.toggle("is-last", current === CARTA.length - 1);
  pagesBox.querySelectorAll(".page__text")[current]?.scrollTo(0, 0);
}

// Deja solo la hoja que se está leyendo en "reposo" (ver .is-settled en style.css)
function settleCurrent() {
  if (!diaryOpen) return;
  pagesBox.querySelectorAll(".leaf").forEach((leaf, i) => leaf.classList.toggle("is-settled", i === current));
}

function turnPage(delta) {
  if (!diaryOpen) return;
  const next = current + delta;
  if (next < 0 || next >= CARTA.length) return;
  current = next;
  updateDiary();
}

/* ---------- Desbloquear y abrir ---------- */
function sparkBurst() {
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("span");
    const a = (Math.PI * 2 * i) / 8, d = 34 + Math.random() * 14;
    s.className = "spark";
    s.style.setProperty("--dx", Math.cos(a) * d + "px");
    s.style.setProperty("--dy", Math.sin(a) * d + "px");
    lockBtn.appendChild(s);
    setTimeout(() => s.remove(), 1000);
  }
}

async function unlockDiary() {
  lockBtn.classList.add("is-unlocked");  // el candado se abre
  lockBtn.disabled = true;
  sparkBurst();
  diaryHint.classList.add("is-hidden");
  await wait(1100);
  book.classList.add("is-open");         // la portada gira y se abre
  diaryOpen = true;
  await wait(1000);
  settleCurrent();                       // la primera hoja queda lista para desplazar el texto
  controls.classList.add("is-visible");  // aparecen las flechas
}

/* ---------- Último botón: conexión con la siguiente etapa ---------- */
function finishDiary() {
  // TODO (etapa 3): aquí conectaremos la sección de recuerdos, por ejemplo:
  //   await changeStage("stage-recuerdos");
  // Por ahora no hace nada visible.
  console.info("Fin de la carta: aquí se conectará la sección de recuerdos.");
}

/* ---------- Eventos del diario ---------- */
lockBtn.addEventListener("click", unlockDiary, { once: true });
prevBtn.addEventListener("click", () => turnPage(-1));
nextBtn.addEventListener("click", () => turnPage(1));
$("#diary-continue").addEventListener("click", finishDiary);

// Deslizar el dedo: izquierda = siguiente, derecha = anterior
let touchStart = null;
book.addEventListener("pointerdown", (e) => { touchStart = { x: e.clientX, y: e.clientY }; });
book.addEventListener("pointerup", (e) => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) turnPage(dx < 0 ? 1 : -1);
});
book.addEventListener("pointercancel", () => (touchStart = null));

// Flechas del teclado (útil al probar en el computador)
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") turnPage(1);
  if (e.key === "ArrowLeft") turnPage(-1);
});

buildLeaves();
updateDiary();
fitAllPages();
document.fonts && document.fonts.ready.then(fitAllPages);   // las fuentes cambian el ancho del texto
let resizeTimer;
addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(fitAllPages, 150); });
