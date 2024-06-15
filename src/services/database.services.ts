import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Followers from '~/models/schemas/Followers.schema'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtags.schema'
import Bookmark from '~/models/schemas/Bookmarks.schema'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@startwithmongodb.p65hxjm.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Congratulations! Vi Aibi successfully connected to MongoDB!')
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  async indexUsers() {
    const exist = await this.users.indexExists(['email_1', 'username_1', 'email_1_password_1'])
    if (!exist) {
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
      this.users.createIndex({ email: 1, password: 1 })
    }
  }

  async indexRefreshToken() {
    const exist = await this.refreshTokens.indexExists(['token_1', 'exp_1'])
    if (!exist) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  async indexVideoStatus() {
    const exist = await this.videoStatus.indexExists(['name_1'])
    if (!exist) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }

  async indexFollowers() {
    const exist = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!exist) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  async indexBookmarks() {
    const exist = await this.bookmarks.indexExists(['user_id_1_tweet_id_1'])
    if (!exist) {
      this.bookmarks.createIndex({ user_id: 1 })
      this.bookmarks.createIndex({ tweet_id: 1 })
      this.bookmarks.createIndex({ user_id: 1, tweet_id: 1 })
    }
  }
  // tạo getter lấy collection users từ db
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string)
  }

  get followers(): Collection<Followers> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }
}
// Tạo 1 object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService
