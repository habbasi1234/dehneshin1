import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

const colorOptions = [
  { name: 'طلایی', bg: '#D4AF37', filter: 'hue-rotate(0deg) saturate(1.2)' },
  { name: 'نقره‌ای', bg: '#C0C0C0', filter: 'grayscale(0.8) brightness(1.2) hue-rotate(0deg)' },
  { name: 'مشکی', bg: '#111111', filter: 'brightness(0.3) saturate(0.5) hue-rotate(0deg)' },
  { name: 'سفید', bg: '#F5F0E8', filter: 'brightness(1.5) saturate(0.3) hue-rotate(0deg)' },
  { name: 'گردویی', bg: '#5C3A1E', filter: 'hue-rotate(25deg) saturate(1.1) brightness(0.9)' },
  { name: 'سرمه‌ای', bg: '#1B2A4A', filter: 'hue-rotate(225deg) saturate(1.3) brightness(0.7)' },
  { name: 'زرشکی', bg: '#8B0000', filter: 'hue-rotate(345deg) saturate(1.4) brightness(0.8)' },
  { name: 'سبز زیتونی', bg: '#556B2F', filter: 'hue-rotate(75deg) saturate(1.2) brightness(0.85)' },
]

const fabricOptions = [
  { name: 'ساده', pattern: 'none' },
  { name: 'راه راه', pattern: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)' },
  { name: 'شطرنجی', pattern: 'repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px), repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)' },
  { name: 'نقره‌ای', pattern: 'radial-gradient(circle at 25% 25%, rgba(192,192,192,0.25) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(192,192,192,0.15) 1px, transparent 1px)' },
  { name: 'طلایی', pattern: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.2) 2px, transparent 2px)' },
  { name: 'مخمل', pattern: 'linear-gradient(45deg, transparent 40%, rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.04) 60%, transparent 60%), linear-gradient(-45deg, transparent 40%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.02) 60%, transparent 60%)' },
  { name: 'لوزی', pattern: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(212,175,55,0.06) 8px, rgba(212,175,55,0.06) 10px), repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(212,175,55,0.06) 8px, rgba(212,175,55,0.06) 10px)' },
]

function GoldRing() {
  const meshRef = useRef()

  useFrame(({ clock, mouse }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3 + mouse.x * 0.5
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.08 + mouse.y * 0.3
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.3}>
      <mesh ref={meshRef}>
        <torusGeometry args={[2.2, 0.08, 32, 100]} />
        <meshPhysicalMaterial
          color="#D4AF37"
          metalness={0.95}
          roughness={0.1}
          emissive="#D4AF37"
          emissiveIntensity={0.15}
          envMapIntensity={2}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[2.6, 0.03, 16, 100]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.2} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#D4AF37" transparent opacity={0.15} />
      </mesh>
    </Float>
  )
}

function Particles({ count = 200 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 16
    return pos
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.015
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#D4AF37" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function ThreeBackground({ enabled }) {
  if (!enabled) return null
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none',
    }}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#D4AF37" />
        <directionalLight position={[-3, 2, -4]} intensity={0.4} color="#E8C84A" />
        <pointLight position={[0, 2, 1]} intensity={0.6} color="#D4AF37" />
        <GoldRing />
        <Particles count={120} />
      </Canvas>
    </div>
  )
}

function SwatchDot({ active, color, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.15, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      style={{
        width: 38, height: 38, borderRadius: '50%', cursor: 'pointer',
        background: color,
        border: active ? '3px solid #D4AF37' : '2px solid rgba(212,175,55,0.25)',
        outline: active ? '3px solid rgba(212,175,55,0.3)' : 'none',
        outlineOffset: 3,
        transition: 'all 0.3s ease',
        position: 'relative',
        boxShadow: active ? '0 0 20px rgba(212,175,55,0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: -6, right: -6,
            width: 14, height: 14, borderRadius: '50%',
            background: '#D4AF37',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, color: '#111',
          }}
        >
          ✓
        </motion.div>
      )}
    </motion.button>
  )
}

