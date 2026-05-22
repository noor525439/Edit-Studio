import 'dotenv/config'
import express from "express"
import dbConnection from "./dbConnection.js"
import userRoute from "./routes/userRoute.js"
import workflowRoute, { reviewApiRouter } from "./routes/workflowRoute.js"
import usersApiRoute from "./routes/usersApiRoute.js"
import supportRoute from "./routes/supportRoute.js"
import notificationRoute from "./routes/notificationRoute.js";
import cors from 'cors'
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { setSocketServer, registerUserSocket, unregisterUserSocket } from "./utils/socket.js";
import { stripeWebhook } from "./Controllers/ProjectWorkflowController.js";

const app = express()
const server = http.createServer(app);
const Port = process.env.PORT || 3000
import fs from 'fs';
app.use('/uploads', express.static('uploads'));
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Uploads directory created successfully!");
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },

    credentials: true

}));

app.post(
    "/webhook/stripe",
    express.raw({ type: "application/json" }),
    stripeWebhook
);

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
dbConnection()


app.use('/user', userRoute)
app.use('/api/users', usersApiRoute)
app.use('/workflow', workflowRoute)
app.use('/api/reviews', reviewApiRouter)
app.use('/api/support', supportRoute)
app.use('/workflow/notifications', notificationRoute);



const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    }
});
setSocketServer(io);
app.set('io', io);

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Missing token"));
        const decoded = jwt.verify(token, process.env.SECREAT_KEY);
        socket.userId = String(decoded.id);
        return next();
    } catch (error) {
        return next(new Error("Invalid token"));
    }
});

io.on("connection", (socket) => {
    registerUserSocket(socket.userId, socket.id);
    socket.join(`user_${socket.userId}`);
    socket.on("join_admin_room", (role) => {
        if (role === 'admin') {
            socket.join('admin_room');
        }
    });
    
    socket.on("disconnect", () => {
        unregisterUserSocket(socket.id);
    });
});

server.listen(Port, () => {
    console.log(`Server is running on the port ${Port}`);
})