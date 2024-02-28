import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateMeRequestBody } from '~/models/requests/User.requests'
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
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
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
        email_verified_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signTwoFactorToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    console.log('🚀 ~ email_verified_token:', email_verified_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id) })
    )
    return { accessToken, refreshToken }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signTwoFactorToken({
      user_id: user_id,
      verify
    })
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
        returnDocument: 'after',
        projection: {
          password: 0,
          forgot_password_token: 0,
          email_verified_token: 0
        }
      }
    )
    return user
  }
}

const userService = new UserService()
export default userService
