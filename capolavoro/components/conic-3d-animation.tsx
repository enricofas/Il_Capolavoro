"use client"

import { useRef, useEffect, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Info } from "lucide-react"

interface ConicAnimationProps {
  darkMode: boolean
  language: string
}

// Componente per il cono doppio
function DoubleCone() {
  const coneRef = useRef<THREE.Group>(null)

  const coneGeometry = new THREE.ConeGeometry(3, 6, 32)
  const coneMaterial = new THREE.MeshLambertMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  })

  return (
    <group ref={coneRef}>
      {/* Cono superiore */}
      <mesh geometry={coneGeometry} material={coneMaterial} position={[0, 3, 0]} />
      {/* Cono inferiore */}
      <mesh geometry={coneGeometry} material={coneMaterial} position={[0, -3, 0]} rotation={[Math.PI, 0, 0]} />
    </group>
  )
}

// Componente per il piano di taglio
function CuttingPlane({
  position,
  rotation,
  visible,
}: { position: [number, number, number]; rotation: [number, number, number]; visible: boolean }) {
  const planeGeometry = new THREE.PlaneGeometry(8, 8)
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0x4444ff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  })

  if (!visible) return null

  return <mesh geometry={planeGeometry} material={planeMaterial} position={position} rotation={rotation} />
}

// Componente per le curve risultanti
function ConicCurve({
  type,
  position,
  rotation,
  visible,
  color,
}: {
  type: "circle" | "ellipse" | "parabola" | "hyperbola"
  position: [number, number, number]
  rotation: [number, number, number]
  visible: boolean
  color: number
}) {
  const curveRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (!curveRef.current) return

    let geometry: THREE.BufferGeometry

    switch (type) {
      case "circle":
        geometry = new THREE.RingGeometry(1.5, 1.7, 64)
        break
      case "ellipse":
        const ellipseShape = new THREE.Shape()
        const a = 2.5,
          b = 1.5
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2
          const x = a * Math.cos(angle)
          const y = b * Math.sin(angle)
          if (i === 0) ellipseShape.moveTo(x, y)
          else ellipseShape.lineTo(x, y)
        }
        geometry = new THREE.ShapeGeometry(ellipseShape)
        break
      case "parabola":
        const parabolaPoints = []
        for (let x = -3; x <= 3; x += 0.1) {
          const y = x * x * 0.2
          parabolaPoints.push(new THREE.Vector3(x, y, 0))
        }
        geometry = new THREE.BufferGeometry().setFromPoints(parabolaPoints)
        break
      case "hyperbola":
        const hyperbolaPoints1 = []
        const hyperbolaPoints2 = []
        for (let t = 0.1; t <= 3; t += 0.1) {
          const x1 = Math.cosh(t)
          const y1 = Math.sinh(t)
          const x2 = -Math.cosh(t)
          const y2 = Math.sinh(t)
          hyperbolaPoints1.push(new THREE.Vector3(x1, y1, 0))
          hyperbolaPoints1.push(new THREE.Vector3(x1, -y1, 0))
          hyperbolaPoints2.push(new THREE.Vector3(x2, y2, 0))
          hyperbolaPoints2.push(new THREE.Vector3(x2, -y2, 0))
        }
        geometry = new THREE.BufferGeometry().setFromPoints([...hyperbolaPoints1, ...hyperbolaPoints2])
        break
      default:
        geometry = new THREE.RingGeometry(1.5, 1.7, 64)
    }

    curveRef.current.geometry = geometry
  }, [type])

  const material = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.8 })

  if (!visible) return null

  return <mesh ref={curveRef} material={material} position={position} rotation={rotation} />
}

// Componente per le etichette
function ConicLabel({
  text,
  position,
  visible,
  color,
}: {
  text: string
  position: [number, number, number]
  visible: boolean
  color: string
}) {
  if (!visible) return null

  return (
    <Html position={position} center>
      <div
        className="px-3 py-1 rounded-lg text-sm font-semibold shadow-lg pointer-events-none"
        style={{
          backgroundColor: color,
          color: "white",
          border: "2px solid white",
        }}
      >
        {text}
      </div>
    </Html>
  )
}

