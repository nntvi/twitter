import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LogoutBody } from '~/models/requests/User.requests'
import userService from '~/services/users.services'

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json(result)
}
