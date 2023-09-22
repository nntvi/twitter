import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const result = await userService.register({ email, password })
    return res.status(200).json({
      message: 'Register success',
      result
    })
  } catch (error) {
    return res.status(400).json({
      error: error,
      message: 'Register failed'
    })
  }
}
