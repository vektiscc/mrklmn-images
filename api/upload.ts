import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'
import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Ошибка при разборе формы' })
    }

    const file = files.file?.[0]

    if (!file) {
      return res.status(400).json({ error: 'Файл не найден' })
    }

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'uploads',
        use_filename: true,
        unique_filename: false,
      })

      const deleteToken = crypto.randomBytes(16).toString('hex')

      // заметкка на будущее - можно хранить связку public_id + deleteToken в JSON или бд потом

      res.status(200).json({
        url: result.secure_url,
        delete_url: `https://${req.headers.host}/api/delete?public_id=${encodeURIComponent(result.public_id)}&token=${deleteToken}`,
        public_id: result.public_id,
        delete_token: deleteToken
      })
    } catch (uploadErr) {
      console.error(uploadErr)
      res.status(500).json({ error: 'Ошибка при загрузке файла в Cloudinary' })
    }
  })
}
