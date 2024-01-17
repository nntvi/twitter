import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
// nơi xử lý logic
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'a@gmail.com' && password === '123123') {
    return res.status(200).json({
      message: 'Login success'
    })
  }
  return res.status(400).json({
    message: 'Login failed'
  })
}

// export const registerController = async (req: Request, res: Response) => {
//   const { email, password } = req.body
//   try {
//     const result = await userService.register({ email, password })
//     return res.json({
//       message: 'Register success'
//     })
//   } catch (error) {
//     return res.status(400).json({
//       message: 'Register failed'
//     })
//   }
// }
