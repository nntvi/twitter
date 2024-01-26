import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import httpStatus from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // nơi mọi lỗi lầm sẽ đổ về đây :))
  if (err instanceof ErrorWithStatus) {
    // nếu nó là entity error
    return res.status(err.status).json(omit(err, 'status'))
  }
  // trong err có 1 cái rất lạ là enumerable. Cái này nếu true thì còn xem đc bên trong. False thì nín
  // vậy h làm sao khi ta ko thể loop lỗi của nó
  // ví dụ const err1 = new Error('123') -> log cái này ra undefined nè
  // fix = cách getOwnPropertyNames(err1) -> ['stack', 'message']
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}
