import { Router } from 'express'
import { serverImageController, serverVideoController } from '~/controllers/media.controller'

const staticRouter = Router()

staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video/:name', serverVideoController)
export default staticRouter
