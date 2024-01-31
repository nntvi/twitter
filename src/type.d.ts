import { Request } from 'express'
import User from '~/models/schemas/User.schema'
import { TokenPayload } from './models/requests/User.requests'
declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
  }
  // interface RequestWithDecodeAuthorization extends Request {
  //   decode_authorization?: TokenPayload
  // }
  // interface RequestWithDecodeRefreshToken extends Request {
  //   decode_refresh_token?: TokenPayload
  // }
}