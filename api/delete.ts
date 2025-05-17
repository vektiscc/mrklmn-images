import type { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Временное хранилище токенов (будет очищаться при перезапуске пока нет хостинга)
const deleteTokens: Record<string, string> = {}

// Функция для запоминания токена (временно, потом убрать не забыть)
export function storeDeleteToken(publicId: string, token: string) {
  deleteTokens[publicId] = token
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { public_id, token } = req.query

  if (!public_id || !token || typeof public_id !== 'string' || typeof token !== 'string') {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  if (deleteTokens[public_id] !== token) {
    return res.status(403).json({ error: 'Invalid delete token' })
  }

  try {
    await cloudinary.uploader.destroy(public_id)
    delete deleteTokens[public_id]
    return res.status(200).json({ success: true, message: 'Image deleted successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to delete image' })
  }
}
