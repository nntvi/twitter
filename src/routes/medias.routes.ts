import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/media.controller'

const mediasRouter = Router()

mediasRouter.post('/upload-image', uploadSingleImageController)
export default mediasRouter
