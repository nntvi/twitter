import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
import userService from '~/services/users.services'

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  try {
    const result = await userService.register(req.body)
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
