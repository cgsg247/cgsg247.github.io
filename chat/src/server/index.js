const http = require("http");
const express = require("express");
const logger = require("morgan");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8002;

app.use(logger("dev"));
app.use(express.json());
app.use(express.static("dist"));

const server = http.createServer(app);
const io = new Server(server);

// Хранилище пользователей в памяти (id -> { id, nickname })
const users = new Map();

// Путь к файлу с сообщениями
const messagesFilePath = path.join(__dirname, "messages.json");

// Загрузка сообщений из файла
function loadMessages() {
    try {
        if (fs.existsSync(messagesFilePath)) {
            const data = fs.readFileSync(messagesFilePath, "utf8");
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Error loading messages:", error);
    }
    return [];
}

// Сохранение сообщений в файл
function saveMessages(messages) {
    try {
        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving messages:", error);
    }
}

// --- API ЭНДПОИНТЫ ---

// Регистрация пользователя
app.post("/api/register", (req, res) => {
    const { nickname } = req.body;

    if (!nickname || nickname.trim().length < 3) {
        return res.status(400).json({ success: false, error: "Невалидный никнейм" });
    }

    const trimmedNickname = nickname.trim();

    // Проверка на уникальность никнейма
    const userExists = Array.from(users.values()).some(u => u.nickname.toLowerCase() === trimmedNickname.toLowerCase());
    if (userExists) {
        return res.status(400).json({ success: false, error: "Никнейм уже занят" });
    }

    // Генерация ID
    const userId = "user_" + Math.random().toString(36).substr(2, 9);
    const newUser = { id: userId, nickname: trimmedNickname };

    users.set(userId, newUser);

    res.json({ success: true, user: newUser });
});

// Поиск пользователя по никнейму
app.get("/api/search/:nickname", (req, res) => {
    const searchName = decodeURIComponent(req.params.nickname).trim().toLowerCase();

    const foundUser = Array.from(users.values()).find(u => u.nickname.toLowerCase() === searchName);

    if (foundUser) {
        res.json({ success: true, user: foundUser });
    } else {
        res.status(404).json({ success: false, error: "Пользователь не найден" });
    }
});


// --- СВЯЗЬ ЧЕРЕЗ SOCKET.IO ---

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // При подключении отправляем историю сообщений
    const messagesHistory = loadMessages();
    socket.emit("messageHistory", messagesHistory);

    // НОВОЕ: Обработка идентификации пользователя при обновлении страницы
    socket.on("identify", (userData) => {
        if (userData && userData.id && userData.nickname) {
            users.set(userData.id, {
                id: userData.id,
                nickname: userData.nickname.trim()
            });
            console.log(`User identified: ${userData.nickname} (${userData.id})`);
        }
    });

    socket.on("messageFromClient", (data) => {
        // Принимаем всё, что прислал клиент
        const { userId, username, message } = data;

        console.log("Сервер принял данные:", data); // Лог в терминале сервера

        if (!message || !message.trim() || !userId || !username) {
            console.log("Сервер отклонил сообщение: неполные данные");
            return;
        }

        const newMessage = {
            id: "msg_" + Math.random().toString(36).substr(2, 9),
            userId: userId,
            username: username.trim(),
            // Дублируем для совместимости со старым и новым клиентским кодом:
            text: message.trim(),
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        // Запись в файл
        const history = loadMessages();
        history.push(newMessage);
        saveMessages(history);

        // Рассылка всем подключенным пользователям
        io.emit("messageFromServer", newMessage);
    });
});

server.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});