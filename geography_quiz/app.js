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

// ======================
// 3. УТИЛИТЫ И UI
// ======================
const $ = (id) => document.getElementById(id);

const ui = {
  home: $("homeScreen"),
  quiz: $("quizScreen"),
  result: $("resultScreen"),
  modeCards: document.querySelectorAll(".mode-card"),
  difficulty: $("difficulty"),
  count: $("questionCount"),
  start: $("startButton"),
  back: $("backButton"),
  restart: $("restartButton"),
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

// ======================
// 4. ИНИЦИАЛИЗАЦИЯ (Безопасная)
// ======================
document.addEventListener("DOMContentLoaded", () => {
  if (ui.modeCards) {
    ui.modeCards.forEach((card) => {
      card.addEventListener("click", () => {
        ui.modeCards.forEach((item) => item.classList.remove("active"));
        card.classList.add("active");
        state.mode = card.dataset.mode;
      });
    });
  }

  if (ui.start) ui.start.addEventListener("click", startQuiz);
  if (ui.restart) ui.restart.addEventListener("click", startQuiz);
  if (ui.again) ui.again.addEventListener("click", startQuiz);
  if (ui.back) ui.back.addEventListener("click", showHome);
  if (ui.homeButton) ui.homeButton.addEventListener("click", showHome);

  const logoBtn = $("logoButton");
  if (logoBtn) {
    logoBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showHome();
    });
  }

  if (ui.next) {
    ui.next.addEventListener("click", () => {
      state.index += 1;
      renderQuestion();
    });
  }

  if (ui.globeBtn) {
    ui.globeBtn.addEventListener("click", openGlobe);
  }
});

// ======================
// 5. ЛОГИКА ВИКТОРИНЫ
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
  const difficulty = ui.difficulty ? ui.difficulty.value : "all";
  if (difficulty === "standard") {
    return countries.filter((country) => majorCodes.has(country[2]));
  }
  if (difficulty === "hard") {
    return countries.filter((country) => !majorCodes.has(country[2]));
  }
  return countries;
}

function startQuiz() {
  const available = getAvailableCountries();
  const amount =
    ui.count.value === "all" ? available.length : Number(ui.count.value);

  state.pool = shuffle(available).slice(0, Math.min(amount, available.length));
  state.index = 0;
  state.current = null;
  state.currentMapMode = null;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.correct = 0;

  updateHeader();
  if (ui.home) ui.home.classList.add("hidden");
  if (ui.result) ui.result.classList.add("hidden");
  if (ui.quiz) ui.quiz.classList.remove("hidden");

  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function countryFlag(country) {
  const code = country[2];
  return code
    .toUpperCase()
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

function setQuestionFlag(country) {
  if (!ui.questionFlag) return;
  ui.questionFlag.textContent = countryFlag(country);
  ui.questionFlag.classList.remove("hidden");
  ui.questionFlag.setAttribute("aria-label", `Флаг: ${country[0]}`);
}

function clearQuestionFlag() {
  if (!ui.questionFlag) return;
  ui.questionFlag.textContent = "";
  ui.questionFlag.classList.add("hidden");
  ui.questionFlag.removeAttribute("aria-label");
}

function renderQuestion() {
  if (state.index >= state.pool.length) {
    finishQuiz();
    return;
  }

  state.current = state.pool[state.index];
  state.answered = false;
  clearQuestionFlag();

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

  if (ui.progress)
    ui.progress.textContent = `${state.index + 1} / ${state.pool.length}`;
  if (ui.progressBar)
    ui.progressBar.style.width = `${((state.index + 1) / state.pool.length) * 100}%`;
  if (ui.accuracy) ui.accuracy.textContent = `Точность ${getAccuracy()}%`;
  if (ui.feedback) ui.feedback.textContent = "";
  if (ui.next) ui.next.classList.add("hidden");
  if (ui.answers) ui.answers.replaceChildren();
  if (ui.mapCard) ui.mapCard.classList.add("hidden");

  if (isMapMode(mode)) {
    renderMapQuestion(mode);
    return;
  }
  renderChoiceQuestion(mode);
}

function isMapMode(mode) {
  return (
    mode === "map-country" || mode === "country-map" || mode === "capital-map"
  );
}

function renderChoiceQuestion(mode) {
  const countryToCapital = mode === "country-capital";
  setQuestionFlag(state.current);

  const correct = countryToCapital ? state.current[1] : state.current[0];
  if (ui.questionMode) {
    ui.questionMode.textContent = countryToCapital
      ? "СТРАНА → СТОЛИЦА"
      : "СТОЛИЦА → СТРАНА";
  }
  if (ui.question) {
    ui.question.innerHTML = countryToCapital
      ? `Какая столица у страны <strong>${state.current[0]}</strong>?`
      : `К какой стране относится столица <strong>${state.current[1]}</strong>?`;
  }

  const alternatives = countryToCapital
    ? countries.map((country) => country[1])
    : countries.map((country) => country[0]);
  const options = shuffle([
    correct,
    ...shuffle(alternatives.filter((value) => value !== correct)).slice(0, 3),
  ]);

  const wrapper = document.createElement("div");
  wrapper.className = "answers";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () =>
      checkChoice(button, option, correct),
    );
    wrapper.appendChild(button);
  });
  if (ui.answers) ui.answers.appendChild(wrapper);
}

