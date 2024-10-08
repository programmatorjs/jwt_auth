import mongoose from "mongoose";
import config from "config";

const dbUrl = `mongodb://${config.get('dbName')}:${config.get(
    'dbPass'
)}@localhost:6000/jwtAuth?authSource=admin`

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log("Connected to DB");
    } catch (e: any) {
        console.log(e.message);
        setTimeout(connectDB, 5000);
    }
}

export default connectDB;