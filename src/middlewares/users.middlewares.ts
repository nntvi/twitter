import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import userService from '~/services/users.services'
import { validate } from '~/utils/validation'
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields must be filled' })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      isLength: {
        options: { min: 3, max: 50 },
        errorMessage: 'Name must be at least 3 characters'
      },
      trim: true
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      errorMessage: 'Email is not valid',
      custom: {
        options: async (value) => {
          const user = await userService.checkEmailExist(value)
          if (user) {
            throw new Error('Email existed')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        errorMessage: 'Mật khẩu không hợp lệ',
        options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
      }
    },
    confirm_password: {
      notEmpty: true,
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        errorMessage: 'Mật khẩu không hợp lệ',
        options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Mật khẩu xác nhận không khớp')
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        // 1 chuẩn quốc tế về ngày tháng năm
        options: {
          strict: true, // phải tuân theo ISO 8601 chặt chẽ, ko chấp nhận các biến thể ko chính thống của định dạng ngày tháng năm
          strictSeparator: true // các ký tự ngăn cách trong ngày tháng năm (như dấu -, /) phải đúng quy định
        }
      }
    }
  })
)
