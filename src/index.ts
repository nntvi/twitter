import express, { Request, Response, NextFunction } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
databaseService.connect() // sử dụng với class
const app = express()
const port = 3000
app.use(express.json()) // parse request body ra gửi lên nó mới hỉu => này là "App handler" nè
app.use('/users', usersRouter) // đi vào route => "Route handler" nè
app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
