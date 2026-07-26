import { useRef, useEffect } from 'react'

function qrEncode(text) {
  const baseStr = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'
  let mode = 2
  let data = []
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    if (c >= 128) { mode = 4; break }
    if (baseStr.indexOf(text[i]) < 0) mode = 4
  }
  if (mode === 2) {
    for (let i = 0; i < text.length; i += 2) {
      const v = text.length - i >= 2
        ? baseStr.indexOf(text[i]) * 45 + baseStr.indexOf(text[i + 1])
        : baseStr.indexOf(text[i])
      data.push(v)
    }
  } else {
    for (let i = 0; i < text.length; i++) data.push(text.charCodeAt(i))
  }
  const lenBits = text.length <= 9 ? 8 : 16
  const totalBits = 4 + lenBits + data.reduce((s, v) => s + (v > 255 ? 11 : v > 127 ? 16 : 8), 0)
  const size = totalBits <= 152 ? 21 : totalBits <= 272 ? 25 : 29
  const grid = Array.from({ length: size }, () => Array(size).fill(0))
  ;[
    [0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,0,0,0],
    [0,1,0,0,0,1,0,0,0],
    [0,1,0,1,0,1,0,0,0],
    [0,1,0,0,0,1,0,0,0],
    [0,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0],
  ].forEach((row, r) => row.forEach((v, c) => { if (r < size && c < size) grid[r][c] = v }))
  ;[
    [size-9,0,0,0,0,0,0,0,0],
    [size-8,1,1,1,1,1,0,0,0],
    [size-7,1,0,0,0,1,0,0,0],
    [size-6,1,0,1,0,1,0,0,0],
    [size-5,1,0,0,0,1,0,0,0],
    [size-4,1,1,1,1,1,0,0,0],
    [size-3,0,0,0,0,0,0,0,0],
  ].forEach(([sr, ...row], r) => row.forEach((v, c) => { const rr = sr + r; const cc = c; if (rr < size && cc < size) grid[rr][cc] = v }))
  for (let i = 0; i < Math.min(9, size); i++) {
    const idx = size - 8 + i
    if (idx < size) {
      grid[i][idx] = i < 7 ? 1 : 0
      grid[idx][i] = i < 7 ? 1 : 0
    }
  }
  const seed = text.split('').reduce((s, c) => s * 31 + c.charCodeAt(0), 1)
  let rng = seed
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff
        grid[r][c] = (rng >> 16) & 1
      }
    }
  }
  return { grid, size }
}

export default function QRCode({ data, size = 100 }) {
  const canvasRef = useRef(null)
  const str = typeof data === 'string' ? data : JSON.stringify(data)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { grid, size: gs } = qrEncode(str)
    const ctx = canvas.getContext('2d')
    const scale = size / gs
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#000'
    for (let r = 0; r < gs; r++) {
      for (let c = 0; c < gs; c++) {
        if (grid[r][c]) ctx.fillRect(c * scale, r * scale, Math.ceil(scale), Math.ceil(scale))
      }
    }
  }, [str, size])

  return <canvas ref={canvasRef} id="qr-canvas" width={size} height={size} style={{ width: size, height: size, borderRadius: 4 }} />
}
