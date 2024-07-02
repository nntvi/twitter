import { ObjectId } from 'mongodb'
import Bookmark from '~/models/schemas/Bookmarks.schema'
import databaseService from '~/services/database.services'

class BookmarkServices {
  async createBookmark({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id)
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }
  async unBookmark({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }

  async deleteBookmark({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseService.bookmarks.deleteOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }
}

const bookmarkServices = new BookmarkServices()
export default bookmarkServices
