import { NextFunction, Request, Response } from 'express'
import path from 'path'
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    keepExtensions: true, // để thấy được đuôi file
    maxFileSize: 300 * 1024 // 300KB
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({
      message: 'Upload single media successfully'
    })
  })
}
