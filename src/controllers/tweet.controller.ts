import { config } from 'dotenv'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import httpStatus from '~/constants/httpStatus'
import { tweetMessages } from '~/constants/messages'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetServices from '~/services/tweets.services'

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await tweetServices.createTweet(req.body, user_id)
  return res.json({
    message: tweetMessages.CREATE_TWEET_SUCCESS,
    result
  })
}

export const getTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const tweet_id = req.params.tweet_id
  const result = await tweetServices.findTweetById(tweet_id)
  return res.json({
    message: tweetMessages.GET_TWEET_SUCCESS,
    result
  })
}
// export const unlikeTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
//   const tweet_id = req.params.tweet_id
//     const { user_id } = req.decode_authorization as TokenPayload

//   const result = await tweetServices.unlikeTweet(user_id, tweet_id)
// }
