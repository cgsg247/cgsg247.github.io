// ======================
// 1. ДАННЫЕ (ОЧИЩЕНЫ ОТ ПРОБЕЛОВ)
// ======================
const countries = [
  ["Албания", "Тирана", "AL", "Albania"],
  ["Андорра", "Андорра-ла-Велья", "AD", "Andorra"],
  ["Армения", "Ереван", "AM", "Armenia"],
  ["Австрия", "Вена", "AT", "Austria"],
  ["Азербайджан", "Баку", "AZ", "Azerbaijan"],
  ["Беларусь", "Минск", "BY", "Belarus"],
  ["Бельгия", "Брюссель", "BE", "Belgium"],
  ["Болгария", "София", "BG", "Bulgaria"],
  ["Босния и Герцеговина", "Сараево", "BA", "Bosnia and Herzegovina"],
  ["Ватикан", "Ватикан", "VA", "Vatican"],
  ["Великобритания", "Лондон", "GB", "United Kingdom"],
  ["Венгрия", "Будапешт", "HU", "Hungary"],
  ["Германия", "Берлин", "DE", "Germany"],
  ["Греция", "Афины", "GR", "Greece"],
  ["Грузия", "Тбилиси", "GE", "Georgia"],
  ["Дания", "Копенгаген", "DK", "Denmark"],
  ["Ирландия", "Дублин", "IE", "Ireland"],
  ["Исландия", "Рейкьявик", "IS", "Iceland"],
  ["Испания", "Мадрид", "ES", "Spain"],
  ["Италия", "Рим", "IT", "Italy"],
  ["Казахстан", "Астана", "KZ", "Kazakhstan"],
  ["Кипр", "Никосия", "CY", "Cyprus"],
  ["Латвия", "Рига", "LV", "Latvia"],
  ["Литва", "Вильнюс", "LT", "Lithuania"],
  ["Лихтенштейн", "Вадуц", "LI", "Liechtenstein"],
  ["Люксембург", "Люксембург", "LU", "Luxembourg"],
  ["Мальта", "Валлетта", "MT", "Malta"],
  ["Молдова", "Кишинёв", "MD", "Moldova"],
  ["Монако", "Монако", "MC", "Monaco"],
  ["Нидерланды", "Амстердам", "NL", "Netherlands"],
  ["Норвегия", "Осло", "NO", "Norway"],
  ["Польша", "Варшава", "PL", "Poland"],
  ["Португалия", "Лиссабон", "PT", "Portugal"],
  ["Россия", "Москва", "RU", "Russia"],
  ["Румыния", "Бухарест", "RO", "Romania"],
  ["Сан-Марино", "Сан-Марино", "SM", "San Marino"],
  ["Северная Македония", "Скопье", "MK", "North Macedonia"],
  ["Сербия", "Белград", "RS", "Serbia"],
  ["Словакия", "Братислава", "SK", "Slovakia"],
  ["Словения", "Любляна", "SI", "Slovenia"],
  ["Турция", "Анкара", "TR", "Turkey"],
  ["Украина", "Киев", "UA", "Ukraine"],
  ["Финляндия", "Хельсинки", "FI", "Finland"],
  ["Франция", "Париж", "FR", "France"],
  ["Хорватия", "Загреб", "HR", "Croatia"],
  ["Черногория", "Подгорица", "ME", "Montenegro"],
  ["Чехия", "Прага", "CZ", "Czechia"],
  ["Швейцария", "Берн", "CH", "Switzerland"],
  ["Швеция", "Стокгольм", "SE", "Sweden"],
  ["Эстония", "Таллин", "EE", "Estonia"],
];

const majorCodes = new Set([
  "DE",
  "FR",
  "IT",
  "ES",
  "GB",
  "PL",
  "UA",
  "RU",
  "NL",
  "BE",
  "AT",
  "CH",
  "SE",
  "NO",
  "DK",
  "FI",
  "GR",
  "PT",
  "CZ",
  "IE",
  "RO",
  "HU",
  "BG",
  "TR",
]);

const mapAliases = {
  Czechia: "CZ",
  "Czech Republic": "CZ",
  Macedonia: "MK",
  "North Macedonia": "MK",
  Turkey: "TR",
  Türkiye: "TR",
  Russia: "RU",
  "Russian Federation": "RU",
  Vatican: "VA",
  "Vatican City": "VA",
  "Holy See": "VA",
  Moldova: "MD",
  "Republic of Moldova": "MD",
  "Bosnia and Herzegovina": "BA",
  "United Kingdom": "GB",
  UK: "GB",
};

