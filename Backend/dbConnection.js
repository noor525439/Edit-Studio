import { ServerApiVersion } from "mongodb"
import mongoose from 'mongoose'
const dbConnection = async () => {

    const mongoURL = process.env.MONGO_URL
    try {
        mongoose.connect(mongoURL, {
            ServerApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });
        console.log(`Data Base is Sucessfully Connected`);

    } catch (error) {
        console.log("There is some error: ", error);
    }
}
export default dbConnection;