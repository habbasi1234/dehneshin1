import { useRef, useMemo, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, PerspectiveCamera, Environment, ContactShadows, Image, Text } from '@react-three/drei'
import * as THREE from 'three'

class ImageErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError ? this.props.fallback || null : this.props.children
  }
}

function LogoImage({ logoUrl }) {
  const groupRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock, mouse }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05 + mouse.x * 0.15
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.03 + mouse.y * 0.1
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 0.8) * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.4}>
        {/* Glow behind logo */}
        <mesh ref={glowRef} position={[0, 0, -0.3]}>
          <planeGeometry args={[3.5, 3.5]} />
          <meshBasicMaterial
            color="#D4AF37"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Second glow ring */}
        <mesh position={[0, 0, -0.4]}>
          <ringGeometry args={[1.8, 2.8, 64]} />
          <meshBasicMaterial
            color="#D4AF37"
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Logo image */}
        {logoUrl ? (
          <ImageErrorBoundary fallback={
            <Text color="#D4AF37" fontSize={0.6}
              font="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDXbMZ-.woff2"
              anchorX="center" anchorY="middle" position={[0, 0, 0]} material-toneMapped={false}>
              ده نشین
            </Text>
          }>
            <Image
              url={logoUrl}
              transparent
              scale={[2.2, 2.2, 1]}
              position={[0, 0, 0]}
            />
          </ImageErrorBoundary>
        ) : (
          /* Fallback: golden text when no logo */
          <Text
            color="#D4AF37"
            fontSize={0.8}
            font="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiunDXbMZ-.woff2"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0]}
            material-toneMapped={false}
          >
            ده نشین
          </Text>
        )}
      </Float>
    </group>
  )
}

function FloatingParticles({ count = 100 }) {
  const meshRef = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 16
    }
    return pos
  }, [count])

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.015
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#D4AF37"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

function AmbientLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#D4AF37" />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#E8C84A" />
      <pointLight position={[0, 3, 2]} intensity={0.6} color="#D4AF37" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.3} color="#D4AF37" />
    </>
  )
}

export default function ThreeScene({ logoUrl }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0,
    }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={45} />
        <AmbientLighting />
        <LogoImage logoUrl={logoUrl} />
        <FloatingParticles count={120} />
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.3}
          scale={10}
          blur={2}
          far={4}
        />
        <Environment preset="apartment" />
      </Canvas>
    </div>
  )
}
