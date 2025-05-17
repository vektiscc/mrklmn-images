const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports.default = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uploadsDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir: uploadsDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Upload failed" });
    }

    const file = files.file;
    const fileName = path.basename(file.filepath);
    const fileUrl = `/uploads/${fileName}`;
    res.status(200).json({ url: fileUrl });
  });
};
