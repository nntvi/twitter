import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { tweetMessages } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/commons'
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
