import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmark.controller'
import { likeTweetController, unLikeTweetController } from '~/controllers/like.controller'
import { createBookmarkValidator } from '~/middlewares/bookmarks.middlewares'
import { createLikeValidator } from '~/middlewares/likes.middlewares'
import { tweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()
/**
 * Description: like a tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string}
 * Headers: { Authorization: Bearer <access_token> }
 */
likesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createLikeValidator,
  wrapRequestHandler(likeTweetController)
)
/**
 * Description: unlike a tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 */
likesRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapRequestHandler(unLikeTweetController)
)

export default likesRouter
