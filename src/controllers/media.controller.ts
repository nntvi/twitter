import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { handleUPloadSingleFile } from '~/utils/file'
export const uploadSingleImageController = async (req: Request) => {
  const data = await handleUPloadSingleFile(req)
  console.log('🚀 ~ uploadSingleImageController ~ data:', data)
}
