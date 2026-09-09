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
    ["Эстония", "Таллин", "EE", "Estonia"]
];

const majorCodes = new Set([
    "DE", "FR", "IT", "ES", "GB", "PL", "UA", "RU", "NL",
    "BE", "AT", "CH", "SE", "NO", "DK", "FI", "GR", "PT",
    "CZ", "IE", "RO", "HU", "BG", "TR"
]);

const mapAliases = {
    "Czechia": "CZ",
    "Czech Republic": "CZ",
    "Macedonia": "MK",
    "North Macedonia": "MK",
    "Turkey": "TR",
    "Türkiye": "TR",
    "Russia": "RU",
    "Russian Federation": "RU",
    "Vatican": "VA",
    "Vatican City": "VA",
    "Holy See": "VA",
    "Moldova": "MD",
    "Republic of Moldova": "MD",
    "Bosnia and Herzegovina": "BA",
    "United Kingdom": "GB",
    "UK": "GB"
};

const mapUrl = "https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson";

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
    mapData: null
};

const $ = id => document.getElementById(id);

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
    resultBestStreak: $("resultBestStreak")
};

ui.modeCards.forEach(card => {
    card.addEventListener("click", () => {
        ui.modeCards.forEach(item => item.classList.remove("active"));
        card.classList.add("active");
        state.mode = card.dataset.mode;
    });
});

ui.start.addEventListener("click", startQuiz);
ui.restart.addEventListener("click", startQuiz);
ui.again.addEventListener("click", startQuiz);
ui.back.addEventListener("click", showHome);
ui.homeButton.addEventListener("click", showHome);
$("logoButton").addEventListener("click", event => {
    event.preventDefault();
    showHome();
});

ui.next.addEventListener("click", () => {
    state.index += 1;
    renderQuestion();
});

function shuffle(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function getAvailableCountries() {
    const difficulty = ui.difficulty.value;

    if (difficulty === "standard") {
        return countries.filter(country => majorCodes.has(country[2]));
    }

    if (difficulty === "hard") {
        return countries.filter(country => !majorCodes.has(country[2]));
    }

    return countries;
}

function startQuiz() {
    const available = getAvailableCountries();
    const amount = ui.count.value === "all" ? available.length : Number(ui.count.value);

    state.pool = shuffle(available).slice(0, Math.min(amount, available.length));
    state.index = 0;
    state.current = null;
    state.currentMapMode = null;
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.correct = 0;

    updateHeader();
    ui.home.classList.add("hidden");
    ui.result.classList.add("hidden");
    ui.quiz.classList.remove("hidden");

    renderQuestion();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
    if (state.index >= state.pool.length) {
        finishQuiz();
        return;
    }

    state.current = state.pool[state.index];
    state.answered = false;

    const mode = state.mode === "mixed"
        ? shuffle(["country-capital", "capital-country", "map-country", "country-map", "capital-map"])[0]
        : state.mode;

    state.currentMapMode = mode;

    ui.progress.textContent = `${state.index + 1} / ${state.pool.length}`;
    ui.progressBar.style.width = `${((state.index + 1) / state.pool.length) * 100}%`;
    ui.accuracy.textContent = `Точность ${getAccuracy()}%`;
    ui.feedback.textContent = "";
    ui.next.classList.add("hidden");
    ui.answers.replaceChildren();
    ui.mapCard.classList.add("hidden");

    if (isMapMode(mode)) {
        renderMapQuestion(mode);
        return;
    }

    renderChoiceQuestion(mode);
}

function isMapMode(mode) {
    return mode === "map-country" || mode === "country-map" || mode === "capital-map";
}

function renderChoiceQuestion(mode) {
    const countryToCapital = mode === "country-capital";
    const correct = countryToCapital ? state.current[1] : state.current[0];

    ui.questionMode.textContent = countryToCapital
        ? "СТРАНА → СТОЛИЦА"
        : "СТОЛИЦА → СТРАНА";

    ui.question.innerHTML = countryToCapital
        ? `Какая столица у страны <strong>${state.current[0]}</strong>?`
        : `К какой стране относится столица <strong>${state.current[1]}</strong>?`;

    const alternatives = countryToCapital
        ? countries.map(country => country[1])
        : countries.map(country => country[0]);

    const options = shuffle([
        correct,
        ...shuffle(alternatives.filter(value => value !== correct)).slice(0, 3)
    ]);

    const wrapper = document.createElement("div");
    wrapper.className = "answers";

    options.forEach(option => {
        const button = document.createElement("button");
        button.className = "answer-button";
        button.type = "button";
        button.textContent = option;
        button.addEventListener("click", () => checkChoice(button, option, correct));
        wrapper.appendChild(button);
    });

    ui.answers.appendChild(wrapper);
}

function checkChoice(button, answer, correct) {
    if (state.answered) {
        return;
    }

    state.answered = true;
    document.querySelectorAll(".answer-button").forEach(item => {
        item.disabled = true;
    });

    if (answer === correct) {
        button.classList.add("correct");
        registerCorrect();
        ui.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
    } else {
        button.classList.add("wrong");
        document.querySelectorAll(".answer-button").forEach(item => {
            if (item.textContent === correct) {
                item.classList.add("correct");
            }
        });
        registerWrong();
        ui.feedback.textContent = `✗ Правильный ответ: ${correct}.`;
    }

    finishAnswer();
}

async function renderMapQuestion(mode) {
    ui.mapCard.classList.remove("hidden");
    ui.questionMode.textContent = {
        "map-country": "НАЙДИ СТРАНУ",
        "country-map": "СТРАНА → КАРТА",
        "capital-map": "СТОЛИЦА → КАРТА"
    }[mode];

    if (mode === "map-country") {
        ui.question.innerHTML = `Найди на карте <strong>${state.current[0]}</strong>`;
    }

    if (mode === "country-map") {
        ui.question.innerHTML = `Где находится <strong>${state.current[0]}</strong>?`;
    }

    if (mode === "capital-map") {
        ui.question.innerHTML = `Где находится страна со столицей <strong>${state.current[1]}</strong>?`;
    }

    ui.mapInstruction.textContent = "Нажми на нужную страну";

    try {
        await loadMap();
        paintMapTarget();
    } catch {
        ui.map.innerHTML = `<div class="map-error">Карта не загрузилась. Проверь интернет-соединение и обнови страницу.</div>`;
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
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1000 700");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Интерактивная карта Европы");

    state.mapData.features.forEach(feature => {
        const properties = feature.properties || {};
        const name = properties.NAME || properties.name || properties.ADMIN || "";
        const code = getMapCode(name);

        if (!code) {
            return;
        }

        createPaths(feature.geometry).forEach(pathData => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            path.classList.add("country");
            path.dataset.code = code;
            path.dataset.name = name;
            path.setAttribute("tabindex", "0");
            path.addEventListener("click", () => checkMapAnswer(path, code));
            path.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    checkMapAnswer(path, code);
                }
            });
            svg.appendChild(path);
        });
    });

    ui.map.replaceChildren(svg);
}

