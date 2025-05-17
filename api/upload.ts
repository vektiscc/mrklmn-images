import { IncomingForm } from 'formidable';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing form data' });

    const file = files.file;
    if (!file || Array.isArray(file)) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const uploadResult = await cloudinary.v2.uploader.upload(file.filepath);
      return res.status(200).json({ url: uploadResult.secure_url });
    } catch (error) {
      return res.status(500).json({ error: 'Cloudinary upload failed' });
    }
  });
}