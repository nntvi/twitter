export const userMessageError = {
  VALIDATION_ERROR: 'Validation error',
  USER_NOT_FOUND: 'User not found',

  NAME_REQUIRED: 'Name is required',
  NAME_IS_STRING: 'Name must be a string',
  NAME_LENGTH: 'Name must be at least 3 characters',

  EMAIL_ALREADY_EXIST: 'Email already exists',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Email is not valid',

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

  DATE_OF_BIRTH_IS_ISO8601: 'Date of birth must be in ISO 8601 format'
} as const
