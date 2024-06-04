import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateMeRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { signToken, verifyToken } from '~/utils/jwt'
import { userMessages } from '~/constants/messages'
import Followers from '~/models/schemas/Followers.schema'
import axios from 'axios'
import { ErrorWithStatus } from '~/models/Error'
import httpStatus from '~/constants/httpStatus'
config() // thêm zô, có xài process thì nhớ khai báo này
// controller gọi đến service
class UserService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, verify, exp },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }
  private signTwoFactorToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    // giờ tạo 2 cái token thì để tối ưu => nên xài promise all
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as { id_token: string; access_token: string }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      picture: string
      name: string
      given_name: string
      family_name: string
      locale: string
    }
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }
  findUserById = async (user_id: string) => {
    const result = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verified_token: 0
        }
      }
    )
    return result
  }

  findUserByEmail = async (email: string) => {
    const result = await databaseService.users.findOne({ email: email })
    return result
  }

  findUserByUsername = async (username: string) => {
    const result = await databaseService.users.findOne({ username: username })
    return result
  }

  getProfile = async (username: string) => {
    const result = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verified_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
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
    const email_verified_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user_${user_id.toString()}`,
        email_verified_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signTwoFactorToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id), iat, exp })
    )
    return { accessToken, refreshToken }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signTwoFactorToken({
      user_id: user_id,
      verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id), iat, exp })
    )
    return { accessToken, refreshToken }
  }

  async oauthLogin(code: string) {
    const data = await this.getOauthGoogleToken(code)
    const { id_token, access_token } = data
    const { verified_email, email, name } = await this.getGoogleUserInfo(access_token, id_token)
    if (!verified_email) {
      throw new ErrorWithStatus({
        status: httpStatus.BAD_REQUEST,
        message: userMessages.EMAIL_NOT_VERIFIED
      })
    }
    // Kiểm tra email đã đăng ký hay chưa
    const user = await this.findUserByEmail(email)
    if (user) {
      // nếu email đã tồn tại => nghĩa là có => bắt đầu tạo token để lưu đăng nhập
      const [accessToken, refreshToken] = await this.signTwoFactorToken({
        user_id: user._id.toString(),
        verify: user.verify
      })
      const { iat, exp } = await this.decodeRefreshToken(refreshToken)
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ token: refreshToken, user_id: new ObjectId(user._id), iat, exp })
      )
      return { accessToken, refreshToken, new_user: 0, verify: user.verify }
    } else {
      // random string password
      const password = Math.random().toString(36).substring(2, 15)
      // chưa có trong db thì đăng ký
      const data = await this.register({
        email,
        name,
        date_of_birth: new Date().toISOString(),
        password,
        confirm_password: password
      })
      return { ...data, new_user: 1, verify: UserVerifyStatus.Unverified }
    }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: userMessages.LOGOUT_SUCCESSFULLY
    }
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const decode_refresh_token = await this.decodeRefreshToken(new_refresh_token)
    databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: new_refresh_token,
        user_id: new ObjectId(user_id),
        iat: decode_refresh_token.iat,
        exp: decode_refresh_token.exp
      })
    )
    return { new_access_token, new_refresh_token }
  }

  async verifyEmail(user_id: string) {
    // Tạo giá trị cập nhật => new Date()
    // Cập nhật giá trị => làm kiểu $currentDate -> mongoDB đưa ngày vào,
    // còn ở trên là mình đưa ngày vào cho mongoDB lưu
    const [token] = await Promise.all([
      this.signTwoFactorToken({
        user_id,
        verify: UserVerifyStatus.Verified
      }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verified_token: '',
            updated_at: '$$NOW',
            verify: UserVerifyStatus.Verified
          }
        }
      ])
    ])
    const [accessToken, refreshToken] = token
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id), iat, exp })
    )
    return {
      access_token: accessToken,
      refresh_token: refreshToken
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verified_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    // Giả bộ có chức năng gửi email
    console.log('🚀 ~ Resend email_verified:', email_verified_token)

    // cập nahạt lại giá trị email verify token trong db
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verified_token,
          updated_at: '$$NOW'
        }
      }
    ])

    return {
      message: userMessages.RESEND_EMAIL_VERIFIED_SUCCESSFULLY
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    // sau khi cập nhật xong ta tiến hành gửi mail, kèm link
    // có dạng sau: https://twitter.com/forgot-password?token=[forgot_password_token]
    console.log('🚀 ~ UserService ~ forgotPassword ~ forgot_password_token:', forgot_password_token)

    return {
      message: userMessages.CHECK_EMAIL_TO_RESET_PASSWORD_SUCCESSFULLY
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: userMessages.RESET_PASSWORD_SUCCESSFULLY
    }
  }

  async updateMe(user_id: string, payload: UpdateMeRequestBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after', // nếu không có dòng này, sau khi update xong trả về cái cũ
        // có 1 số trường không muốn trả về, ta khai báo trong projection
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verified_token: 0
        }
      }
    )
    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    // nếu đã follow rồi thì thôi, ko insert nữa
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower === null) {
      await databaseService.followers.insertOne(
        new Followers({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        message: userMessages.FOLLOW_SUCCESSFULLY
      }
    }
    return {
      message: userMessages.ALREADY_FOLLOW
    }
  }
  async unfollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower !== null) {
      await databaseService.followers.deleteOne({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
      return {
        message: userMessages.UNFOLLOW_SUCCESSFULLY
      }
    }
    return {
      message: userMessages.ALREADY_UNFOLLOW
    }
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: userMessages.CHANGE_PASSWORD_SUCCESSFULLY
    }
  }
}

const userService = new UserService()
export default userService
