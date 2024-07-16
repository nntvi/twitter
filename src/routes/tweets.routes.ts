import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweet.controller'
import { createTweetValidator, tweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Description: Create a tweet
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)
/**
 * Description: Get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
tweetsRouter.get('/:tweet_id', tweetValidator, wrapRequestHandler(getTweetController))
/**
 * Description: Delete a tweet
 * Path: /tweet/:tweet_id
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 */
// tweetsRouter.post(
//   '/tweets/:tweet_id',
//   accessTokenValidator,
//   verifiedUserValidator,
//   tweetValidator,
//   wrapRequestHandler(createTweetController)
// )
export default tweetsRouter
