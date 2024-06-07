import { Router } from 'express'
import { createTweetController } from '~/controllers/tweet.controller'
import { createTweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const tweetsRouter = Router()

/**
 * Description: Create a tweet
 * Path: /
 * Method: POST
 * Body: { email: string, password: string}
 */
tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)
export default tweetsRouter