function checkChoice(button, answer, correct) {
  if (state.answered) return;
  state.answered = true;

  document.querySelectorAll(".answer-button").forEach((item) => {
    item.disabled = true;
  });

  if (answer === correct) {
    button.classList.add("correct");
    registerCorrect();
    if (ui.feedback)
      ui.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
  } else {
    button.classList.add("wrong");
    document.querySelectorAll(".answer-button").forEach((item) => {
      if (item.textContent === correct) {
        item.classList.add("correct");
      }
    });
    registerWrong();
    if (ui.feedback)
      ui.feedback.textContent = `✗ Правильный ответ: ${correct}.`;
  }
  finishAnswer();
}

// ======================
// 6. ЛОГИКА КАРТЫ
// ======================
async function renderMapQuestion(mode) {
  if (ui.mapCard) ui.mapCard.classList.remove("hidden");
  setQuestionFlag(state.current);

  if (ui.questionMode) {
    ui.questionMode.textContent = {
      "map-country": "НАЙДИ СТРАНУ",
      "country-map": "СТРАНА → КАРТА",
      "capital-map": "СТОЛИЦА → КАРТА",
    }[mode];
  }

  if (ui.question) {
    if (mode === "map-country") {
      ui.question.innerHTML = `Найди на карте <strong>${state.current[0]}</strong>`;
    } else if (mode === "country-map") {
      ui.question.innerHTML = `Где находится <strong>${state.current[0]}</strong>?`;
    } else {
      ui.question.innerHTML = `Где находится страна со столицей <strong>${state.current[1]}</strong>?`;
    }
  }

  if (ui.mapInstruction)
    ui.mapInstruction.textContent = "Нажми на нужную страну";

  try {
    await loadMap();
    paintMapTarget();
  } catch {
    if (ui.map) {
      ui.map.innerHTML = `<div class="map-error">Карта не загрузилась. Проверь интернет-соединение и обнови страницу.</div>`;
    }
  }
}

async function loadMap() {
  if (state.mapData) {
    renderMap();
    return;
  }
  const response = await fetch(mapUrl);
  if (!response.ok) {
    throw new Error("Map request failed");
  }
  state.mapData = await response.json();
  renderMap();
}

function renderMap() {
  const features = state.mapData.features
    .map((feature) => ({
      feature,
      code: getMapCode(
        feature.properties?.NAME ||
          feature.properties?.name ||
          feature.properties?.ADMIN ||
          "",
      ),
    }))
    .filter((item) => item.code);

  const bounds = getFeatureBounds(
    features.map((item) => item.feature.geometry),
  );
  const viewWidth = 1000;
  const viewHeight = 600;
  const padding = 34;
  const availableWidth = viewWidth - padding * 2;
  const availableHeight = viewHeight - padding * 2;
  const dataWidth = Math.max(bounds.maxLon - bounds.minLon, 1);
  const dataHeight = Math.max(bounds.maxLat - bounds.minLat, 1);
  const scale = Math.min(
    availableWidth / dataWidth,
    availableHeight / dataHeight,
  );
  const offsetX = (viewWidth - dataWidth * scale) / 2;
  const offsetY = (viewHeight - dataHeight * scale) / 2;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Интерактивная карта Европы");

  features.forEach(({ feature, code }) => {
    createPaths(feature.geometry, (point) => {
      const x = offsetX + (point[0] - bounds.minLon) * scale;
      const y = viewHeight - offsetY - (point[1] - bounds.minLat) * scale;
      return [x, y];
    }).forEach((pathData) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", pathData);
      path.classList.add("country");
      path.dataset.code = code;
      path.setAttribute("tabindex", "0");
      path.setAttribute("aria-label", getCountryName(code));
      path.addEventListener("click", () => checkMapAnswer(path, code));
      path.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          checkMapAnswer(path, code);
        }
      });
      svg.appendChild(path);
    });
  });

  if (ui.map) ui.map.replaceChildren(svg);
}

function getFeatureBounds(geometries) {
  const bounds = {
    minLon: Infinity,
    maxLon: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity,
  };
  geometries.forEach((geometry) => {
    walkCoordinates(geometry.coordinates, (point) => {
      bounds.minLon = Math.min(bounds.minLon, point[0]);
      bounds.maxLon = Math.max(bounds.maxLon, point[0]);
      bounds.minLat = Math.min(bounds.minLat, point[1]);
      bounds.maxLat = Math.max(bounds.maxLat, point[1]);
    });
  });
  return bounds;
}

function walkCoordinates(value, callback) {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    callback(value);
    return;
  }
  value.forEach((item) => walkCoordinates(item, callback));
}

