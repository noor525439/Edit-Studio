import 'dotenv/config'
import express from "express"
import dbConnection from "./dbConnection.js"
import userRoute from "./routes/userRoute.js"
import cors from 'cors'

const app = express()
const Port = process.env.PORT || 3000
import fs from 'fs';
// Add this if it's not there
app.use('/uploads', express.static('uploads'));
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Uploads directory created successfully!");
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (origin === 'http://localhost:5173' || origin === 'http://localhost:5174') {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },

    credentials: true

}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
dbConnection()

app.use('/user', userRoute)

app.listen(Port, () => {
    console.log(`Server is running on the port ${Port}`);
})