// Componente principale della scena 3D
function Scene({
  animationStep,
  isPlaying,
  language,
}: {
  animationStep: number
  isPlaying: boolean
  language: string
}) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(8, 8, 8)
    camera.lookAt(0, 0, 0)
  }, [camera])

  const translate = (it: string, en: string) => {
    return language === "it" ? it : en
  }

  // Configurazioni per ogni step dell'animazione
  const steps = [
    {
      // Step 0: Circonferenza
      planePosition: [0, 1, 0] as [number, number, number],
      planeRotation: [0, 0, 0] as [number, number, number],
      conicType: "circle" as const,
      conicPosition: [0, 1, 0] as [number, number, number],
      conicRotation: [Math.PI / 2, 0, 0] as [number, number, number],
      labelPosition: [0, 2.5, 0] as [number, number, number],
      labelText: translate("Circonferenza", "Circle"),
      color: 0x3b82f6, // Blue
      colorHex: "#3b82f6",
    },
    {
      // Step 1: Ellisse
      planePosition: [0, 0, 0] as [number, number, number],
      planeRotation: [Math.PI / 6, 0, 0] as [number, number, number],
      conicType: "ellipse" as const,
      conicPosition: [0, 0, 0] as [number, number, number],
      conicRotation: [Math.PI / 2 + Math.PI / 6, 0, 0] as [number, number, number],
      labelPosition: [0, 2, 0] as [number, number, number],
      labelText: translate("Ellisse", "Ellipse"),
      color: 0x10b981, // Green
      colorHex: "#10b981",
    },
    {
      // Step 2: Parabola
      planePosition: [0, 0, 0] as [number, number, number],
      planeRotation: [Math.PI / 3, 0, 0] as [number, number, number],
      conicType: "parabola" as const,
      conicPosition: [0, 0, 0] as [number, number, number],
      conicRotation: [Math.PI / 2 + Math.PI / 3, 0, 0] as [number, number, number],
      labelPosition: [0, 3, 0] as [number, number, number],
      labelText: translate("Parabola", "Parabola"),
      color: 0xf59e0b, // Orange
      colorHex: "#f59e0b",
    },
    {
      // Step 3: Iperbole
      planePosition: [0, 0, 0] as [number, number, number],
      planeRotation: [Math.PI / 2.2, 0, 0] as [number, number, number],
      conicType: "hyperbola" as const,
      conicPosition: [0, 0, 0] as [number, number, number],
      conicRotation: [Math.PI / 2 + Math.PI / 2.2, 0, 0] as [number, number, number],
      labelPosition: [0, 3.5, 0] as [number, number, number],
      labelText: translate("Iperbole", "Hyperbola"),
      color: 0xef4444, // Red
      colorHex: "#ef4444",
    },
  ]

  const currentStep = steps[animationStep] || steps[0]

  return (
    <>
      {/* Luci */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} />

      {/* Cono doppio */}
      <DoubleCone />

      {/* Piano di taglio */}
      <CuttingPlane position={currentStep.planePosition} rotation={currentStep.planeRotation} visible={true} />

      {/* Curva conica risultante */}
      <ConicCurve
        type={currentStep.conicType}
        position={currentStep.conicPosition}
        rotation={currentStep.conicRotation}
        visible={true}
        color={currentStep.color}
      />

      {/* Etichetta */}
      <ConicLabel
        text={currentStep.labelText}
        position={currentStep.labelPosition}
        visible={true}
        color={currentStep.colorHex}
      />

      {/* Controlli orbitali */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={isPlaying}
        autoRotateSpeed={1}
      />
    </>
  )
}

// Componente principale
export default function Conic3DAnimation({ darkMode, language }: ConicAnimationProps) {
  const [animationStep, setAnimationStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const translate = (it: string, en: string) => {
    return language === "it" ? it : en
  }

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4)
    }, 3000) // Cambia step ogni 3 secondi

    return () => clearInterval(interval)
  }, [isPlaying])

  const stepNames = [
    translate("Circonferenza", "Circle"),
    translate("Ellisse", "Ellipse"),
    translate("Parabola", "Parabola"),
    translate("Iperbole", "Hyperbola"),
  ]

  const stepDescriptions = [
    translate("Piano perpendicolare all'asse del cono", "Plane perpendicular to the cone's axis"),
    translate("Piano obliquo che interseca una sola falda", "Oblique plane intersecting one nappe"),
    translate("Piano parallelo alla generatrice del cono", "Plane parallel to the cone's generator"),
    translate("Piano che interseca entrambe le falde", "Plane intersecting both nappes"),
  ]

  return (
    <Card
      className={`w-full max-w-6xl mx-auto ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
            {translate("Formazione delle Sezioni Coniche", "Formation of Conic Sections")}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            {translate("Info", "Info")}
          </Button>
        </div>
        {showInfo && (
          <div
            className={`mt-4 p-4 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`}
          >
            <p className="text-sm">
              {translate(
                "Questa animazione mostra come le quattro sezioni coniche si formano dall'intersezione di un piano con un cono doppio. Usa i controlli per navigare nella scena 3D.",
                "This animation shows how the four conic sections are formed by the intersection of a plane with a double cone. Use the controls to navigate the 3D scene.",
              )}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scena 3D */}
        <div className="relative w-full h-96 rounded-lg overflow-hidden border">
          <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
            <Scene animationStep={animationStep} isPlaying={isPlaying} language={language} />
          </Canvas>
        </div>

        {/* Controlli */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-2">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? translate("Pausa", "Pause") : translate("Riproduci", "Play")}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setAnimationStep(0)
                setIsPlaying(false)
              }}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {translate("Reset", "Reset")}
            </Button>
          </div>

          {/* Indicatori step */}
          <div className="grid grid-cols-4 gap-2">
            {stepNames.map((name, index) => (
              <button
                key={index}
                onClick={() => {
                  setAnimationStep(index)
                  setIsPlaying(false)
                }}
                className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  animationStep === index
                    ? darkMode
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-blue-500 border-blue-400 text-white"
                    : darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="font-semibold">{name}</div>
                <div className="text-xs mt-1 opacity-80">{stepDescriptions[index]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Descrizione corrente */}
        <div
          className={`p-4 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
        >
          <h4 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
            {translate("Sezione Corrente:", "Current Section:")} {stepNames[animationStep]}
          </h4>
          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{stepDescriptions[animationStep]}</p>
        </div>
      </CardContent>
    </Card>
  )
}
