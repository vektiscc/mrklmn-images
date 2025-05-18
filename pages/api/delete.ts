import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { public_id } = req.body;
  try {
    await cloudinary.v2.uploader.destroy(public_id);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка удаления' });
  }
}
