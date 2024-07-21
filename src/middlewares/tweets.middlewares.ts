import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import httpStatus from '~/constants/httpStatus'
import { tweetMessages, userMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import tweetServices from '~/services/tweets.services'
import userService from '~/services/users.services'
import { numberEnumToArray } from '~/utils/commons'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudience = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema({
    type: {
      notEmpty: true,
      isIn: {
        options: [tweetTypes],
        errorMessage: tweetMessages.TWEET_TYPE_INVALID
      }
    },
    audience: {
      notEmpty: true,
      isIn: {
        options: [tweetAudience],
        errorMessage: tweetMessages.TWEET_AUDIENCE_INVALID
      }
    },
    parent_id: {
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          // Nếu type là retweet, comment hoặc quoute thì parent_id phải là tweet_id của tweet CHA
          if ([TweetType.Retweet, TweetType.QuoteTweet, TweetType.Comment].includes(type) && !ObjectId.isValid(value)) {
            throw new Error(tweetMessages.TWEET_PARENT_ID_INVALID)
          }

          // nếu type là tweet thì parent_id là null
          if (type === TweetType.Tweet && value !== null) {
            throw new Error(tweetMessages.TWEET_PARENT_ID_INVALID)
          }

          return true
        }
      }
    },
    content: {
      isString: true,
      custom: {
        options: (value, { req }) => {
          const type = req.body.type as TweetType
          const hashtags = req.body.hashtags as string[]
          const mentions = req.body.mentions as string[]

          // Nếu type là comment, quoute hoặc tweet và không có mentions hoặc hashtags thì content ko đc rỗng
          if (
            [TweetType.Tweet, TweetType.QuoteTweet, TweetType.Comment].includes(type) &&
            isEmpty(hashtags) &&
            isEmpty(mentions) &&
            value === ''
          ) {
            throw new Error(tweetMessages.TWEET_CONTENT_INVALID)
          }
          // nếu type là retweet thì content phải rỗng
          if (type === TweetType.Retweet && value !== '') {
            throw new Error(tweetMessages.TWEET_CONTENT_INVALID)
          }

          return true
        }
      }
    },
    hashtags: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yêu cầu mỗi phần tử trong array là string
          if (!value.every((item: any) => typeof item === 'string')) {
            throw new Error(tweetMessages.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
          }
          return true
        }
      }
    },
    mentions: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yêu cầu mỗi phần tử trong array là user_id
          if (!value.every((item: any) => ObjectId.isValid(item))) {
            throw new Error(tweetMessages.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
          }
          return true
        }
      }
    },
    medias: {
      isArray: true,
      custom: {
        options: (value, { req }) => {
          // yêu cầu mỗi phần tử trong array là Media Object
          if (
            value.some((item: any) => {
              return typeof item.url !== 'string' || !mediaTypes.includes(item.type)
            })
          ) {
            throw new Error(tweetMessages.MEDIA_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
          }
          return true
        }
      }
    }
  })
)
export const tweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({ message: tweetMessages.TWEET_ID_INVALID, status: httpStatus.BAD_REQUEST })
            }
            const tweet = await tweetServices.findTweetById(value)
            if (!tweet) {
              throw new ErrorWithStatus({ message: tweetMessages.TWEET_NOT_FOUND, status: httpStatus.NOT_FOUND })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)
// muốn sử dụng ASYNC AWAIT trong HANDLER EXPRESS thì phải có TRY CATCH
// không thì sử dụng wrapRequestHandler đã viết á
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  const { user_id } = req.decode_authorization as TokenPayload

  if (tweet.audience === TweetAudience.TwitterCircle) {
    // kiểm tra người xem tweet này đã login hay chưa
    if (!req.decode_authorization) {
      throw new ErrorWithStatus({
        status: httpStatus.UNAUTHORIZED,
        message: userMessages.ACCESS_TOKEN_IS_REQUIRED
      })
    }
    // kiểm trả tài khoản TÁC GIẢ có ổn (bị khoá hay xoá)
    const author = await userService.findUserByObjectId(tweet.user_id)
    if (!author || author.verify === UserVerifyStatus.Banned) {
      // không tìm thấy author => bị ban hoặc xoá
      throw new ErrorWithStatus({
        status: httpStatus.NOT_FOUND,
        message: userMessages.USER_NOT_FOUND
      })
    }
    // kiểm tra người xem tweet này có nằm trong tweet circle của tác giả hay không
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    // nhiệm vụ của equals là kiểm tra 1 objectId và string id có giống nhau hay không

    // nếu bạn ko phải tác giả và ko nằm trong circle quăng lỗi
    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        status: httpStatus.FORBIDDEN,
        message: tweetMessages.TWEET_IS_NOT_PUBLIC
      })
    }
  }
  next()
})
