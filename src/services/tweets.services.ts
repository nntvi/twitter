import { ObjectId } from 'mongodb'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import Hashtag from '~/models/schemas/Hashtags.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'

class TweetServices {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtags) => {
        //Tìm hashtag trong db, nếu có thì lấy, không thì tạo mới
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtags },
          { $setOnInsert: new Hashtag({ name: hashtags }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuments.map((doc: any) => doc._id)
  }
  async createTweet(body: TweetRequestBody, user_id: string) {
    const hashtagDocuments = await this.checkAndCreateHashtag(body.hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtagDocuments,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }
}

const tweetServices = new TweetServices()
export default tweetServices
