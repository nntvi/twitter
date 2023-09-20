import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)

databaseService.connect() // sử dụng với class

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
