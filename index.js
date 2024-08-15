// server/index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

let users = {};

const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("register", (number) => {
        users[number] = socket.id;
    });

    socket.on("call-user", (data) => {
        const { calleeId, callerInfo, signalData } = data;

        const calleeSocketId = users[calleeId];

        if (calleeSocketId) {
            io.to(calleeSocketId).emit("incoming-call", {
                calleeId,
                callerInfo,
                signalData,
            });
        }
    });

    socket.on("answerCall", (data) => {
        io.to(users[data.to]).emit("callAccepted", data.signal);
    });

    socket.on("disconnect", () => {
        for (let userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
