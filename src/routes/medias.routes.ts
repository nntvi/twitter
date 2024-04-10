import { Router } from 'express'
import { uploadImageController } from '~/controllers/media.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadImageController))
export default mediasRouter
