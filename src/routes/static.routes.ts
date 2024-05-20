import { Router } from 'express'
import {
  serverImageController,
  serverVideoStreamController,
  serveM3u8Controller,
  serveSegmentController
} from '~/controllers/media.controller'

const staticRouter = Router()

staticRouter.get('/image/:name', serverImageController)
staticRouter.get('/video-stream/:name', serverVideoStreamController)
staticRouter.get('/video-hls/:id', serveM3u8Controller)
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)
export default staticRouter
