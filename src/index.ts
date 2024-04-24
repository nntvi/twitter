import express, { Request, Response, NextFunction } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
config()

databaseService.connect() // sử dụng với class
const app = express()
const port = process.env.PORT || 3000

// tạo folder upload
initFolder()
app.use(express.json()) // parse request body ra gửi lên nó mới hỉu => này là "App handler" nè
app.use('/users', usersRouter) // đi vào route => "Route handler" nè
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
