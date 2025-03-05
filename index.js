import 'dotenv/config'
import express from "express"
import apiRouter from './src/routes/api.router.js';
import morgan from 'morgan';
import globalErrorHandler from './src/utils/globalErrorHandler.js';

const requiredEnvVars = ['NODE_ENV', 'GLOBAL_API_PREFIX', 'DATABASE_URL'];
if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            console.error(`Missing required environment variable: ${varName}`);
            process.exit(1);
        }
    });
}

const app = express()
app.use(morgan('dev'))
app.use(express.json({ limit: "10kb" }))

const GLOBAL_API_PREFIX = process.env.GLOBAL_API_PREFIX || '/api/v1'

app.use(GLOBAL_API_PREFIX, apiRouter)

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: "Invalid URL"
    })
})


app.use(globalErrorHandler)

const PORT = process.env.PORT || 2000
const NODE_ENV = process.env.NODE_ENV || "development"

app.listen(PORT, () =>
    console.log(`Server started on port ${PORT} in ${NODE_ENV} mode`))
