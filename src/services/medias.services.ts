import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadSingleFile } from '~/utils/file'
import fs from 'fs'
class MediaService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleFile(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    console.log('🚀 ~ MediaService ~ handleUploadSingleImage ~ newPath:', newPath)
    await sharp(file.filepath).jpeg({ quality: 70 }).toFile(newPath)
    fs.unlinkSync(file.filepath)
    return `${newName}.jpg`
  }
}
const mediasService = new MediaService()
export default mediasService
