import { Router } from 'express'
const userRouter = Router()

userRouter.use(
  (req, res, next) => {
    console.log('Time 1:', Date.now())
    next()
  },
  (req, res, next) => {
    console.log('Time 2:', Date.now())
    next()
  }
)
userRouter.get('/tweets', (req, res) => {
  res.json([
    { id: 1, text: 'tweet 1' },
    { id: 2, text: 'tweet 2' }
  ])
})
export default userRouter
