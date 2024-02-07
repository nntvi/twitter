import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { signToken } from '~/utils/jwt'
import { userMessages } from '~/constants/messages'
config() // thêm zô, có xài process thì nhớ khai báo này
// controller gọi đến service
class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }
  private signTwoFactorToken(user_id: string) {
    // giờ tạo 2 cái token thì để tối ưu => nên xài promise all
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  findUserById = async (user_id: string) => {
    const result = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    return result
  }
  async checkEmailExist(email: string) {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }
  async checkRefreshTokenExist(refresh_token: string) {
    const result = await databaseService.refreshTokens.findOne({ token: refresh_token })
    return Boolean(result)
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verified_token = await this.signEmailVerifyToken(user_id.toString())

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verified_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signTwoFactorToken(user_id.toString())
    console.log('🚀 ~ email_verified_token:', email_verified_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id) })
    )
    return { accessToken, refreshToken }
  }

  async login(user_id: string) {
    const [accessToken, refreshToken] = await this.signTwoFactorToken(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id) })
    )
    return { accessToken, refreshToken }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: userMessages.LOGOUT_SUCCESSFULLY
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signTwoFactorToken(user_id),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: { email_verified_token: '', updated_at: new Date(), verify: UserVerifyStatus.Verified }
        }
      )
    ])
    const [accessToken, refreshToken] = token
    return {
      access_token: accessToken,
      refresh_token: refreshToken
    }
  }
}

const userService = new UserService()
export default userService
