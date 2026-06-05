import { io } from "socket.io-client";

let socket;
let currentUserId = null;

// Генерация случайного ID пользователя
function generateUserId() {
    return "user_" + Math.random().toString(36).substr(2, 9);
}

// Проверка авторизации
async function checkAuth() {
    const savedUserId = localStorage.getItem("userId");
    const savedNickname = localStorage.getItem("nickname");
    
    if (savedUserId && savedNickname) {
        currentUserId = savedUserId;
        showChat({ id: savedUserId, nickname: savedNickname });
    } else {
        showRegistration();
    }
}

// Показ формы регистрации
function showRegistration() {
    const container = document.getElementById("main");
    if (!container) return;
    
    container.innerHTML = `
        <div class="registration-form">
            <h2>Регистрация</h2>
            <input type="text" id="nicknameInput" placeholder="Введите никнейм (мин. 3 символа)" />
            <button id="registerBtn">Войти в чат</button>
            <div id="registerError" class="error"></div>
        </div>
    `;
    
    document.getElementById("registerBtn").addEventListener("click", handleRegister);
    document.getElementById("nicknameInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleRegister();
    });
}

// Обработка регистрации
async function handleRegister() {
    const nicknameInput = document.getElementById("nicknameInput");
    const errorDiv = document.getElementById("registerError");
    const nickname = nicknameInput.value.trim();
    
    if (!nickname || nickname.length < 3) {
        errorDiv.textContent = "Никнейм должен содержать минимум 3 символа";
        return;
    }
    
    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUserId = data.user.id;
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("nickname", data.user.nickname);
            showChat(data.user);
        } else {
            errorDiv.textContent = data.error;
        }
    } catch (error) {
        console.error("Registration error:", error);
        errorDiv.textContent = "Ошибка регистрации";
    }
}

// Показ чата
function showChat(user) {
    const container = document.getElementById("main");
    if (!container) return;

    container.innerHTML = `
        <div class="chat-container">
            <div class="chat-header">
                <h2>Чат</h2>
                <div class="user-info">
                    <span>Привет, ${user.nickname}!</span>
                    <button id="logoutBtn">Выйти</button>
                </div>
            </div>
            <div class="search-section">
                <h3>Поиск пользователя</h3>
                <input type="text" id="searchInput" placeholder="Введите никнейм для поиска" />
                <button id="searchBtn">Найти</button>
                <div id="searchResult" class="search-result"></div>
            </div>
            <div class="messages-section">
                <h3>Сообщения</h3>
                <ul id="messagesList"></ul>
                <div class="message-input">
                    <input type="text" id="messageInput" placeholder="Введите сообщение..." />
                    <button id="sendBtn">Отправить</button>
                </div>
            </div>
        </div>
    `;
    
    // Привязываем обработчики
    document.getElementById("logoutBtn").onclick = handleLogout;
    document.getElementById("searchBtn").onclick = handleSearch;
    document.getElementById("sendBtn").onclick = sendMessage;
    
    document.getElementById("searchInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
    });
    
    document.getElementById("messageInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
    
    initSocket();
}

// Поиск пользователя
async function handleSearch() {
    const searchInput = document.getElementById("searchInput");
    const resultDiv = document.getElementById("searchResult");
    const nickname = searchInput.value.trim();
    
    if (!nickname) {
        resultDiv.innerHTML = '<div class="error">Введите никнейм</div>';
        return;
    }
    
    try {
        const response = await fetch(`/api/search/${encodeURIComponent(nickname)}`);
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `<div class="success">Найден: <strong>${data.user.nickname}</strong></div>`;
        } else {
            resultDiv.innerHTML = '<div class="error">Пользователь не найден</div>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">Ошибка поиска</div>';
    }
}

// Выход
function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
    currentUserId = null;
    if (socket) {
        socket.disconnect();
    }
    showRegistration();
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    
    // 1. Проверяем, существует ли вообще инпут на странице
    if (!messageInput) {
        console.error("Критическая ошибка: Поле ввода messageInput не найдено в DOM!");
        return;
    }

    const message = messageInput.value.trim();
    
    // 2. Достаем данные напрямую из localStorage (это на 100% надежно)
    const savedUserId = localStorage.getItem("userId");
    const savedNickname = localStorage.getItem("nickname");

    // Отладочный лог в консоль браузера (F12) — посмотрите, что туда пишется!
    console.log("Попытка отправки сообщения:", {
        userId: savedUserId,
        username: savedNickname,
        message: message,
        socketConnected: socket ? socket.connected : false
    });

    // 3. Проверяем заполнение всех данных перед отправкой
    if (!message) {
        console.warn("Предупреждение: Текст сообщения пустой.");
        return;
    }
    
    if (!savedUserId || !savedNickname) {
        console.error("Ошибка авторизации: ID или никнейм отсутствуют в localStorage.");
        return;
    }

    if (!socket) {
        console.error("Ошибка сети: Socket.io не инициализирован.");
        return;
    }

    // 4. Отправляем ПОЛНЫЙ пакет данных на сервер
    socket.emit("messageToServer", {
        userId: savedUserId,
        username: savedNickname, // Передаем имя прямо здесь
        message: message
    });

    // Очищаем поле ввода
    messageInput.value = "";
    messageInput.focus();
}

// Инициализация socket.io
function initSocket() {
    // Отключаемся если уже подключены
    if (socket) {
        socket.disconnect();
    }
    
    socket = io();
    
    socket.on("connect", () => {
        console.log("Connected to server");
        
        // ВАЖНО: Регистрируем сессию в памяти сервера сразу при подключении
        const savedUserId = localStorage.getItem("userId");
        const savedNickname = localStorage.getItem("nickname");
        if (savedUserId && savedNickname) {
            socket.emit("identify", { id: savedUserId, nickname: savedNickname });
        }
    });
    
    // Получение истории сообщений
    socket.on("messageHistory", (history) => {
        const messagesList = document.getElementById("messagesList");
        if (messagesList) {
            messagesList.innerHTML = "";
            history.forEach(msg => {
                addMessageToList(msg);
            });
            scrollToBottom();
        }
    });
    
    // Получение нового сообщения
    socket.on("messageFromServer", (msg) => {
        addMessageToList(msg);
        scrollToBottom();
    });
    
    socket.on("disconnect", () => {
        console.log("Disconnected from server");
    });
}

function addMessageToList(msg) {
    const messagesList = document.getElementById("messagesList");
    if (!messagesList || !msg) return;
    
    // 1. Берем имя из username или из nickname (на всякий случай)
    const username = msg.username || msg.nickname || "Неизвестный";
    
    // 2. ЖЕЛЕЗНАЯ ПРОВЕРКА ТЕКСТА: проверяем и text, и message
    const text = msg.text || msg.message || ""; 
    
    // 3. Форматирование времени
    const rawDate = msg.timestamp ? new Date(msg.timestamp) : new Date();
    const isValidDate = !isNaN(rawDate.getTime());
    const time = isValidDate 
        ? rawDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
        : "--:--";
    
    // 4. Вывод на экран
    const item = document.createElement("li");
    item.innerHTML = `<strong>${username}</strong> <span class="time">[${time}]</span>: ${text}`;
    messagesList.appendChild(item);
}

// Прокрутка вниз
function scrollToBottom() {
    const messagesList = document.getElementById("messagesList");
    if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
    }
}

// Запуск приложения
window.addEventListener("load", checkAuth);