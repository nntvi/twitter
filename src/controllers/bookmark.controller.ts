import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { bookmarkMessages } from '~/constants/messages'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarkServices from '~/services/bookmarks.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await bookmarkServices.createBookmark({ user_id, tweet_id })
  return res.json({
    message: bookmarkMessages.CREATE_BOOKMARK_SUCCESSFULLY,
    result
  })
}
