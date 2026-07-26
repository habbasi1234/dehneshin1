import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProductViewer3D({ image, onClose, colors = [], fabrics = [] }) {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let scene, camera, renderer, mesh, controls
    let mounted = true
    const init = async () => {
      try {
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        if (!mounted || !containerRef.current) return
        const w = containerRef.current.clientWidth
        const h = containerRef.current.clientHeight
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
        camera.position.z = 5
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        containerRef.current.appendChild(renderer.domElement)
        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.autoRotate = true
        controls.autoRotateSpeed = 2

        const textureLoader = new THREE.TextureLoader()
        const texture = await new Promise((resolve) => {
          textureLoader.load(image, (t) => resolve(t), undefined, () => resolve(null))
        })

        const geometry = new THREE.BoxGeometry(2.8, 2.1, 0.6)
        const materials = [
          new THREE.MeshStandardMaterial({ color: 0x2C1810, roughness: 0.8 }),
          new THREE.MeshStandardMaterial({ color: 0x2C1810, roughness: 0.8 }),
          new THREE.MeshStandardMaterial({ color: 0x2C1810, roughness: 0.8 }),
          new THREE.MeshStandardMaterial({ color: 0x2C1810, roughness: 0.8 }),
          texture ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6, metalness: 0.1 }) : new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.4 }),
          new THREE.MeshStandardMaterial({ color: 0x2C1810, roughness: 0.8 }),
        ]
        mesh = new THREE.Mesh(geometry, materials)
        scene.add(mesh)

        const ambient = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambient)
        const dir = new THREE.DirectionalLight(0xffffff, 1.2)
        dir.position.set(5, 5, 5)
        scene.add(dir)
        const rim = new THREE.DirectionalLight(0xD4AF37, 0.4)
        rim.position.set(-3, 2, -3)
        scene.add(rim)

        if (!mounted) return
        setLoading(false)
        const animate = () => {
          if (!mounted) return
          requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()
      } catch {
        if (mounted) setError(true)
      }
    }
    init()
    return () => { mounted = false; if (renderer) { renderer.dispose(); if (containerRef.current?.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement) } }
  }, [image])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        style={{ width: '90%', maxWidth: 700, height: '80vh', maxHeight: 600, position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
        {loading && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%' }} />
            <span style={{ color: '#A89880', fontSize: 13 }}>بارگذاری نمایش سه‌بعدی...</span>
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 48 }}>🪑</span>
            <span style={{ color: '#A89880', fontSize: 13 }}>نمایش سه‌بعدی در دسترس نیست</span>
            <span style={{ color: '#666', fontSize: 11 }}>می‌توانید با کشیدن ماوس تصویر را بچرخانید</span>
            <div ref={() => {}} style={{ display: 'none' }} />
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(212,175,55,0.15)' }}>
          <span style={{ color: '#A89880', fontSize: 11 }}>🖱 بکشید تا بچرخد</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
