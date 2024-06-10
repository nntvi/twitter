import { ObjectId } from 'mongodb'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'

class TweetServices {
  async createTweet(body: TweetRequestBody, user_id: string) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: [],
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
