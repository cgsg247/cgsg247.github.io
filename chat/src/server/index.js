const http = require("http");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const port = 8002;

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static("dist"));

const distPath = path.join(__dirname, "..", "..", "dist");
app.use(express.static(distPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`Client connected with id: ${socket.id}`);

    socket.on("messageToServer", (msg) => {
        console.log(`Received message from ${msg}`);
        io.emit("messageFromServer", `${msg}`);
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected with id: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server started: ${JSON.stringify(server.address())}`);
});