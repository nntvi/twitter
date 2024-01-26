import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { userMessageError } from '~/constants/messages'
import { RegisterReqBody } from '~/models/requests/User.requests'
import userService from '~/services/users.services'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.status(200).json({
    message: userMessageError.REGISTER_SUCCESS,
    result
  })
}
