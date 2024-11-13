import mongoose from "mongoose"

import { logMessage } from "../utils/logMessage.js"
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        
        logMessage('success', `Database connected to ${conn.connection.host}`)
        
    } catch (error) {
        logMessage('error', 'Failed to connect to database')
    }
}

export default connectDB