import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { userMessages } from '~/constants/messages'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
// nơi xử lý logic
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login(user_id.toString())
  return res.status(200).json({
    message: userMessages.LOGIN_SUCCESS,
    result
  })
}
