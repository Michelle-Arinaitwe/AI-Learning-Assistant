import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            connectTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 15000,  // fail fast, retry via setTimeout
            retryWrites: true,
            w: 'majority'
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        console.error('Retrying connection in 5 seconds...');

        // Retry connection after 5 seconds instead of exiting
        setTimeout(() => {
            console.log('Attempting to reconnect to MongoDB...');
            connectDB();
        }, 5000);
    }
};

export default connectDB;