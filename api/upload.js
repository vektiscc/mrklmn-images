import { writeFile } from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from 'formidable';

export default async function handler(req, res) {
  const form = formidable({ multiples: false, uploadDir: "./uploads", keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
      return;
    }

    const file = files.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filename = path.basename(file[0].filepath);
    res.status(200).json({ url: `https://${req.headers.host}/uploads/${filename}` });
  });
}