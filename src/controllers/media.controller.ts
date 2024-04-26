import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import httpStatus from '~/constants/httpStatus'
import { mediaMessages } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime-types'
export const uploadImageController = async (req: Request, res: Response) => {
  const url = await mediasService.handleUploadImage(req)
  return res.json({
    message: mediaMessages.UPLOAD_SUCCESSFULLY,
    result: url
  })
}
export const uploadVideoController = async (req: Request, res: Response) => {
  const url = await mediasService.handleUploadVideo(req)
  return res.json({
    message: mediaMessages.UPLOAD_SUCCESSFULLY,
    result: url
  })
}
// cho phép custom sâu hơn
export const serverImageController = (req: Request, res: Response) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
export const serverVideoStreamController = (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(httpStatus.BAD_REQUEST).send('Requires Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10^6 bytes (Tính theo hệ 10, đây là thứ hay thấy trên UI)
  // 1MB = 2^20 bytes (1024 * 1024) Hệ nhị phân

  // Dung lượng video
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 * 6 // 1MB
  // Lấy giá trị bytes bắt đầu từ header Range
  const start = Number(range.replace(/\D/g, ''))
  // Lấy giá trị bytes kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize)
  // Dung lượng thực tế cho mỗi đoạn video stream
  // thường đây sẽ là chunkSize, ngoại trừ đoạn cuối cùng
  const contentLength = end - start
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(httpStatus.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
