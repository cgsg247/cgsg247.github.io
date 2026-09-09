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
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    answered: false,
    mapData: null,
    currentMapMode: null
};

const elements = {
    home: document.getElementById("homeScreen"),
    quiz: document.getElementById("quizScreen"),
    result: document.getElementById("resultScreen"),
    modeCards: document.querySelectorAll(".mode-card"),
    difficulty: document.getElementById("difficulty"),
    count: document.getElementById("questionCount"),
    start: document.getElementById("startButton"),
    back: document.getElementById("backButton"),
    restart: document.getElementById("restartButton"),
    next: document.getElementById("nextButton"),
    again: document.getElementById("againButton"),
    homeButton: document.getElementById("homeButton"),
    progress: document.getElementById("progressText"),
    accuracy: document.getElementById("accuracyText"),
    progressBar: document.getElementById("progressBar"),
    questionMode: document.getElementById("questionMode"),
    question: document.getElementById("questionText"),
    answers: document.getElementById("answerArea"),
    feedback: document.getElementById("feedback"),
    mapCard: document.getElementById("mapCard"),
    mapHint: document.getElementById("mapInstruction"),
    map: document.getElementById("mapContainer"),
    headerScore: document.getElementById("headerScore"),
    headerStreak: document.getElementById("headerStreak"),
    resultTitle: document.getElementById("resultTitle"),
    resultScore: document.getElementById("resultScore"),
    resultCorrect: document.getElementById("resultCorrect"),
    resultTotal: document.getElementById("resultTotal"),
    resultAccuracy: document.getElementById("resultAccuracy"),
    resultBestStreak: document.getElementById("resultBestStreak")
};

elements.modeCards.forEach(card => {
    card.addEventListener("click", () => {
        elements.modeCards.forEach(item => item.classList.remove("selected"));
        card.classList.add("selected");
        state.mode = card.dataset.mode;
    });
});