function createPaths(geometry) {
    const convertRing = ring => ring
        .map(([longitude, latitude], index) => {
            const x = ((longitude + 180) / 360) * 1000;
            const y = ((90 - latitude) / 180) * 700;
            return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ") + " Z";

    if (geometry.type === "Polygon") {
        return [geometry.coordinates.map(convertRing).join(" ")];
    }

    if (geometry.type === "MultiPolygon") {
        return geometry.coordinates.map(polygon => polygon.map(convertRing).join(" "));
    }

    return [];
}

function getMapCode(name) {
    if (mapAliases[name]) {
        return mapAliases[name];
    }

    const normalized = normalize(name);
    const country = countries.find(item => normalize(item[3]) === normalized);

    return country ? country[2] : null;
}

function normalize(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]/gi, "");
}

function paintMapTarget() {
    document.querySelectorAll(".country").forEach(path => {
        path.classList.remove("target", "correct", "wrong");
    });

    if (state.currentMapMode === "map-country") {
        return;
    }
}

function checkMapAnswer(path, code) {
    if (state.answered) {
        return;
    }

    state.answered = true;

    const correct = code === state.current[2];

    path.classList.add(correct ? "correct" : "wrong");

    if (correct) {
        registerCorrect();
        ui.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
    } else {
        registerWrong();
        document.querySelectorAll(".country").forEach(item => {
            if (item.dataset.code === state.current[2]) {
                item.classList.add("target");
            }
        });
        ui.feedback.textContent = `✗ Это ${getCountryName(code)}. Нужна страна: ${state.current[0]}.`;
    }

    finishAnswer();
}

function getCountryName(code) {
    const country = countries.find(item => item[2] === code);
    return country ? country[0] : "другая страна";
}

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
    ui.accuracy.textContent = `Точность ${getAccuracy()}%`;
    ui.next.classList.remove("hidden");
}

function getAccuracy() {
    const answered = state.index;

    if (answered === 0) {
        return 0;
    }

    return Math.round((state.correct / answered) * 100);
}

function updateHeader() {
    ui.topScore.textContent = state.score;
    ui.topStreak.textContent = state.streak;
}

function finishQuiz() {
    const accuracy = Math.round((state.correct / state.pool.length) * 100);

    ui.quiz.classList.add("hidden");
    ui.result.classList.remove("hidden");

    ui.resultScore.textContent = state.score;
    ui.resultCorrect.textContent = state.correct;
    ui.resultTotal.textContent = state.pool.length;
    ui.resultAccuracy.textContent = `${accuracy}%`;
    ui.resultBestStreak.textContent = state.bestStreak;

    if (accuracy >= 90) {
        ui.resultTitle.textContent = "Превосходный результат!";
    } else if (accuracy >= 70) {
        ui.resultTitle.textContent = "Очень хороший результат!";
    } else if (accuracy >= 50) {
        ui.resultTitle.textContent = "Хороший старт!";
    } else {
        ui.resultTitle.textContent = "Есть что повторить.";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
    ui.quiz.classList.add("hidden");
    ui.result.classList.add("hidden");
    ui.home.classList.remove("hidden");
    updateHeader();
    window.scrollTo({ top: 0, behavior: "smooth" });
}