const mapUrl =
  "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson";

// ======================
// 2. СОСТОЯНИЕ
// ======================
const state = {
  mode: "map-country",
  pool: [],
  index: 0,
  current: null,
  currentMapMode: null,
  score: 0,
  streak: 0,
  bestStreak: 0,
  correct: 0,
  answered: false,
  mapData: null,
  globeActive: false,
};

const $ = (id) => document.getElementById(id);

// ======================
// 3. ИНИЦИАЛИЗАЦИЯ (Безопасная)
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const ui = {
    home: $("homeScreen"),
    quiz: $("quizScreen"),
    result: $("resultScreen"),
    modeCards: document.querySelectorAll(".mode-card"),
    difficulty: $("difficulty"),
    count: $("questionCount"),
    start: $("startButton"),
    back: $("backButton"),
    again: $("againButton"),
    homeButton: $("homeButton"),
    next: $("nextButton"),
    progress: $("progressText"),
    accuracy: $("accuracyText"),
    progressBar: $("progressBar"),
    questionMode: $("questionMode"),
    question: $("questionText"),
    questionFlag: $("questionFlag"),
    answers: $("answerArea"),
    feedback: $("feedback"),
    mapCard: $("mapCard"),
    mapInstruction: $("mapInstruction"),
    map: $("mapContainer"),
    topScore: $("topScore"),
    topStreak: $("topStreak"),
    resultTitle: $("resultTitle"),
    resultScore: $("resultScore"),
    resultCorrect: $("resultCorrect"),
    resultTotal: $("resultTotal"),
    resultAccuracy: $("resultAccuracy"),
    resultBestStreak: $("resultBestStreak"),
    globeBtn: $("globeToggle") || $("openGlobe"),
  };

  // Безопасная привязка событий (если элемента нет, ошибки не будет)
  const bind = (el, event, fn) => el && el.addEventListener(event, fn);

  ui.modeCards.forEach((card) => {
    bind(card, "click", () => {
      ui.modeCards.forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      state.mode = card.dataset.mode;
    });
  });

  bind(ui.start, "click", startQuiz);
  bind(ui.again, "click", startQuiz);
  bind(ui.back, "click", showHome);
  bind(ui.homeButton, "click", showHome);

  const logoBtn = $("logoButton");
  bind(logoBtn, "click", (e) => {
    e.preventDefault();
    showHome();
  });

  bind(ui.next, "click", () => {
    state.index += 1;
    renderQuestion();
  });
  bind(ui.globeBtn, "click", openGlobe);

  updateHeader(ui);
  window.appUI = ui; // Делаем UI доступным для других функций
});

// ======================
// 4. ЛОГИКА ВИКТОРИНЫ
// ======================
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getAvailableCountries() {
  const difficulty = window.appUI?.difficulty?.value || "all";
  if (difficulty === "standard")
    return countries.filter((c) => majorCodes.has(c[2]));
  if (difficulty === "hard")
    return countries.filter((c) => !majorCodes.has(c[2]));
  return countries;
}