function createPaths(geometry, project) {
  const convertRing = (ring) =>
    ring
      .map((point, index) => {
        const [x, y] = project(point);
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  if (geometry.type === "Polygon") {
    return [geometry.coordinates.map(convertRing).join(" ")];
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((polygon) =>
      polygon.map(convertRing).join(" "),
    );
  }
  return [];
}

function getMapCode(name) {
  if (mapAliases[name]) return mapAliases[name];
  const normalized = normalize(name);
  const country = countries.find((item) => normalize(item[3]) === normalized);
  return country ? country[2] : null;
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яё]/gi, "");
}

function paintMapTarget() {
  document.querySelectorAll(".country").forEach((path) => {
    path.classList.remove("target", "correct", "wrong");
  });
  if (state.currentMapMode === "map-country") return;
}

function checkMapAnswer(path, code) {
  if (state.answered) return;
  state.answered = true;

  const correct = code === state.current[2];
  path.classList.add(correct ? "correct" : "wrong");

  if (correct) {
    registerCorrect();
    if (ui.feedback)
      ui.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
  } else {
    registerWrong();
    document.querySelectorAll(".country").forEach((item) => {
      if (item.dataset.code === state.current[2]) {
        item.classList.add("target");
      }
    });
    if (ui.feedback)
      ui.feedback.textContent = `✗ Это ${getCountryName(code)}. Нужна страна: ${state.current[0]}.`;
  }
  finishAnswer();
}

function getCountryName(code) {
  const country = countries.find((item) => item[2] === code);
  return country ? country[0] : "другая страна";
}

// ======================
// 7. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
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
  updateHeader();
  if (ui.accuracy) ui.accuracy.textContent = `Точность ${getAccuracy()}%`;
  if (ui.next) ui.next.classList.remove("hidden");
}

function getAccuracy() {
  const answered = state.index;
  if (answered === 0) return 0;
  return Math.round((state.correct / answered) * 100);
}

function updateHeader() {
  if (ui.topScore) ui.topScore.textContent = state.score;
  if (ui.topStreak) ui.topStreak.textContent = state.streak;
}

function finishQuiz() {
  const accuracy = Math.round((state.correct / state.pool.length) * 100);
  if (ui.quiz) ui.quiz.classList.add("hidden");
  if (ui.result) ui.result.classList.remove("hidden");

  if (ui.resultScore) ui.resultScore.textContent = state.score;
  if (ui.resultCorrect) ui.resultCorrect.textContent = state.correct;
  if (ui.resultTotal) ui.resultTotal.textContent = state.pool.length;
  if (ui.resultAccuracy) ui.resultAccuracy.textContent = `${accuracy}%`;
  if (ui.resultBestStreak) ui.resultBestStreak.textContent = state.bestStreak;

  if (ui.resultTitle) {
    if (accuracy >= 90) ui.resultTitle.textContent = "Превосходный результат!";
    else if (accuracy >= 70)
      ui.resultTitle.textContent = "Очень хороший результат!";
    else if (accuracy >= 50) ui.resultTitle.textContent = "Хороший старт!";
    else ui.resultTitle.textContent = "Есть что повторить.";
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  if (ui.quiz) ui.quiz.classList.add("hidden");
  if (ui.result) ui.result.classList.add("hidden");
  if (ui.home) ui.home.classList.remove("hidden");
  updateHeader();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ======================
// 8. 3D ГЛОБУС (ОПТИМИЗИРОВАННЫЙ)
// ======================
function openGlobe() {
  if (state.globeActive) return;
  state.globeActive = true;

  if (ui.home) ui.home.classList.add("hidden");
  if (ui.quiz) ui.quiz.classList.add("hidden");
  if (ui.result) ui.result.classList.add("hidden");

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

  // Принудительно скрываем лоадер через 3 секунды, даже если текстура ещё грузится
  const loadTimeout = setTimeout(() => {
    if (loader) loader.style.display = "none";
  }, 3000);

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

  container.innerHTML = "";
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

  // Земля (сразу синяя, чтобы не было чёрного экрана)
  const earthGeo = new THREE.SphereGeometry(1, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({ color: 0x4169e1 });
  const earth = new THREE.Mesh(earthGeo, earthMat);
  scene.add(earth);

  // Свет
  scene.add(new THREE.AmbientLight(0x404040, 1.5));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  // Загрузка ЛЁГКОЙ текстуры (1024x512, ~300 КБ)
  const textureUrl =
    "https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_1024.jpg";

  new THREE.TextureLoader().load(
    textureUrl,
    // Успех
    (tex) => {
      clearTimeout(loadTimeout);
      if (loader) loader.style.display = "none";
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;
    },
    // Прогресс (игнорируем)
    undefined,
    // Ошибка
    () => {
      clearTimeout(loadTimeout);
      if (loader) loader.style.display = "none";
      earthMat.color.set(0x2d8a5e); // Зелёный цвет при невозможности загрузить текстуру
    },
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
    if (!isDragging) earth.rotation.y += 0.001; // Плавное автовращение
    camera.position.z += (targetZoom - camera.position.z) * 0.08;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  };
  animate();
}
