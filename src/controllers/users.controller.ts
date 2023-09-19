import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'a@gmail.com' && password === '123123') {
    return res.status(200).json({
      message: 'Login success'
    })
  }
  return res.status(400).json({
    message: 'Login failed'
  })
}

// Context from Code Snippet nodemon.json:{
