import { NextFunction, Request, RequestHandler } from 'express'
import { ParamSchema, check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { userMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.PASSWORD_REQUIRED
  },
  isString: {
    errorMessage: userMessages.PASSWORD_STRING
  },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: userMessages.PASSWORD_LENGTH
  },
  isStrongPassword: {
    errorMessage: userMessages.PASSWORD_MUST_BE_STRONG,
    options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
  }
}
const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.CONFIRM_PASSWORD_REQUIRED
  },
  isLength: {
    options: { min: 6, max: 50 }
  },
  isStrongPassword: {
    errorMessage: userMessages.CONFIRM_PASSWORD_MUST_BE_STRONG,
    options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(userMessages.CONFIRM_PASSWORD_MUST_MATCH)
      }
      return true
    }
  }
}
const forgotPasswordToken: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: userMessages.FORGOT_PASSWORD_TOKEN_REQUIRED,
          status: httpStatus.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOnPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await userService.findUserById(user_id)
        if (!user) {
          throw new ErrorWithStatus({
            message: userMessages.USER_NOT_FOUND,
            status: httpStatus.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: userMessages.FORGOT_PASSWORD_TOKEN_INVALID,
            status: httpStatus.UNAUTHORIZED
          })
        }
        ;(req as Request).decode_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: httpStatus.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: userMessages.NAME_REQUIRED
  },
  isString: {
    errorMessage: userMessages.NAME_IS_STRING
  },
  isLength: {
    options: { min: 3, max: 50 },
    errorMessage: userMessages.NAME_LENGTH
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    // 1 chuẩn quốc tế về ngày tháng năm
    options: {
      strict: true, // phải tuân theo ISO 8601 chặt chẽ, ko chấp nhận các biến thể ko chính thống của định dạng ngày tháng năm
      strictSeparator: true // các ký tự ngăn cách trong ngày tháng năm (như dấu -, /) phải đúng quy định
    },
    errorMessage: userMessages.DATE_OF_BIRTH_IS_ISO8601
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: userMessages.IMAGE_IS_STRING
  },
  trim: true,
  isLength: {
    options: { min: 3, max: 200 },
    errorMessage: userMessages.IMAGE_LENGTH
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: userMessages.INVALID_USER_ID,
          status: httpStatus.NOT_FOUND
        })
      }
      const user = await userService.findUserById(value)
      if (user === null) {
        throw new ErrorWithStatus({
          message: userMessages.USER_NOT_FOUND,
          status: httpStatus.NOT_FOUND
        })
      }
    }
  }
}
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: userMessages.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            // nếu tìm ko thấy báo lỗi
            if (user === null) {
              throw new Error(userMessages.EMAIL_OR_PASSWORD_INCORRECT)
            }
            // còn không truyền ngược lại qua controller thông qua req
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: userMessages.PASSWORD_REQUIRED
        },
        isString: {
          errorMessage: userMessages.PASSWORD_STRING
        },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: userMessages.PASSWORD_LENGTH
        },
        isStrongPassword: {
          errorMessage: userMessages.PASSWORD_MUST_BE_STRONG,
          options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: userMessages.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const user = await userService.checkEmailExist(value)
            if (user) {
              throw new Error(userMessages.EMAIL_ALREADY_EXIST)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const accessToken = (value || '').split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({
                message: userMessages.ACCESS_TOKEN_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decode_authorization = await verifyToken({
                token: accessToken,
                secretOnPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decode_authorization = decode_authorization
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: httpStatus.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.REFRESH_TOKEN_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const [decode_refresh_token, exist_refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOnPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                userService.checkRefreshTokenExist(value)
              ])
              if (!exist_refresh_token) {
                throw new ErrorWithStatus({
                  message: userMessages.REFRESH_TOKEN_NOT_FOUND_OR_USED,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              ;(req as Request).decode_refresh_token = decode_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.EMAIL_VERIFY_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decode_email_verify_token = await verifyToken({
                token: value,
                secretOnPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decode_email_verify_token = decode_email_verify_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: httpStatus.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: userMessages.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.findUserByEmail(value)
            if (user === null) {
              throw new Error(userMessages.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordToken
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordToken
    },
    ['body']
  )
)

export const verifiedUserValidator: RequestHandler = (req: Request, res, next) => {
  const { verify } = req.decode_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: userMessages.USER_NOT_VERIFIED,
        status: httpStatus.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: {
        optional: true,
        isString: {
          errorMessage: userMessages.BIO_IS_STRING
        },
        trim: true,
        isLength: {
          options: { min: 3, max: 200 },
          errorMessage: userMessages.BIO_LENGTH
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: userMessages.LOCATION_IS_STRING
        },
        trim: true,
        isLength: {
          options: { min: 3, max: 200 },
          errorMessage: userMessages.LOCATION_LENGTH
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: userMessages.WEBSITE_IS_STRING
        },
        trim: true,
        isLength: {
          options: { min: 3, max: 50 },
          errorMessage: userMessages.WEBSITE_LENGTH
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: userMessages.USERNAME_IS_STRING
        },
        trim: true,
        isLength: {
          options: { min: 3, max: 50 },
          errorMessage: userMessages.USERNAME_LENGTH
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: userIdSchema
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: userIdSchema
    },
    ['params']
  )
)
