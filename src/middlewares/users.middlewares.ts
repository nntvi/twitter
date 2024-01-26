import { checkSchema } from 'express-validator'
import { userMessageError } from '~/constants/messages'
import databaseService from '~/services/database.services'
import userService from '~/services/users.services'
import { validate } from '~/utils/validation'
export const loginValidator = validate(
  checkSchema({
    email: {
      isEmail: {
        errorMessage: userMessageError.EMAIL_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          // nếu tìm ko thấy báo lỗi
          if (user === null) {
            throw new Error(userMessageError.USER_NOT_FOUND)
          }
          // còn không truyền ngược lại qua controller thông qua req
          req.user = user
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: userMessageError.PASSWORD_REQUIRED
      },
      isString: {
        errorMessage: userMessageError.PASSWORD_STRING
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: userMessageError.PASSWORD_LENGTH
      },
      isStrongPassword: {
        errorMessage: userMessageError.PASSWORD_MUST_BE_STRONG,
        options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
      }
    }
  })
)

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: userMessageError.NAME_REQUIRED
      },
      isString: {
        errorMessage: userMessageError.NAME_IS_STRING
      },
      isLength: {
        options: { min: 3, max: 50 },
        errorMessage: userMessageError.NAME_LENGTH
      },
      trim: true
    },
    email: {
      isEmail: {
        errorMessage: userMessageError.EMAIL_INVALID
      },
      trim: true,
      custom: {
        options: async (value) => {
          const user = await userService.checkEmailExist(value)
          if (user) {
            throw new Error(userMessageError.EMAIL_ALREADY_EXIST)
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: userMessageError.PASSWORD_REQUIRED
      },
      isString: {
        errorMessage: userMessageError.PASSWORD_STRING
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: userMessageError.PASSWORD_LENGTH
      },
      isStrongPassword: {
        errorMessage: userMessageError.PASSWORD_MUST_BE_STRONG,
        options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: userMessageError.CONFIRM_PASSWORD_REQUIRED
      },
      isLength: {
        options: { min: 6, max: 50 }
      },
      isStrongPassword: {
        errorMessage: userMessageError.CONFIRM_PASSWORD_MUST_BE_STRONG,
        options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(userMessageError.CONFIRM_PASSWORD_MUST_MATCH)
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
        },
        errorMessage: userMessageError.DATE_OF_BIRTH_IS_ISO8601
      }
    }
  })
)
