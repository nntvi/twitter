import { Router } from 'express'
import { bookmarkTweetController } from '~/controllers/bookmark.controller'
import { createBookmarkValidator } from '~/middlewares/bookmarks.middlewares'
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

export default bookmarksRouter
