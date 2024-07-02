import { ObjectId } from 'mongodb'
import Like from '~/models/schemas/Likes.schema'
import databaseService from '~/services/database.services'

class LikeServices {
  async createLike({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({
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
  async unLike({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }

  async deleteLike({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseService.likes.deleteOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }
}

const likeServices = new LikeServices()
export default likeServices
