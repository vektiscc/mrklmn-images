import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm, File } from 'formidable'
import { v2 as cloudinary } from 'cloudinary'

// Настройка Cloudinary
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

interface ProcessedFiles {
  file: File[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = await new Promise<{ fields: any; files: ProcessedFiles }>(
      (resolve, reject) => {
        const form = new IncomingForm()
        
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err)
          resolve({ fields, files: files as ProcessedFiles })
        })
      }
    )

    const file = data.files.file[0]
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'uploads'
    })

    return res.status(200).json({ 
      url: result.secure_url,
      public_id: result.public_id
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}
