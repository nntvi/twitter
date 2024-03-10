import { Router } from 'express'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import {
  loginController,
  registerController,
  logoutController,
  emailVerifyValidatorController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  followController,
  unfollowController
} from '~/controllers/user.controller'
import { filterMiddlewares } from '~/middlewares/common.middlewares'
import { UpdateMeRequestBody } from '~/models/requests/User.requests'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
/**
 * Description: Register a user
 * Path: /register
 * Method: POST
 * Body: { email: string, name: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
/**
 * Description: Logout user
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
/**
 * Description: Verify email when user click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyValidatorController))
/**
 * Description: Resend verify email when user click on the link in email
 * Path: /resend-verify-email
 * Headers: { Authorization: Bearer <access_token> }
 * Method: POST
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
/**
 * Description: Submit email to reset password, send email to user
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
/**
 * Description: Verify link in email to reset password
 * Path: /verify-forgot-password
 * Method: POST
 * Body: { forgot_password_token: string }
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)
/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: { new_password: string, confirm_new_password: string, forgot_password_token: string }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
/**
 * Description: get profile
 * Path: /me
 * Method: GET
 * Headers: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
/**
 * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Headers: { Authorization: Bearer <access_token> }
 * Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddlewares<UpdateMeRequestBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)
/**
 * Description: get user profile
 * Path: /:username
 * Method: GET
 */
usersRouter.get('/:username', wrapRequestHandler(getProfileController))

/**
 * Description: follow someone
 * Path: /:follow
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * Body: {followed_user_id: string}
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/**
 * Description: unfollow someone
 * Path: /follow/user_id
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 * Body: {followed_user_id: string}
 */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandler(unfollowController)
)
export default usersRouter