function startQuiz() {
  const ui = window.appUI;
  const available = getAvailableCountries();
  const amount =
    ui.count.value === "all" ? available.length : Number(ui.count.value);

  Object.assign(state, {
    pool: shuffle(available).slice(0, Math.min(amount, available.length)),
    index: 0,
    current: null,
    currentMapMode: null,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
  });

  updateHeader(ui);
  ui.home.classList.add("hidden");
  ui.result.classList.add("hidden");
  ui.quiz.classList.remove("hidden");
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function countryFlag(country) {
  return country[2]
    .toUpperCase()
    .split("")
    .map((l) => String.fromCodePoint(127397 + l.charCodeAt(0)))
    .join("");
}

function setQuestionFlag(country, ui) {
  ui.questionFlag.textContent = countryFlag(country);
  ui.questionFlag.classList.remove("hidden");
  ui.questionFlag.setAttribute("aria-label", `Флаг: ${country[0]}`);
}

function clearQuestionFlag(ui) {
  ui.questionFlag.textContent = "";
  ui.questionFlag.classList.add("hidden");
  ui.questionFlag.removeAttribute("aria-label");
}

function renderQuestion() {
  const ui = window.appUI;
  if (state.index >= state.pool.length) {
    finishQuiz();
    return;
  }

  state.current = state.pool[state.index];
  state.answered = false;
  clearQuestionFlag(ui);

  const mode =
    state.mode === "mixed"
      ? shuffle([
          "country-capital",
          "capital-country",
          "map-country",
          "country-map",
          "capital-map",
        ])[0]
      : state.mode;
  state.currentMapMode = mode;

  ui.progress.textContent = `${state.index + 1} / ${state.pool.length}`;
  ui.progressBar.style.width = `${((state.index + 1) / state.pool.length) * 100}%`;
  ui.accuracy.textContent = `Точность ${getAccuracy()}%`;
  ui.feedback.textContent = "";
  ui.next.classList.add("hidden");
  ui.answers.replaceChildren();
  ui.mapCard.classList.add("hidden");

  if (isMapMode(mode)) renderMapQuestion(mode);
  else renderChoiceQuestion(mode);
}

function isMapMode(mode) {
  return ["map-country", "country-map", "capital-map"].includes(mode);
}

function renderChoiceQuestion(mode) {
  const ui = window.appUI;
  const countryToCapital = mode === "country-capital";
  setQuestionFlag(state.current, ui);

  const correct = countryToCapital ? state.current[1] : state.current[0];
  ui.questionMode.textContent = countryToCapital
    ? "СТРАНА → СТОЛИЦА"
    : "СТОЛИЦА → СТРАНА";
  ui.question.innerHTML = countryToCapital
    ? `Какая столица у страны <strong>${state.current[0]}</strong>?`
    : `К какой стране относится столица <strong>${state.current[1]}</strong>?`;

  const alternatives = countryToCapital
    ? countries.map((c) => c[1])
    : countries.map((c) => c[0]);
  const options = shuffle([
    correct,
    ...shuffle(alternatives.filter((v) => v !== correct)).slice(0, 3),
  ]);

  const wrapper = document.createElement("div");
  wrapper.className = "answers";
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.className = "answer-button";
    btn.type = "button";
    btn.textContent = option;
    btn.addEventListener("click", () => checkChoice(btn, option, correct));
    wrapper.appendChild(btn);
  });
  ui.answers.appendChild(wrapper);
}

function checkChoice(button, answer, correct) {
  if (state.answered) return;
  state.answered = true;
  document
    .querySelectorAll(".answer-button")
    .forEach((b) => (b.disabled = true));

  if (answer === correct) {
    button.classList.add("correct");
    registerCorrect();
    window.appUI.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
  } else {
    button.classList.add("wrong");
    document.querySelectorAll(".answer-button").forEach((b) => {
      if (b.textContent === correct) b.classList.add("correct");
    });
    registerWrong();
    window.appUI.feedback.textContent = `✗ Правильный ответ: ${correct}.`;
  }
  finishAnswer();
}

// ======================
// 5. ЛОГИКА КАРТЫ
// ======================
async function renderMapQuestion(mode) {
  const ui = window.appUI;
  ui.mapCard.classList.remove("hidden");
  setQuestionFlag(state.current, ui);

  const titles = {
    "map-country": "НАЙДИ СТРАНУ",
    "country-map": "СТРАНА → КАРТА",
    "capital-map": "СТОЛИЦА → КАРТА",
  };
  ui.questionMode.textContent = titles[mode];

  if (mode === "map-country")
    ui.question.innerHTML = `Найди на карте <strong>${state.current[0]}</strong>`;
  else if (mode === "country-map")
    ui.question.innerHTML = `Где находится <strong>${state.current[0]}</strong>?`;
  else
    ui.question.innerHTML = `Где находится страна со столицей <strong>${state.current[1]}</strong>?`;

  ui.mapInstruction.textContent = "Нажми на нужную страну";

  try {
    await loadMap();
    paintMapTarget();
  } catch (e) {
    console.error(e);
    ui.map.innerHTML = `<div class="map-error">Карта не загрузилась. Проверь интернет и обнови страницу.</div>`;
  }
}

async function loadMap() {
  if (state.mapData) {
    renderMap();
    return;
  }
  const response = await fetch(mapUrl);
  if (!response.ok) throw new Error("Map request failed");
  state.mapData = await response.json();
  renderMap();
}

