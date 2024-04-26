import { Router } from 'express'
import { serverImageController, serverVideoStreamController } from '~/controllers/media.controller'

const staticRouter = Router()

staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video-stream/:name', serverVideoStreamController)
export default staticRouter
