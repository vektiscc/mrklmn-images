import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from 'cloudinary';
import formidable from 'formidable';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable();

  form.parse(req, async (err, _, files) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка загрузки файла' });
    }

    const file = files.file as formidable.File;
    try {
      const result = await cloudinary.v2.uploader.upload(file.filepath);
      return res.status(200).json({ url: result.secure_url });
    } catch (error) {
      return res.status(500).json({ error: 'Ошибка Cloudinary' });
    }
  });
}