function renderMap() {
  const ui = window.appUI;
  const features = state.mapData.features
    .map((f) => ({
      feature: f,
      code: getMapCode(
        f.properties?.NAME || f.properties?.name || f.properties?.ADMIN || "",
      ),
    }))
    .filter((item) => item.code);

  const bounds = getFeatureBounds(features.map((i) => i.feature.geometry));
  const vw = 1000,
    vh = 600,
    pad = 34;
  const dw = Math.max(bounds.maxLon - bounds.minLon, 1);
  const dh = Math.max(bounds.maxLat - bounds.minLat, 1);
  const scale = Math.min((vw - pad * 2) / dw, (vh - pad * 2) / dh);
  const ox = (vw - dw * scale) / 2,
    oy = (vh - dh * scale) / 2;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  features.forEach(({ feature, code }) => {
    createPaths(feature.geometry, (p) => [
      ox + (p[0] - bounds.minLon) * scale,
      vh - oy - (p[1] - bounds.minLat) * scale,
    ]).forEach((d) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", d);
      path.classList.add("country");
      path.dataset.code = code;
      path.addEventListener("click", () => checkMapAnswer(path, code));
      svg.appendChild(path);
    });
  });
  ui.map.replaceChildren(svg);
}

function getFeatureBounds(geoms) {
  const b = {
    minLon: Infinity,
    maxLon: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity,
  };
  const walk = (v) => {
    if (!Array.isArray(v)) return;
    if (v.length >= 2 && typeof v[0] === "number") {
      b.minLon = Math.min(b.minLon, v[0]);
      b.maxLon = Math.max(b.maxLon, v[0]);
      b.minLat = Math.min(b.minLat, v[1]);
      b.maxLat = Math.max(b.maxLat, v[1]);
      return;
    }
    v.forEach(walk);
  };
  geoms.forEach(walk);
  return b;
}

