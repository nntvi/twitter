import { ObjectId } from 'mongodb'

interface FollowersType {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}
export default class Followers {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at: Date
  constructor({ _id, followed_user_id, created_at, user_id }: FollowersType) {
    this._id = _id
    this.followed_user_id = followed_user_id
    this.created_at = created_at || new Date()
    this.user_id = user_id
  }
}
