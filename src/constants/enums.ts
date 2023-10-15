export enum UserVerifyStatus {
  Unverified, // chưa xác thưc
  Verified, // đã xác thưc
  Banned // bị khoá
}
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}
