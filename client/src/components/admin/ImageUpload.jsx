import { useState, useRef } from 'react'

export default function ImageUpload({ current, onUpload, onDelete, label, value, onChange }) {
  const [preview, setPreview] = useState(null)
  const [scale, setScale] = useState(100)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const canvasRef = useRef(null)

  const image = value !== undefined ? value : current
  const handleUpload = onChange || onUpload
  const handleDelete = onDelete || (() => {})

  const isPdf = image?.endsWith('.pdf')

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type === 'application/pdf') {
      uploadPdf(file)
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const uploadPdf = async (file) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file, file.name)
      const { default: axios } = await import('axios')
      const { data } = await axios.post('/api/upload/single', fd)
      if (handleUpload) handleUpload(data.url)
    } catch {}
    setUploading(false)
  }

  const handleConfirm = async () => {
    if (!preview) return
    setUploading(true)
    try {
      const img = new Image()
      img.src = preview
      await new Promise(resolve => { img.onload = resolve })
      const maxW = Math.round(img.width * scale / 100)
      const maxH = Math.round(img.height * scale / 100)
      const canvas = document.createElement('canvas')
      canvas.width = maxW
      canvas.height = maxH
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, maxW, maxH)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
      if (!blob) return
      const fd = new FormData()
      fd.append('image', blob, 'upload.jpg')
      const { default: axios } = await import('axios')
      const { data } = await axios.post('/api/upload/single', fd)
      if (handleUpload) handleUpload(data.url)
      setPreview(null)
      setScale(100)
    } catch {}
    setUploading(false)
  }

  const handleCancel = () => {
    setPreview(null)
    setScale(100)
  }

  return (
    <div>
      {preview ? (
        <div style={{ background: '#FAFAF7', borderRadius: 8, padding: 12, marginTop: 4 }}>
          <img src={preview} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4, marginBottom: 8 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: '#6B6B6B', fontSize: 11 }}>سایز: {scale}%</span>
            <input type="range" min={10} max={100} value={scale} onChange={e => setScale(Number(e.target.value))}
              style={{ flex: 1, height: 4 }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleConfirm} disabled={uploading} style={{
              padding: '5px 14px', background: uploading ? '#999' : 'linear-gradient(135deg, #4CAF50, #388E3C)',
              color: '#fff', border: 'none', borderRadius: 5, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 11,
            }}>{uploading ? 'در حال آپلود...' : 'تأیید و آپلود'}</button>
            <button onClick={handleCancel} style={{
              padding: '5px 14px', background: '#E8E4DC', color: '#6B6B6B', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11,
            }}>لغو</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
          <input type="file" accept="image/*,.pdf" ref={fileRef} style={{ display: 'none' }} onChange={handleFileSelect} />
          <button onClick={() => fileRef.current?.click()} style={{
            padding: '5px 12px', background: '#F0F0EA', color: '#4CAF50', border: '1px solid #D4D0C8',
            borderRadius: 5, cursor: 'pointer', fontSize: 11,
          }}>📁 {label || 'آپلود'}</button>
          {image && (
            <button onClick={handleDelete} style={{
              padding: '4px 8px', background: 'rgba(239,83,80,0.2)', color: '#EF5350',
              border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11,
            }}>✕ حذف</button>
          )}
        </div>
      )}
      {image && !preview && (
        isPdf ? (
          <a href={image} target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', fontSize: 11, display: 'block', marginTop: 6, textDecoration: 'underline' }}>📄 {image.split('/').pop()}</a>
        ) : (
          <img src={image} alt="" onError={e => { e.target.style.display = 'none' }}
            style={{ marginTop: 6, maxWidth: 200, maxHeight: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid #D4D0C8' }} />
        )
      )}
    </div>
  )
}
