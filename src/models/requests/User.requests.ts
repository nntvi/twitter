import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '~/constants/enums'
import User from '../schemas/User.schema'

export interface LoginReqBody {
  email: string
  password: string
}
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface LogoutBody {
  refresh_token: string
}
export interface EmailVerifyTokenBody {
  email_verify_token: string
}

export interface ForgotPasswordTokenBody {
  email: string
}
export interface VerifyForgotPasswordTokenBody {
  forgot_password_token: string
}
export interface ResetPasswordBody {
  password: string
  confirm_password: string
  forgot_password_token: string
}
