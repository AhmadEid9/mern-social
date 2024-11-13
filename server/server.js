import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRouter from './routers/authRouter.js'

import {logMessage} from './utils/logMessage.js'
import connectDB from './db/connectDB.js'

dotenv.config()

const app = express()

//Middlewares
app.use(express.json())
app.use(cors())
app.use(cookieParser())


//Server Log
app.use((req, res, next) => {
    logMessage('success', `${req.method} ${req.url} ${res.statusCode}`)
    next()
})



//App Routes
app.use('/api/auth', authRouter)



app.listen(process.env.PORT, () => {
    logMessage('info', `Server running on port ${process.env.PORT}`)
    connectDB()
})