function createPaths(geom, proj) {
  const ring = (r) =>
    r
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${proj(p)[0].toFixed(2)} ${proj(p)[1].toFixed(2)}`,
      )
      .join(" ") + " Z";
  if (geom.type === "Polygon") return [geom.coordinates.map(ring).join(" ")];
  if (geom.type === "MultiPolygon")
    return geom.coordinates.map((p) => p.map(ring).join(" "));
  return [];
}

function getMapCode(name) {
  if (mapAliases[name]) return mapAliases[name];
  const norm = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яё]/gi, "");
  const c = countries.find(
    (x) =>
      x[3]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9а-яё]/gi, "") === norm,
  );
  return c ? c[2] : null;
}

function paintMapTarget() {
  document
    .querySelectorAll(".country")
    .forEach((p) => p.classList.remove("target", "correct", "wrong"));
}

function checkMapAnswer(path, code) {
  if (state.answered) return;
  state.answered = true;
  const correct = code === state.current[2];
  path.classList.add(correct ? "correct" : "wrong");

  if (correct) {
    registerCorrect();
    window.appUI.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
  } else {
    registerWrong();
    document.querySelectorAll(".country").forEach((p) => {
      if (p.dataset.code === state.current[2]) p.classList.add("target");
    });
    const cName = countries.find((x) => x[2] === code)?.[0] || "другая страна";
    window.appUI.feedback.textContent = `✗ Это ${cName}. Нужна страна: ${state.current[0]}.`;
  }
  finishAnswer();
}

// ======================
// 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ======================
function registerCorrect() {
  state.correct += 1;
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.score += 10 + Math.min(state.streak - 1, 10) * 2;
}
function registerWrong() {
  state.streak = 0;
}
function finishAnswer() {
  const ui = window.appUI;
  updateHeader(ui);
  ui.accuracy.textContent = `Точность ${getAccuracy()}%`;
  ui.next.classList.remove("hidden");
}
function getAccuracy() {
  const n = state.index;
  return n === 0 ? 0 : Math.round((state.correct / n) * 100);
}
function updateHeader(ui) {
  if (ui.topScore) ui.topScore.textContent = state.score;
  if (ui.topStreak) ui.topStreak.textContent = state.streak;
}
function finishQuiz() {
  const ui = window.appUI;
  const acc = Math.round((state.correct / state.pool.length) * 100);
  ui.quiz.classList.add("hidden");
  ui.result.classList.remove("hidden");
  ui.resultScore.textContent = state.score;
  ui.resultCorrect.textContent = state.correct;
  ui.resultTotal.textContent = state.pool.length;
  ui.resultAccuracy.textContent = `${acc}%`;
  ui.resultBestStreak.textContent = state.bestStreak;
  ui.resultTitle.textContent =
    acc >= 90
      ? "Превосходный результат!"
      : acc >= 70
        ? "Очень хороший результат!"
        : acc >= 50
          ? "Хороший старт!"
          : "Есть что повторить.";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showHome() {
  const ui = window.appUI;
  ui.quiz.classList.add("hidden");
  ui.result.classList.add("hidden");
  ui.home.classList.remove("hidden");
  updateHeader(ui);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ======================
// 7. 3D ГЛОБУС (Безопасная загрузка)
// ======================
function openGlobe() {
  if (state.globeActive) return;
  state.globeActive = true;

  // Скрываем остальные экраны
  const ui = window.appUI;
  ui.home.classList.add("hidden");
  ui.quiz.classList.add("hidden");
  ui.result.classList.add("hidden");

  // Создаём контейнер для глобуса, если его нет
  let globeScreen = $("globeScreen");
  if (!globeScreen) {
    globeScreen = document.createElement("section");
    globeScreen.id = "globeScreen";
    globeScreen.className = "screen";
    globeScreen.innerHTML = `
      <div style="padding:20px; text-align:center;">
        <h2 style="margin-bottom:10px;">🌍 3D Глобус Земли</h2>
        <p style="color:#68748a; margin-bottom:15px;">Вращайте мышью. Колёсико — приближение (логарифмический зум).</p>
        <div id="globeContainer" style="width:100%; max-width:800px; height:500px; margin:0 auto; background:#0b1024; border-radius:16px; border:1px solid #e4e9f1; position:relative; overflow:hidden;">
          <div id="globeLoader" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#68748a; font-weight:bold;">Загрузка 3D-модели...</div>
        </div>
        <button id="closeGlobeBtn" class="plain-button" style="margin-top:20px; min-width:200px;">← Вернуться к тесту</button>
      </div>
    `;
    document.querySelector(".site-shell").appendChild(globeScreen);

    // Привязка кнопки закрытия
    setTimeout(() => {
      const closeBtn = $("closeGlobeBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          state.globeActive = false;
          if (window.globeRenderer) {
            window.globeRenderer.dispose();
            window.globeRenderer = null;
          }
          globeScreen.remove();
          showHome();
        });
      }
    }, 100);
  } else {
    globeScreen.classList.remove("hidden");
  }

  // Загружаем Three.js динамически, если его ещё нет
  if (!window.THREE) {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = initGlobe;
    document.head.appendChild(script);
  } else {
    initGlobe();
  }
}

function initGlobe() {
  const container = $("globeContainer");
  const loader = $("globeLoader");
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );
  camera.position.z = 2.8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = ""; // Очищаем лоадер
  container.appendChild(renderer.domElement);
  window.globeRenderer = renderer;

  // Звёзды
  const starGeo = new THREE.BufferGeometry();
  const starVerts = [];
  for (let i = 0; i < 1500; i++) {
    starVerts.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
    );
  }
  starGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starVerts, 3),
  );
  scene.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 }),
    ),
  );

  // Земля
  const earthGeo = new THREE.SphereGeometry(1, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({ color: 0x4169e1 });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  scene.add(earth);

  // Свет
  scene.add(new THREE.AmbientLight(0x404040, 1.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // Текстура
  new THREE.TextureLoader().load(
    "https://unpkg.com/three-globe@2.41.1/example/img/earth-blue-marble.jpg",
    (tex) => {
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;
    },
    undefined,
    () => {
      earthMat.color.set(0x2d8a5e);
    }, // Fallback цвет, если текстура не загрузилась
  );

  // Управление
  let isDragging = false,
    prevX = 0,
    prevY = 0,
    targetZoom = 2.8;

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
  });
  window.addEventListener("mousemove", (e) => {
    if (isDragging) {
      earth.rotation.y += (e.clientX - prevX) * 0.005;
      earth.rotation.x += (e.clientY - prevY) * 0.005;
      prevX = e.clientX;
      prevY = e.clientY;
    }
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  container.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      // Логарифмический зум
      const logZ = Math.log(targetZoom);
      targetZoom = Math.exp(
        Math.max(Math.log(1.3), Math.min(Math.log(6), logZ + e.deltaY * 0.001)),
      );
    },
    { passive: false },
  );

  // Анимация
  const animate = () => {
    if (!state.globeActive) return;
    requestAnimationFrame(animate);
    if (!isDragging) earth.rotation.y += 0.001; // Автовращение
    camera.position.z += (targetZoom - camera.position.z) * 0.08;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  };
  animate();
}