elements.start.addEventListener("click", startQuiz);
elements.back.addEventListener("click", showHome);
elements.restart.addEventListener("click", startQuiz);
elements.again.addEventListener("click", startQuiz);
elements.homeButton.addEventListener("click", showHome);
elements.next.addEventListener("click", () => {
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

function getPool() {
    const difficulty = elements.difficulty.value;

    if (difficulty === "standard") {
        return countries.filter(country => majorCodes.has(country[2]));
    }

    if (difficulty === "hard") {
        return countries.filter(country => !majorCodes.has(country[2]));
    }

    return countries;
}

function startQuiz() {
    const available = getPool();
    const requested = elements.count.value === "all"
        ? available.length
        : Number(elements.count.value);

    state.pool = shuffle(available).slice(0, Math.min(requested, available.length));
    state.index = 0;
    state.current = null;
    state.score = 0;
    state.streak = 0;
    state.bestStreak = 0;
    state.correct = 0;

    elements.headerScore.textContent = "0";
    elements.headerStreak.textContent = "0";
    elements.home.classList.add("hidden");
    elements.result.classList.add("hidden");
    elements.quiz.classList.remove("hidden");

    renderQuestion();
}

function renderQuestion() {
    if (state.index >= state.pool.length) {
        finishQuiz();
        return;
    }

    state.current = state.pool[state.index];
    state.answered = false;

    const selectedMode = state.mode === "mixed"
        ? shuffle(["country-capital", "capital-country", "map-country", "country-map", "capital-map"])[0]
        : state.mode;

    state.currentMapMode = selectedMode;

    elements.progress.textContent = `${state.index + 1} / ${state.pool.length}`;
    elements.progressBar.style.width = `${((state.index + 1) / state.pool.length) * 100}%`;
    elements.accuracy.textContent = `${getAccuracy()}%`;
    elements.feedback.textContent = "";
    elements.next.classList.add("hidden");
    elements.answers.replaceChildren();
    elements.mapCard.classList.add("hidden");

    if (selectedMode === "map-country" || selectedMode === "country-map" || selectedMode === "capital-map") {
        renderMapQuestion(selectedMode);
        return;
    }

    renderChoiceQuestion(selectedMode);
}

function renderChoiceQuestion(mode) {
    const isCountryToCapital = mode === "country-capital";
    const correct = isCountryToCapital ? state.current[1] : state.current[0];

    elements.questionMode.textContent = isCountryToCapital
        ? "СТРАНА → СТОЛИЦА"
        : "СТОЛИЦА → СТРАНА";

    elements.question.innerHTML = isCountryToCapital
        ? `Какая столица у страны <strong>${state.current[0]}</strong>?`
        : `К какой стране относится столица <strong>${state.current[1]}</strong>?`;

    const candidates = shuffle([
        correct,
        ...shuffle(
            countries
                .map(country => isCountryToCapital ? country[1] : country[0])
                .filter(value => value !== correct)
        ).slice(0, 3)
    ]);

    const wrapper = document.createElement("div");
    wrapper.className = "answers";

    candidates.forEach(answer => {
        const button = document.createElement("button");
        button.className = "answer-button";
        button.textContent = answer;
        button.addEventListener("click", () => checkChoice(button, answer, correct));
        wrapper.appendChild(button);
    });

    elements.answers.appendChild(wrapper);
}

function checkChoice(button, answer, correct) {
    if (state.answered) {
        return;
    }

    state.answered = true;

    document.querySelectorAll(".answer-button").forEach(item => {
        item.disabled = true;
    });

    const isCorrect = answer === correct;

    button.classList.add(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
        registerCorrect();
        elements.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
    } else {
        registerWrong();
        elements.feedback.textContent = `✗ Правильный ответ: ${correct}.`;
    }

    finishAnswer();
}

async function renderMapQuestion(mode) {
    elements.mapCard.classList.remove("hidden");
    elements.questionMode.textContent = getMapModeTitle(mode);

    if (mode === "map-country") {
        elements.question.innerHTML = "Какая страна указана в задании?";
        elements.mapHint.textContent = "Нажми на названную страну";
    }

    if (mode === "country-map") {
        elements.question.innerHTML = `Найди на карте <strong>${state.current[0]}</strong>`;
        elements.mapHint.textContent = "Нажми на нужную страну";
    }

    if (mode === "capital-map") {
        elements.question.innerHTML = `Где находится страна со столицей <strong>${state.current[1]}</strong>?`;
        elements.mapHint.textContent = "Нажми на нужную страну";
    }

    try {
        await loadMap();
        renderMapTarget(mode);
    } catch {
        elements.map.innerHTML = `<div class="map-error">Не удалось загрузить карту. Проверь подключение к интернету.</div>`;
    }
}

function getMapModeTitle(mode) {
    const titles = {
        "map-country": "КАРТА → СТРАНА",
        "country-map": "СТРАНА → КАРТА",
        "capital-map": "СТОЛИЦА → КАРТА"
    };

    return titles[mode];
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

    state.mapData.features.forEach(feature => {
        const properties = feature.properties || {};
        const name = properties.NAME || properties.name || properties.ADMIN || "";
        const code = getMapCode(name);

        if (!code) {
            return;
        }

        createFeaturePaths(feature.geometry).forEach(pathData => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", pathData);
            path.classList.add("country");
            path.dataset.code = code;
            path.dataset.name = name;
            path.addEventListener("click", () => checkMapAnswer(path, code));
            svg.appendChild(path);
        });
    });

    elements.map.replaceChildren(svg);
}

function createFeaturePaths(geometry) {
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
        return geometry.coordinates.flatMap(polygon =>
            [polygon.map(convertRing).join(" ")]
        );
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

function renderMapTarget(mode) {
    document.querySelectorAll(".country").forEach(path => {
        path.classList.remove("target", "correct", "wrong");
    });

    if (mode === "map-country") {
        return;
    }

    document.querySelectorAll(".country").forEach(path => {
        if (path.dataset.code === state.current[2]) {
            path.classList.add("target");
        }
    });
}

function checkMapAnswer(path, code) {
    if (state.answered) {
        return;
    }

    state.answered = true;

    const isCorrect = code === state.current[2];

    path.classList.add(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
        registerCorrect();
        elements.feedback.textContent = `✓ Правильно! ${state.current[0]} — ${state.current[1]}.`;
    } else {
        registerWrong();
        elements.feedback.textContent = `✗ Это ${getCountryName(code)}. Ищи: ${state.current[0]}.`;
        document.querySelectorAll(".country").forEach(item => {
            if (item.dataset.code === state.current[2]) {
                item.classList.add("target");
            }
        });
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
    elements.headerScore.textContent = state.score;
    elements.headerStreak.textContent = state.streak;
    elements.accuracy.textContent = `${getAccuracy()}%`;
    elements.next.classList.remove("hidden");
}

function getAccuracy() {
    const answered = state.index;
    return answered === 0 ? 0 : Math.round((state.correct / answered) * 100);
}

function finishQuiz() {
    const accuracy = Math.round((state.correct / state.pool.length) * 100);

    elements.quiz.classList.add("hidden");
    elements.result.classList.remove("hidden");

    elements.resultScore.textContent = state.score;
    elements.resultCorrect.textContent = state.correct;
    elements.resultTotal.textContent = state.pool.length;
    elements.resultAccuracy.textContent = `${accuracy}%`;
    elements.resultBestStreak.textContent = state.bestStreak;

    if (accuracy >= 90) {
        elements.resultTitle.textContent = "Превосходный результат!";
    } else if (accuracy >= 70) {
        elements.resultTitle.textContent = "Очень хороший результат!";
    } else if (accuracy >= 50) {
        elements.resultTitle.textContent = "Неплохо, но есть что повторить.";
    } else {
        elements.resultTitle.textContent = "Пора ещё раз пройтись по карте.";
    }
}

function showHome() {
    elements.quiz.classList.add("hidden");
    elements.result.classList.add("hidden");
    elements.home.classList.remove("hidden");
}