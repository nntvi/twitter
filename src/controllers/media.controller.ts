import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import { mediaMessages } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import { handleUploadSingleFile } from '~/utils/file'
export const uploadSingleImageController = async (req: Request, res: Response) => {
  const url = await mediasService.handleUploadSingleImage(req)
  return res.json({
    message: mediaMessages.UPLOAD_SUCCESSFULLY,
    result: url
  })
}
// cho phép custom sâu hơn
export const serverImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
