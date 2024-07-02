import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { bookmarkMessages, likeMessages } from '~/constants/messages'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import { LikeTweetReqBody } from '~/models/requests/Like.request'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarkServices from '~/services/bookmarks.services'
import likeServices from '~/services/likes.services'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likeServices.createLike({ user_id, tweet_id })
  return res.json({
    message: likeMessages.CREATE_LIKE_SUCCESSFULLY,
    result
  })
}
export const unLikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await likeServices.unLike({ user_id, tweet_id: req.params.tweet_id })
  return res.json({
    message: likeMessages.UNLIKE_SUCCESSFULLY,
    result
  })
}
