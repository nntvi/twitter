import { NextFunction, Request, Response } from 'express'
import path from 'path'
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
