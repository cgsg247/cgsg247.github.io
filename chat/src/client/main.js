import { io } from "socket.io-client";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
    const socket = io();

    socket.on("connect", () => {
        console.log(socket.id);
        socket.emit("messageToServer", `${getRandomInt(1, 10)}`);
        socket.on("messageFromServer", function (msg) {
            const messages = document.getElementById("main")
            const item = document.createElement('li');
            item.textContent = msg;
            messages.appendChild(item);
            console.log(msg);
        });
    });

    socket.on("disconnect", () => {
        console.log(socket.id);
    });
}

window.addEventListener("load", () => {
    main();
});