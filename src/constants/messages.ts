export const userMessages = {
  VALIDATION_ERROR: 'Validation error',
  USER_NOT_FOUND: 'User not found',
  INVALID_USER_ID: 'Invalid user ID',
  USERNAME_INVALID:
    'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only number',
  USERNAME_EXISTED: 'Username already exists',
  // --------------------- NAME ---------------------
  NAME_REQUIRED: 'Name is required',
  NAME_IS_STRING: 'Name must be a string',
  NAME_LENGTH: 'Name must be at least 3 characters',

  // --------------------- EMAIL ---------------------
  EMAIL_ALREADY_EXIST: 'Email already exists',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Email is not valid',
  EMAIL_OR_PASSWORD_INCORRECT: 'Email or password is incorrect',
  EMAIL_NOT_VERIFIED: 'Email is not verified',

  // --------------------- PASSWORD ---------------------
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_LENGTH: 'Password must be at least 6 characters',
  PASSWORD_MUST_BE_STRONG:
    'Password must be from 6 to 50 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
  PASSWORD_STRING: 'Password must be a string',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_LENGTH: 'Confirm password must be at least 6 characters',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be from 6 to 50 characters, at least one uppercase letter, one lowercase letter, one number and one special character',
  CONFIRM_PASSWORD_MUST_MATCH: 'Confirm password must match with password',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  OLD_PASSWORD_INCORRECT: 'Old password is incorrect',
  // --------------------- DATE OF BIRTH ---------------------
  DATE_OF_BIRTH_IS_ISO8601: 'Date of birth must be in ISO 8601 format',

  LOGIN_SUCCESS: 'Login success',
  REGISTER_SUCCESS: 'Register success',

  // --------------------- TOKEN ---------------------
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_INVALID: 'Access token is invalid',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_NOT_FOUND_OR_USED: 'Refresh token not found or used',
  LOGOUT_SUCCESSFULLY: 'Logout successfully',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  // --------------------- EMAIL VERIFICATION ---------------------
  EMAIL_VERIFY_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_INVALID: 'Email verify token is invalid',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  EMAIL_VERIFIED_SUCCESSFULLY: 'Email verified successfully',
  RESEND_EMAIL_VERIFIED_SUCCESSFULLY: 'Resend email verified successfully',
  CHECK_EMAIL_TO_RESET_PASSWORD_SUCCESSFULLY: 'Check email to reset password successfully',

  // --------------------- FORGOT PASSWORD ---------------------
  FORGOT_PASSWORD_TOKEN_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_SUCCESSFULLY: 'Verify forgot password successfully',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token is invalid',
  RESET_PASSWORD_SUCCESSFULLY: 'Reset password successfully',

  // --------------------- ME ---------------------
  GET_ME_SUCCESSFULLY: 'Get me successfully',
  USER_NOT_VERIFIED: 'User not verified',
  UPDATE_ME_SUCCESSFULLY: 'Update me successfully',
  BIO_IS_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio must be  from 3 to 200 characters',
  LOCATION_IS_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location must be  from 3 to 200 characters',
  WEBSITE_IS_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website must be  from 3 to 50 characters',
  USERNAME_IS_STRING: 'Username must be a string',
  USERNAME_LENGTH: 'Username must be  from 3 to 50 characters',
  IMAGE_IS_STRING: 'Image must be a string',
  IMAGE_LENGTH: 'Image must be  from 3 to 200 characters',

  GET_PROFILE_SUCCESSFULLY: 'Get profile successfully',

  // --------------------- FOLLOW ---------------------
  FOLLOW_SUCCESSFULLY: 'Follow successfully',
  FOLLOWED_USER_ID_IS_STRING: 'Followed user id must be a string',
  INVALID_FOLLOWED_USER_ID: 'Invalid followed user id',
  ALREADY_FOLLOW: 'Already follow',
  UNFOLLOW_SUCCESSFULLY: 'Unfollow successfully',
  ALREADY_UNFOLLOW: 'Already unfollow'
} as const

export const mediaMessages = {
  UPLOAD_SUCCESSFULLY: 'Upload file successfully',
  GET_VIDEO_STATUS_SUCCESSFULLY: 'Get video status successfully'
}
