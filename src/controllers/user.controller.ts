import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { userMessages } from '~/constants/messages'
import {
  EmailVerifyTokenBody,
  ForgotPasswordTokenBody,
  LoginReqBody,
  LogoutBody,
  RegisterReqBody,
  ResetPasswordBody,
  TokenPayload,
  UpdateMeRequestBody,
  VerifyForgotPasswordTokenBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.status(200).json({
    message: userMessages.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  return res.status(200).json({
    message: userMessages.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json(result)
}

export const emailVerifyValidatorController = async (
  req: Request<ParamsDictionary, any, EmailVerifyTokenBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_email_verify_token as TokenPayload
  const user = await userService.findUserById(user_id)
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  // Nếu đã verify rồi -> không báo lỗi -> trả status 200 -> message: Đã verify thành công
  if (user.email_verified_token === '') {
    return res.status(200).json({
      message: userMessages.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await userService.verifyEmail(user_id)
  return res.status(200).json({
    message: userMessages.EMAIL_VERIFIED_SUCCESSFULLY,
    result
  })
}
export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await userService.findUserById(user_id)
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(200).json({
      message: userMessages.EMAIL_ALREADY_VERIFIED
    })
  }

  const result = await userService.resendVerifyEmail(user_id)
  return res.json(result) // vì return này chỉ là 1 obj có duy nhất 1 key là message
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordTokenBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User
  const result = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({ message: userMessages.VERIFY_FORGOT_PASSWORD_SUCCESSFULLY })
}
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await userService.resetPassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await userService.findUserById(user_id)
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  return res.json({
    message: userMessages.GET_ME_SUCCESSFULLY,
    result: user
  })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { body } = req
  console.log('🚀 ~ body:', body)
  const user = await userService.updateMe(user_id, body)
  return res.json({
    message: userMessages.UPDATE_ME_SUCCESSFULLY,
    result: user
  })
}
