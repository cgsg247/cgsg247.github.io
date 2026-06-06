import { io } from "socket.io-client";

async function main() {
    const socket = io();

    const inputField = document.getElementById('myInput');
    const sendButton = document.getElementById('sendBtn');
    const messagesList = document.getElementById("main");
    const statusDiv = document.getElementById('connectionStatus');

    let userName = "";
    let hasName = false;

    socket.on("connect", () => {
        console.log(`Connect: ${socket.id}`);

        statusDiv.textContent = "Связь с сервером установлена!";
        statusDiv.style.color = "#2ecc71";

        inputField.disabled = false;
        sendButton.disabled = false;
    });

    socket.on("connect_error", (error) => {
        console.error("Ошибка соединения:", error);

        statusDiv.textContent = `Ошибка соединения: ${error.message}.`;
        statusDiv.style.color = "#e74c3c";

        inputField.disabled = true;
        sendButton.disabled = true;
    });

    function handleSubmission() {
        const text = inputField.value;
        if (text === "")
            return;

        if (!hasName) {
            if (text.length < 3 || text.length > 25) {
                inputField.value = "";
                inputField.placeholder = "Имя должно быть от 3 до 25 символов!";
                return;
            }
            userName = text;
            hasName = true;
            socket.emit("messageToServer", `Пользователь ${userName} вошел в чат`);
            inputField.placeholder = "Введите сообщение...";
            sendButton.textContent = "Отправить";
            inputField.value = "";
        } else {
            socket.emit("messageToServer", `${userName}: ${text}`);
            inputField.value = "";
        }
    }

    sendButton.addEventListener('click', handleSubmission);

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmission();
        }
    });

    socket.on("messageFromServer", function (msg) {
        const item = document.createElement('li');
        item.textContent = msg;
        messagesList.appendChild(item);

        const chatBox = messagesList.parentElement;
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    socket.on("disconnect", (reason) => {
        console.log(`Disconnect: ${reason}`);

        statusDiv.textContent = "Соединение потеряно.";
        statusDiv.style.color = "#f1c40f";

        inputField.disabled = true;
        sendButton.disabled = true;
    });
}

window.addEventListener("load", () => {
    main();
});