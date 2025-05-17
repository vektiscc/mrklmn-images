// pages/index.tsx

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Загрузка файла в API
  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setUploadResult(null)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setUploading(false)
    setUploadResult(data)

    if (data.url) {
      setPreview(data.url)
    }
  }

  // Обработка вставки из буфера обмена
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const item = e.clipboardData?.items[0]
      if (item && item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          uploadFile(file)
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1>📸 Загрузка скриншотов</h1>

      <p>Вы можете:</p>
      <ul>
        <li>Загрузить изображение вручную</li>
        <li>Вставить из буфера обмена (нажмите <b>Ctrl+V</b>)</li>
        <li>Использовать <b>ShareX</b> (см. ниже)</li>
      </ul>

      <div style={{ margin: '1rem 0' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
          }}
        />
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          📁 Загрузить изображение
        </button>
      </div>

      {uploading && <p>Загрузка...</p>}
      {uploadResult?.error && <p style={{ color: 'red' }}>Ошибка: {uploadResult.error}</p>}
      {uploadResult?.url && (
        <div style={{ marginTop: '1rem' }}>
          <p>✅ Загрузилось:</p>
          <a href={uploadResult.url} target="_blank" rel="noopener noreferrer">{uploadResult.url}</a>
          <p><b>Удалить:</b> <a href={uploadResult.delete_url}>{uploadResult.delete_url}</a></p>
          <img src={uploadResult.url} alt="preview" style={{ maxWidth: '100%', marginTop: '1rem' }} />
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h2>🛠️ Настройка ShareX</h2>
      <p>Скопируйте и вставьте это в ShareX → Destinations → Custom uploader:</p>

      <pre style={{
        background: '#f0f0f0',
        padding: '1rem',
        overflowX: 'auto',
        fontSize: '0.9rem'
      }}>
{`{
  "Name": "mrklmn",
  "RequestType": "POST",
  "RequestURL": "https://${typeof window !== 'undefined' ? window.location.host : '[your-domain]'}/api/upload",
  "FileFormName": "file",
  "ResponseType": "JSON",
  "URL": "$json:url"
}`}
      </pre>
    </div>
  )
}