function FabricSwatch({ active, label, pattern, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={label}
      style={{
        width: 48, height: 48, borderRadius: 8, cursor: 'pointer',
        background: pattern === 'none' ? '#2a2a2a' : pattern + ', #2a2a2a',
        border: active ? '2px solid #D4AF37' : '2px solid rgba(212,175,55,0.15)',
        transition: 'all 0.3s ease',
        boxShadow: active ? '0 0 15px rgba(212,175,55,0.25)' : '0 2px 6px rgba(0,0,0,0.2)',
        position: 'relative',
      }}
    >
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute', top: -5, right: -5,
            width: 16, height: 16, borderRadius: '50%',
            background: '#D4AF37', color: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 'bold',
          }}
        >
          ✓
        </motion.div>
      )}
    </motion.button>
  )
}

export default function ProductConfigurator({
  images = [],
  colors = colorOptions,
  onColorChange,
  onFabricChange,
  threeEnabled = true,
}) {
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedFabric, setSelectedFabric] = useState(0)
  const [imageError, setImageError] = useState(false)

  const currentImage = images[0]
  const currentColor = colors[selectedColor] || colorOptions[0]
  const currentFabric = fabricOptions[selectedFabric]

  const handleColorChange = (index) => {
    setSelectedColor(index)
    if (onColorChange) onColorChange(colors[index] || colorOptions[index])
  }

  const handleFabricChange = (index) => {
    setSelectedFabric(index)
    if (onFabricChange) onFabricChange(fabricOptions[index])
  }

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, #0d0d0d 0%, #111111 50%, #0d0d0d 100%)',
      borderRadius: 24,
      overflow: 'hidden',
      minHeight: 600,
      border: '1px solid rgba(212,175,55,0.08)',
    }}>
      <ThreeBackground enabled={threeEnabled} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 30px 30px',
      }}>
        {(currentImage && !imageError) ? (
          <motion.div
            key={selectedColor + '-' + selectedFabric}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'relative',
              width: '100%', maxWidth: 420,
              aspectRatio: '4/3',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
              border: '1px solid rgba(212,175,55,0.1)',
            }}
          >
            <img
              src={currentImage}
              alt="محصول"
              onError={() => setImageError(true)}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: currentColor.filter || 'none',
                transition: 'filter 0.5s ease',
              }}
            />
            {currentFabric.pattern !== 'none' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: currentFabric.pattern,
                mixBlendMode: 'multiply',
                opacity: 0.6,
                pointerEvents: 'none',
              }} />
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '60%',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              border: '1px solid rgba(212,175,55,0.08)',
              borderRadius: 15,
              pointerEvents: 'none',
            }} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%', maxWidth: 420,
              aspectRatio: '4/3',
              borderRadius: 16,
              background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)',
              border: '1px solid rgba(212,175,55,0.1)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 16,
              boxShadow: '0 20px 80px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '2px solid rgba(212,175,55,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem',
            }}>
              🪑
            </div>
            <p style={{ color: '#8A7A60', fontSize: '0.9rem', margin: 0 }}>
              {imageError ? 'تصویر بارگذاری نشد' : 'تصویری موجود نیست'}
            </p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            color: '#D4AF37', fontSize: '0.85rem', marginTop: 16, marginBottom: 0,
            opacity: 0.6, letterSpacing: 1,
          }}
        >
          {currentColor.name} · {currentFabric.name}
        </motion.p>

        <div style={{ width: '100%', maxWidth: 500, marginTop: 24 }}>
          <p style={{
            color: '#C0B090', fontSize: '0.8rem', marginBottom: 10,
            textAlign: 'center', opacity: 0.7,
          }}>
            انتخاب رنگ
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 14,
            flexWrap: 'wrap',
          }}>
            {(colors.length > 0 ? colors : colorOptions).map((c, i) => (
              <SwatchDot
                key={i}
                active={i === selectedColor}
                color={c.bg}
                label={c.name}
                onClick={() => handleColorChange(i)}
              />
            ))}
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 500, marginTop: 20 }}>
          <p style={{
            color: '#C0B090', fontSize: '0.8rem', marginBottom: 10,
            textAlign: 'center', opacity: 0.7,
          }}>
            انتخاب پارچه
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 10,
            flexWrap: 'wrap',
          }}>
            {fabricOptions.map((f, i) => (
              <FabricSwatch
                key={i}
                active={i === selectedFabric}
                label={f.name}
                pattern={f.pattern}
                onClick={() => handleFabricChange(i)}
              />
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 20, display: 'flex', gap: 20,
          fontSize: '0.75rem', color: 'rgba(212,175,55,0.3)',
        }}>
          <span>رنگ {currentColor.name}</span>
          <span>·</span>
          <span>پارچه {currentFabric.name}</span>
        </div>
      </div>
    </div>
  )
}
