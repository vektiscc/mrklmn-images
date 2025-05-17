import { v2 as cloudinary } from 'cloudinary'
import formidable, { Fields, Files, File } from 'formidable'
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function generateToken(publicId: string): string {
  return crypto.createHmac('sha256', process.env.DELETE_SECRET || 'default_secret')
    .update(publicId)
    .digest('hex')
}

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

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ error: 'Ошибка при разборе формы' })
    }

    let file: File | undefined
    if (Array.isArray(files.file)) {
      file = files.file[0]
    } else {
      file = files.file
    }

    if (!file) {
      return res.status(400).json({ error: 'Файл не найден' })
    }

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'uploads',
        use_filename: true,
        unique_filename: false,
      })

      const deleteToken = generateToken(result.public_id)

      res.status(200).json({
        url: result.secure_url,
        delete_url: `https://${req.headers.host}/api/delete?public_id=${encodeURIComponent(result.public_id)}&token=${deleteToken}`,
        public_id: result.public_id,
        delete_token: deleteToken,
      })
    } catch (uploadErr) {
      console.error(uploadErr)
      res.status(500).json({ error: 'Ошибка при загрузке файла в Cloudinary' })
    }
  })
}
