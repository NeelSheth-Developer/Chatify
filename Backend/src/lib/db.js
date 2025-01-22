import mongoose from 'mongoose';

const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_SUFFIX}`;

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected', conn.connection.host);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

