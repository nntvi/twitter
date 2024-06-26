import { Router } from 'express'
import { bookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmark.controller'
import { createBookmarkValidator } from '~/middlewares/bookmarks.middlewares'
import { tweetValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()
/**
 * Description: bookmark a tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string}
 * Headers: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createBookmarkValidator,
  wrapRequestHandler(bookmarkTweetController)
)
/**
 * Description: Unbookmark a tweet
 * Path: /:tweet_id
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetValidator,
  wrapRequestHandler(unBookmarkTweetController)
)

export default bookmarksRouter
