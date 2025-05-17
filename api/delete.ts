import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { cloudinary } from '../../lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { public_id, token } = req.query;

  if (!public_id || !token || typeof public_id !== 'string' || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  const secret = process.env.DELETE_TOKEN_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'Missing server secret' });
  }

  const expectedToken = crypto.createHmac('sha256', secret).update(public_id).digest('hex');
  if (token !== expectedToken) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id, { invalidate: true });
    if (result.result === 'ok') {
      return res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Cloudinary deletion failed', result });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error });
  }
}
