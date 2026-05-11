import { ServerApiVersion } from "mongodb";
import mongoose from 'mongoose';

const dbConnection = async () => {
    const mongoURL = process.env.MONGO_URL;
    if (!mongoURL) {
        console.error("Error: MONGO_URL is not defined in .env file");
        return;
    }

    try {
        await mongoose.connect(mongoURL, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        console.log(`Data Base is Successfully Connected`);
    } catch (error) {
        console.error("Database Connection Error: ", error.message);
        process.exit(1); 
    }
}

export default dbConnection;