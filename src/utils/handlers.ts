import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapRequestHandler = <P>(fn: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (e) {
      next(e)
    }
  }
}

// Mong muốn nhận vào là Request<{username: string}>
// Thực nhận: req: Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>
// Mà ParamsDictionary là { [key: string]: string } => thì có nghĩa là key này có thể có HOẶC KHÔNG
// Mà username là key bắt buộc phải có cho nên đó là lý do vì sao báo lỗi
