import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameFromFullName, handleUploadFile } from '~/utils/file'
import fs from 'fs'
import { config } from 'dotenv'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
config()
class MediaService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadFile(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
        console.log('🚀 ~ MediaService ~ handleUploadSingleImage ~ newPath:', newPath)
        await sharp(file.filepath).jpeg({ quality: 70 }).toFile(newPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/static/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}
const mediasService = new MediaService()
export default mediasService
