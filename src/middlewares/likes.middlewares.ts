import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'

export const createLikeValidator = validate(
  checkSchema({
    tweet_id: {
      notEmpty: true,
      custom: {
        options: (value) => {
          return ObjectId.isValid(value)
        }
      }
    }
  })
)
