"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Circle,
  Book,
  ChevronDown,
  ChevronUp,
  Info,
  Calculator,
  X,
  Maximize2,
  ArrowRight,
  Check,
  RotateCcw,
  Target,
  Zap,
  BookOpen,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"

// Importa Plotly dinamicamente per evitare problemi SSR
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface ConicSection {
  id: string
  title: string
  titleEn: string
  icon: React.ReactNode
  description: string
  descriptionEn: string
  examples: string[]
  defaultFunction: string
  color: string
  accentColor: string
  lightColor: string
  parameters: {
    [key: string]: {
      label: string
      labelEn: string
      min: number
      max: number
      step: number
      default: number
      description: string
      descriptionEn: string
    }
  }
}

interface ParameterInfo {
  name: string
  value: number | string
  description: string
  tooltip?: string
}

const conicSections: ConicSection[] = [
  {
    id: "parabola",
    title: "Parabola",
    titleEn: "Parabola",
    icon: (
      <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 4 C 6 16, 18 16, 21 4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="1.5" fill="currentColor" />
        <line x1="12" y1="4" x2="12" y2="15" strokeDasharray="2,2" opacity="0.5" />
      </svg>
    ),
    description:
      "Una parabola è il luogo geometrico dei punti del piano equidistanti da un punto fisso (fuoco) e da una retta (direttrice). La forma più semplice è y = ax² + bx + c.",
    descriptionEn:
      "A parabola is the locus of points in the plane equidistant from a fixed point (focus) and a line (directrix). The simplest form is y = ax² + bx + c.",
    examples: ["y = x^2", "y = 2*x^2 + 3*x - 1", "y = -0.5*x^2 + 4", "y - x^2 = 0"],
    defaultFunction: "y = x^2",
    color: "blue",
    accentColor: "rgb(59, 130, 246)",
    lightColor: "rgba(59, 130, 246, 0.1)",
    parameters: {
      a: {
        label: "Coefficiente a (x²)",
        labelEn: "Coefficient a (x²)",
        min: -3,
        max: 3,
        step: 0.1,
        default: 1,
        description:
          "Controlla l'apertura e l'orientamento della parabola. Se a > 0, apre verso l'alto; se a < 0, verso il basso.",
        descriptionEn:
          "Controls the opening and orientation of the parabola. If a > 0, opens upward; if a < 0, downward.",
      },
      b: {
        label: "Coefficiente b (x)",
        labelEn: "Coefficient b (x)",
        min: -5,
        max: 5,
        step: 0.1,
        default: 0,
        description: "Controlla la posizione orizzontale del vertice della parabola.",
        descriptionEn: "Controls the horizontal position of the parabola's vertex.",
      },
      c: {
        label: "Coefficiente c (costante)",
        labelEn: "Coefficient c (constant)",
        min: -5,
        max: 5,
        step: 0.1,
        default: 0,
        description: "Controlla la posizione verticale della parabola (intercetta con l'asse y).",
        descriptionEn: "Controls the vertical position of the parabola (y-axis intercept).",
      },
    },
  },
  {
    id: "circonferenza",
    title: "Circonferenza",
    titleEn: "Circle",
    icon: <Circle className="w-8 h-8 text-emerald-500" />,
    description:
      "Una circonferenza è il luogo geometrico dei punti del piano equidistanti da un punto fisso (centro). L'equazione standard è (x-h)² + (y-k)² = r².",
    descriptionEn:
      "A circle is the locus of points in the plane equidistant from a fixed point (center). The standard equation is (x-h)² + (y-k)² = r².",
    examples: ["x^2 + y^2 = 25", "(x-2)^2 + (y-3)^2 = 16", "x^2 + y^2 - 4*x + 6*y = 12", "x^2 + y^2 - 25 = 0"],
    defaultFunction: "x^2 + y^2 = 25",
    color: "emerald",
    accentColor: "rgb(16, 185, 129)",
    lightColor: "rgba(16, 185, 129, 0.1)",
    parameters: {
      h: {
        label: "Centro X (h)",
        labelEn: "Center X (h)",
        min: -5,
        max: 5,
        step: 0.1,
        default: 0,
        description: "Coordinata x del centro della circonferenza.",
        descriptionEn: "X-coordinate of the circle's center.",
      },
      k: {
        label: "Centro Y (k)",
        labelEn: "Center Y (k)",
        min: -5,
        max: 5,
        step: 0.1,
        default: 0,
        description: "Coordinata y del centro della circonferenza.",
        descriptionEn: "Y-coordinate of the circle's center.",
      },
      r: {
        label: "Raggio (r)",
        labelEn: "Radius (r)",
        min: 0.5,
        max: 6,
        step: 0.1,
        default: 3,
        description: "Raggio della circonferenza. Deve essere sempre positivo.",
        descriptionEn: "Radius of the circle. Must always be positive.",
      },
    },
  },
  {
    id: "ellisse",
    title: "Ellisse",
    titleEn: "Ellipse",
    icon: (
      <svg className="w-8 h-8 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="12" rx="8" ry="5" />
        <circle cx="7" cy="12" r="1" fill="currentColor" />
        <circle cx="17" cy="12" r="1" fill="currentColor" />
        <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="2,2" opacity="0.5" />
        <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2,2" opacity="0.5" />
      </svg>
    ),
    description:
      "Un'ellisse è il luogo geometrico dei punti del piano per cui è costante la somma delle distanze da due punti fissi (fuochi). La forma standard è x²/a² + y²/b² = 1.",
    descriptionEn:
      "An ellipse is the locus of points in the plane for which the sum of distances from two fixed points (foci) is constant. The standard form is x²/a² + y²/b² = 1.",
    examples: ["x^2/25 + y^2/16 = 1", "x^2/9 + y^2/4 = 1", "4*x^2 + 9*y^2 = 36", "x^2/25 + y^2/16 - 1 = 0"],
    defaultFunction: "x^2/25 + y^2/16 = 1",
    color: "violet",
    accentColor: "rgb(139, 92, 246)",
    lightColor: "rgba(139, 92, 246, 0.1)",
    parameters: {
      a: {
        label: "Semiasse maggiore (a)",
        labelEn: "Semi-major axis (a)",
        min: 1,
        max: 6,
        step: 0.1,
        default: 4,
        description: "Semiasse maggiore dell'ellisse (orizzontale se a > b).",
        descriptionEn: "Semi-major axis of the ellipse (horizontal if a > b).",
      },
      b: {
        label: "Semiasse minore (b)",
        labelEn: "Semi-minor axis (b)",
        min: 1,
        max: 6,
        step: 0.1,
        default: 3,
        description: "Semiasse minore dell'ellisse (verticale se a > b).",
        descriptionEn: "Semi-minor axis of the ellipse (vertical if a > b).",
      },
      h: {
        label: "Centro X (h)",
        labelEn: "Center X (h)",
        min: -3,
        max: 3,
        step: 0.1,
        default: 0,
        description: "Coordinata x del centro dell'ellisse.",
        descriptionEn: "X-coordinate of the ellipse's center.",
      },
      k: {
        label: "Centro Y (k)",
        labelEn: "Center Y (k)",
        min: -3,
        max: 3,
        step: 0.1,
        default: 0,
        description: "Coordinata y del centro dell'ellisse.",
        descriptionEn: "Y-coordinate of the ellipse's center.",
      },
    },
  },
  {
    id: "iperbole",
    title: "Iperbole",
    titleEn: "Hyperbola",
    icon: (
      <svg className="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6 C 7 9, 7 15, 4 18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 6 C 17 9, 17 15, 20 18" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="1,1" opacity="0.5" />
        <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="1,1" opacity="0.5" />
      </svg>
    ),
    description:
      "Un'iperbole è il luogo geometrico dei punti del piano per cui è costante la differenza delle distanze da due punti fissi (fuochi). La forma standard è x²/a² - y²/b² = 1.",
    descriptionEn:
      "A hyperbola is the locus of points in the plane for which the difference of distances from two fixed points (foci) is constant. The standard form is x²/a² - y²/b² = 1.",
    examples: ["x^2/16 - y^2/9 = 1", "y^2/4 - x^2/9 = 1", "x*y = 12", "x^2/16 - y^2/9 - 1 = 0"],
    defaultFunction: "x^2/16 - y^2/9 = 1",
    color: "rose",
    accentColor: "rgb(244, 63, 94)",
    lightColor: "rgba(244, 63, 94, 0.1)",
    parameters: {
      a: {
        label: "Semiasse trasverso (a)",
        labelEn: "Transverse semi-axis (a)",
        min: 1,
        max: 5,
        step: 0.1,
        default: 3,
        description: "Semiasse trasverso dell'iperbole.",
        descriptionEn: "Transverse semi-axis of the hyperbola.",
      },
      b: {
        label: "Semiasse coniugato (b)",
        labelEn: "Conjugate semi-axis (b)",
        min: 1,
        max: 5,
        step: 0.1,
        default: 2,
        description: "Semiasse coniugato dell'iperbole.",
        descriptionEn: "Conjugate semi-axis of the hyperbola.",
      },
      h: {
        label: "Centro X (h)",
        labelEn: "Center X (h)",
        min: -3,
        max: 3,
        step: 0.1,
        default: 0,
        description: "Coordinata x del centro dell'iperbole.",
        descriptionEn: "X-coordinate of the hyperbola's center.",
      },
      k: {
        label: "Centro Y (k)",
        labelEn: "Center Y (k)",
        min: -3,
        max: 3,
        step: 0.1,
        default: 0,
        description: "Coordinata y del centro dell'iperbole.",
        descriptionEn: "Y-coordinate of the hyperbola's center.",
      },
    },
  },
]

function ConicSectionComponent({
  section,
  darkMode,
  language,
}: {
  section: ConicSection
  darkMode: boolean
  language: string
}) {
  // Stato per i parametri della conica
  const [parameters, setParameters] = useState<{ [key: string]: number }>(() => {
    const defaultParams: { [key: string]: number } = {}
    Object.keys(section.parameters).forEach((key) => {
      defaultParams[key] = section.parameters[key].default
    })
    return defaultParams
  })

  const [plotData, setPlotData] = useState<any>(null)
  const [calculatedInfo, setCalculatedInfo] = useState<ParameterInfo[]>([])
  const [activeTab, setActiveTab] = useState("grafico")
  const [showTheory, setShowTheory] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [equation, setEquation] = useState("")
  const sectionRef = useRef(null)
  const plotRef = useRef(null)

  // Funzione di traduzione locale
  const translate = (it: string, en: string) => {
    return language === "it" ? it : en
  }

  // Effetto per aggiornare il grafico quando cambiano i parametri
  useEffect(() => {
    generateGraph()
  }, [parameters, darkMode])

  // Effetto per gestire l'animazione di entrata
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in")
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen)
  }

  const resetParameters = () => {
    const defaultParams: { [key: string]: number } = {}
    Object.keys(section.parameters).forEach((key) => {
      defaultParams[key] = section.parameters[key].default
    })
    setParameters(defaultParams)
  }

  const updateParameter = (key: string, value: number) => {
    const param = section.parameters[key]
    const clampedValue = Math.max(param.min, Math.min(param.max, value))
    setParameters((prev) => ({
      ...prev,
      [key]: clampedValue,
    }))
  }

  const handleInputChange = (key: string, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      updateParameter(key, numValue)
    }
  }

  // Funzione helper per formattare i valori numerici
  const formatValue = (value: number | string): string => {
    if (typeof value === "string") return value
    if (typeof value === "number") {
      if (isNaN(value) || !isFinite(value)) return translate("Non definito", "Undefined")
      return value.toFixed(2)
    }
    return translate("Non definito", "Undefined")
  }

  const generateGraph = () => {
    try {
      const traces = []
      let currentEquation = ""
      const info: ParameterInfo[] = []

      if (section.id === "parabola") {
        const { a, b, c } = parameters
        currentEquation = `y = ${a}x² ${b >= 0 ? "+" : ""}${b}x ${c >= 0 ? "+" : ""}${c}`

        // Calcola vertice
        const xVertex = -b / (2 * a)
        const yVertex = a * xVertex * xVertex + b * xVertex + c

        // Calcola fuoco e direttrice
        const p = 1 / (4 * a)
        const focusX = xVertex
        const focusY = yVertex + p
        const directrix = yVertex - p

        info.push(
          {
            name: translate("Coefficiente a", "Coefficient a"),
            value: a,
            description: translate("Coefficiente del termine quadratico", "Coefficient of the quadratic term"),
            tooltip: translate(
              "Determina l'apertura della parabola: |a| grande = parabola stretta, |a| piccolo = parabola larga",
              "Determines the opening of the parabola: large |a| = narrow parabola, small |a| = wide parabola",
            ),
          },
          {
            name: translate("Coefficiente b", "Coefficient b"),
            value: b,
            description: translate("Coefficiente del termine lineare", "Coefficient of the linear term"),
            tooltip: translate(
              "Sposta il vertice orizzontalmente: b positivo sposta a sinistra, b negativo a destra",
              "Shifts the vertex horizontally: positive b shifts left, negative b shifts right",
            ),
          },
          {
            name: translate("Coefficiente c", "Coefficient c"),
            value: c,
            description: translate("Termine costante", "Constant term"),
            tooltip: translate(
              "Punto di intersezione con l'asse y: la parabola passa per (0, c)",
              "Y-axis intersection point: the parabola passes through (0, c)",
            ),
          },
          {
            name: translate("Vertice", "Vertex"),
            value: `(${xVertex.toFixed(2)}, ${yVertex.toFixed(2)})`,
            description: translate(
              "Punto di minimo o massimo della parabola",
              "Minimum or maximum point of the parabola",
            ),
            tooltip: translate(
              "Il punto più alto (a < 0) o più basso (a > 0) della parabola",
              "The highest (a < 0) or lowest (a > 0) point of the parabola",
            ),
          },
          {
            name: translate("Fuoco", "Focus"),
            value: `(${focusX.toFixed(2)}, ${focusY.toFixed(2)})`,
            description: translate("Punto focale della parabola", "Focal point of the parabola"),
            tooltip: translate(
              "Punto fisso da cui tutti i punti della parabola sono equidistanti dalla direttrice",
              "Fixed point from which all points on the parabola are equidistant from the directrix",
            ),
          },
          {
            name: translate("Direttrice", "Directrix"),
            value: `y = ${directrix.toFixed(2)}`,
            description: translate("Retta direttrice della parabola", "Directrix line of the parabola"),
            tooltip: translate(
              "Retta fissa da cui tutti i punti della parabola sono equidistanti dal fuoco",
              "Fixed line from which all points on the parabola are equidistant from the focus",
            ),
          },
        )

        // Genera punti per il grafico
        const xValues = []
        const yValues = []
        for (let x = -10; x <= 10; x += 0.1) {
          const y = a * x * x + b * x + c
          if (isFinite(y) && Math.abs(y) < 50) {
            xValues.push(x)
            yValues.push(y)
          }
        }

        traces.push({
          x: xValues,
          y: yValues,
          type: "scatter",
          mode: "lines",
          line: { color: section.accentColor, width: 3 },
          name: section.title,
        })

        // Aggiungi vertice
        traces.push({
          x: [xVertex],
          y: [yVertex],
          type: "scatter",
          mode: "markers",
          marker: {
            color: section.accentColor,
            size: 10,
            symbol: "circle",
            line: { color: "white", width: 2 },
          },
          name: translate("Vertice", "Vertex"),
          showlegend: false,
        })

        // Aggiungi fuoco
        traces.push({
          x: [focusX],
          y: [focusY],
          type: "scatter",
          mode: "markers",
          marker: {
            color: "red",
            size: 8,
            symbol: "diamond",
            line: { color: "white", width: 1 },
          },
          name: translate("Fuoco", "Focus"),
          showlegend: false,
        })
      } else if (section.id === "circonferenza") {
        const { h, k, r } = parameters
        currentEquation = `(x${h >= 0 ? "-" : "+"}${Math.abs(h)})² + (y${k >= 0 ? "-" : "+"}${Math.abs(k)})² = ${r}²`

        info.push(
          {
            name: translate("Centro", "Center"),
            value: `(${h}, ${k})`,
            description: translate("Centro della circonferenza", "Center of the circle"),
            tooltip: translate(
              "Punto equidistante da tutti i punti della circonferenza",
              "Point equidistant from all points on the circle",
            ),
          },
          {
            name: translate("Raggio", "Radius"),
            value: r,
            description: translate("Raggio della circonferenza", "Radius of the circle"),
            tooltip: translate(
              "Distanza costante dal centro a qualsiasi punto della circonferenza",
              "Constant distance from the center to any point on the circle",
            ),
          },
          {
            name: translate("Diametro", "Diameter"),
            value: 2 * r,
            description: translate("Diametro della circonferenza", "Diameter of the circle"),
            tooltip: translate("Doppio del raggio, la corda più lunga", "Twice the radius, the longest chord"),
          },
          {
            name: translate("Circonferenza", "Circumference"),
            value: (2 * Math.PI * r).toFixed(2),
            description: translate("Lunghezza della circonferenza", "Length of the circumference"),
            tooltip: translate("Perimetro del cerchio: 2πr", "Perimeter of the circle: 2πr"),
          },
          {
            name: translate("Area", "Area"),
            value: (Math.PI * r * r).toFixed(2),
            description: translate("Area del cerchio", "Area of the circle"),
            tooltip: translate("Superficie racchiusa dalla circonferenza: πr²", "Surface enclosed by the circle: πr²"),
          },
        )

        // Genera punti per la circonferenza
        const x = [],
          y = []
        for (let i = 0; i <= 100; i++) {
          const angle = (i / 100) * 2 * Math.PI
          x.push(h + r * Math.cos(angle))
          y.push(k + r * Math.sin(angle))
        }

        traces.push({
          x: x,
          y: y,
          type: "scatter",
          mode: "lines",
          line: { color: section.accentColor, width: 3 },
          name: section.title,
        })

        // Aggiungi il centro
        traces.push({
          x: [h],
          y: [k],
          type: "scatter",
          mode: "markers",
          marker: {
            color: section.accentColor,
            size: 8,
            symbol: "circle",
            line: { color: "white", width: 1 },
          },
          name: translate("Centro", "Center"),
          showlegend: false,
        })
      } else if (section.id === "ellisse") {
        const { a, b, h, k } = parameters
        currentEquation = `(x${h >= 0 ? "-" : "+"}${Math.abs(h)})²/${a}² + (y${k >= 0 ? "-" : "+"}${Math.abs(k)})²/${b}² = 1`

        // Calcola parametri dell'ellisse
        const c = Math.sqrt(Math.abs(a * a - b * b))
        const e = c / Math.max(a, b)
        const semiMajor = Math.max(a, b)
        const semiMinor = Math.min(a, b)

        // Calcola fuochi
        let focus1X, focus1Y, focus2X, focus2Y
        if (a > b) {
          focus1X = h + c
          focus1Y = k
          focus2X = h - c
          focus2Y = k
        } else {
          focus1X = h
          focus1Y = k + c
          focus2X = h
          focus2Y = k - c
        }

        info.push(
          {
            name: translate("Centro", "Center"),
            value: `(${h}, ${k})`,
            description: translate("Centro dell'ellisse", "Center of the ellipse"),
            tooltip: translate("Punto di simmetria dell'ellisse", "Point of symmetry of the ellipse"),
          },
          {
            name: translate("Semiasse maggiore", "Semi-major axis"),
            value: semiMajor,
            description: translate("Semiasse maggiore", "Semi-major axis"),
            tooltip: translate(
              "Metà della distanza massima tra due punti dell'ellisse",
              "Half the maximum distance between two points on the ellipse",
            ),
          },
          {
            name: translate("Semiasse minore", "Semi-minor axis"),
            value: semiMinor,
            description: translate("Semiasse minore", "Semi-minor axis"),
            tooltip: translate(
              "Metà della distanza minima tra due punti dell'ellisse",
              "Half the minimum distance between two points on the ellipse",
            ),
          },
          {
            name: translate("Eccentricità", "Eccentricity"),
            value: e.toFixed(3),
            description: translate("Eccentricità dell'ellisse (0 < e < 1)", "Eccentricity of the ellipse (0 < e < 1)"),
            tooltip: translate(
              "Misura quanto l'ellisse si discosta dalla circonferenza: e=0 è un cerchio",
              "Measures how much the ellipse deviates from a circle: e=0 is a circle",
            ),
          },
          {
            name: translate("Fuoco 1", "Focus 1"),
            value: `(${focus1X.toFixed(2)}, ${focus1Y.toFixed(2)})`,
            description: translate("Primo fuoco", "First focus"),
            tooltip: translate(
              "Primo punto fisso: la somma delle distanze da F1 e F2 è costante per ogni punto dell'ellisse",
              "First fixed point: the sum of distances from F1 and F2 is constant for every point on the ellipse",
            ),
          },
          {
            name: translate("Fuoco 2", "Focus 2"),
            value: `(${focus2X.toFixed(2)}, ${focus2Y.toFixed(2)})`,
            description: translate("Secondo fuoco", "Second focus"),
            tooltip: translate(
              "Secondo punto fisso: la somma delle distanze da F1 e F2 è costante per ogni punto dell'ellisse",
              "Second fixed point: the sum of distances from F1 and F2 is constant for every point on the ellipse",
            ),
          },
          {
            name: translate("Area", "Area"),
            value: (Math.PI * a * b).toFixed(2),
            description: translate("Area dell'ellisse", "Area of the ellipse"),
            tooltip: translate("Superficie racchiusa dall'ellisse: πab", "Surface enclosed by the ellipse: πab"),
          },
        )

        // Genera punti per l'ellisse
        const x = [],
          y = []
        for (let i = 0; i <= 100; i++) {
          const angle = (i / 100) * 2 * Math.PI
          x.push(h + a * Math.cos(angle))
          y.push(k + b * Math.sin(angle))
        }

        traces.push({
          x: x,
          y: y,
          type: "scatter",
          mode: "lines",
          line: { color: section.accentColor, width: 3 },
          name: section.title,
        })

        // Aggiungi centro e fuochi
        traces.push({
          x: [h],
          y: [k],
          type: "scatter",
          mode: "markers",
          marker: {
            color: section.accentColor,
            size: 8,
            symbol: "circle",
            line: { color: "white", width: 1 },
          },
          name: translate("Centro", "Center"),
          showlegend: false,
        })

        traces.push({
          x: [focus1X, focus2X],
          y: [focus1Y, focus2Y],
          type: "scatter",
          mode: "markers",
          marker: {
            color: "red",
            size: 6,
            symbol: "diamond",
            line: { color: "white", width: 1 },
          },
          name: translate("Fuochi", "Foci"),
          showlegend: false,
        })
      } else if (section.id === "iperbole") {
        const { a, b, h, k } = parameters
        currentEquation = `(x${h >= 0 ? "-" : "+"}${Math.abs(h)})²/${a}² - (y${k >= 0 ? "-" : "+"}${Math.abs(k)})²/${b}² = 1`

        // Calcola parametri dell'iperbole
        const c = Math.sqrt(a * a + b * b)
        const e = c / a

        info.push(
          {
            name: translate("Centro", "Center"),
            value: `(${h}, ${k})`,
            description: translate("Centro dell'iperbole", "Center of the hyperbola"),
            tooltip: translate("Punto di simmetria dell'iperbole", "Point of symmetry of the hyperbola"),
          },
          {
            name: translate("Semiasse trasverso", "Transverse semi-axis"),
            value: a,
            description: translate("Semiasse trasverso (a)", "Transverse semi-axis (a)"),
            tooltip: translate(
              "Distanza dal centro ai vertici dell'iperbole",
              "Distance from the center to the vertices of the hyperbola",
            ),
          },
          {
            name: translate("Semiasse coniugato", "Conjugate semi-axis"),
            value: b,
            description: translate("Semiasse coniugato (b)", "Conjugate semi-axis (b)"),
            tooltip: translate(
              "Parametro che determina l'inclinazione degli asintoti",
              "Parameter that determines the slope of the asymptotes",
            ),
          },
          {
            name: translate("Eccentricità", "Eccentricity"),
            value: e.toFixed(3),
            description: translate("Eccentricità dell'iperbole (e > 1)", "Eccentricity of the hyperbola (e > 1)"),
            tooltip: translate(
              "Misura quanto l'iperbole è 'aperta': e grande = rami molto aperti",
              "Measures how 'open' the hyperbola is: large e = very open branches",
            ),
          },
          {
            name: translate("Fuoco 1", "Focus 1"),
            value: `(${(h + c).toFixed(2)}, ${k})`,
            description: translate("Primo fuoco", "First focus"),
            tooltip: translate(
              "Primo punto fisso: la differenza delle distanze da F1 e F2 è costante",
              "First fixed point: the difference of distances from F1 and F2 is constant",
            ),
          },
          {
            name: translate("Fuoco 2", "Focus 2"),
            value: `(${(h - c).toFixed(2)}, ${k})`,
            description: translate("Secondo fuoco", "Second focus"),
            tooltip: translate(
              "Secondo punto fisso: la differenza delle distanze da F1 e F2 è costante",
              "Second fixed point: the difference of distances from F1 and F2 is constant",
            ),
          },
          {
            name: translate("Asintoti", "Asymptotes"),
            value: `y = ±${(b / a).toFixed(2)}(x - ${h}) + ${k}`,
            description: translate("Equazioni degli asintoti", "Equations of the asymptotes"),
            tooltip: translate(
              "Rette a cui l'iperbole si avvicina indefinitamente senza mai toccarle",
              "Lines that the hyperbola approaches indefinitely without ever touching them",
            ),
          },
        )

        // Genera i rami dell'iperbole
        const x1 = [],
          y1 = [],
          x2 = [],
          y2 = [],
          x3 = [],
          y3 = [],
          x4 = [],
          y4 = []

        for (let t = 0.01; t <= 3; t += 0.05) {
          const xPos = h + a * Math.cosh(t)
          const yPos = k + b * Math.sinh(t)
          const yNeg = k - b * Math.sinh(t)

          x1.push(xPos)
          y1.push(yPos)
          x2.push(xPos)
          y2.push(yNeg)
          x3.push(h - (xPos - h))
          y3.push(yPos)
          x4.push(h - (xPos - h))
          y4.push(yNeg)
        }

        traces.push(
          {
            x: x1,
            y: y1,
            type: "scatter",
            mode: "lines",
            line: { color: section.accentColor, width: 3 },
            showlegend: false,
          },
          {
            x: x2,
            y: y2,
            type: "scatter",
            mode: "lines",
            line: { color: section.accentColor, width: 3 },
            showlegend: false,
          },
          {
            x: x3,
            y: y3,
            type: "scatter",
            mode: "lines",
            line: { color: section.accentColor, width: 3 },
            showlegend: false,
          },
          {
            x: x4,
            y: y4,
            type: "scatter",
            mode: "lines",
            line: { color: section.accentColor, width: 3 },
            showlegend: false,
          },
        )

        // Aggiungi asintoti
        const asymptoteSlope = b / a
        const xAsymptote = [-10, 10]
        const yAsymptote1 = [k + asymptoteSlope * (-10 - h), k + asymptoteSlope * (10 - h)]
        const yAsymptote2 = [k - asymptoteSlope * (-10 - h), k - asymptoteSlope * (10 - h)]

        traces.push(
          {
            x: xAsymptote,
            y: yAsymptote1,
            type: "scatter",
            mode: "lines",
            line: { color: darkMode ? "#6b7280" : "#9ca3af", width: 1, dash: "dash" },
            showlegend: false,
          },
          {
            x: xAsymptote,
            y: yAsymptote2,
            type: "scatter",
            mode: "lines",
            line: { color: darkMode ? "#6b7280" : "#9ca3af", width: 1, dash: "dash" },
            showlegend: false,
          },
        )

        // Aggiungi centro
        traces.push({
          x: [h],
          y: [k],
          type: "scatter",
          mode: "markers",
          marker: {
            color: section.accentColor,
            size: 8,
            symbol: "circle",
            line: { color: "white", width: 1 },
          },
          name: translate("Centro", "Center"),
          showlegend: false,
        })
      }

      setEquation(currentEquation)
      setCalculatedInfo(info)

      // Crea il plot con tema scuro/chiaro
      setPlotData({
        data: traces,
        layout: {
          title: {
            text: `${section.title}: ${currentEquation}`,
            font: { family: "Inter, system-ui, sans-serif", size: 18, color: darkMode ? "#f3f4f6" : "#374151" },
          },
          xaxis: {
            title: {
              text: "x",
              font: { family: "Inter, system-ui, sans-serif", size: 16, color: darkMode ? "#d1d5db" : "#4b5563" },
            },
            range: [-12, 12],
            gridcolor: darkMode ? "#374151" : "#e5e7eb",
            gridwidth: 1,
            zeroline: true,
            zerolinecolor: darkMode ? "#6b7280" : "#374151",
            zerolinewidth: 2,
            tickfont: { family: "Inter, system-ui, sans-serif", size: 12, color: darkMode ? "#d1d5db" : "#6b7280" },
            showgrid: true,
            dtick: 2,
          },
          yaxis: {
            title: {
              text: "y",
              font: { family: "Inter, system-ui, sans-serif", size: 16, color: darkMode ? "#d1d5db" : "#4b5563" },
            },
            range: section.id === "parabola" ? [-15, 25] : [-12, 12],
            gridcolor: darkMode ? "#374151" : "#e5e7eb",
            gridwidth: 1,
            zeroline: true,
            zerolinecolor: darkMode ? "#6b7280" : "#374151",
            zerolinewidth: 2,
            scaleanchor: section.id !== "parabola" ? "x" : undefined,
            scaleratio: section.id !== "parabola" ? 1 : undefined,
            tickfont: { family: "Inter, system-ui, sans-serif", size: 12, color: darkMode ? "#d1d5db" : "#6b7280" },
            showgrid: true,
            dtick: 2,
          },
          showlegend: false,
          plot_bgcolor: darkMode ? "#1f2937" : "#f8fafc",
          paper_bgcolor: darkMode ? "#111827" : "#ffffff",
          font: { family: "Inter, system-ui, sans-serif", size: 12, color: darkMode ? "#d1d5db" : "#374151" },
          margin: { l: 60, r: 40, t: 60, b: 60 },
          shapes: [
            // X-axis
            {
              type: "line",
              x0: -12,
              y0: 0,
              x1: 12,
              y1: 0,
              line: { color: darkMode ? "#6b7280" : "#374151", width: 2 },
            },
            // Y-axis
            {
              type: "line",
              x0: 0,
              y0: section.id === "parabola" ? -15 : -12,
              x1: 0,
              y1: section.id === "parabola" ? 25 : 12,
              line: { color: darkMode ? "#6b7280" : "#374151", width: 2 },
            },
            // X-axis arrow
            {
              type: "line",
              x0: 11.5,
              y0: -0.3,
              x1: 12,
              y1: 0,
              line: { color: darkMode ? "#6b7280" : "#374151", width: 2 },
            },
            {
              type: "line",
              x0: 11.5,
              y0: 0.3,
              x1: 12,
              y1: 0,
              line: { color: darkMode ? "#6b7280" : "#374151", width: 2 },
            },
            // Y-axis arrow
            {
              type: "line",
              x0: -0.3,
              y0: section.id === "parabola" ? 24.5 : 11.5,
              x1: 0,
              y1: section.id === "parabola" ? 25 : 12,
              line: { color: darkMode ? "#6b7280" : "#374151", width: 2 },
            },
            {
              type: "line",
              x0: 0.3,
              y0: section.id === "parabola" ? 24.5 : 11.5,
              x1: 0,
              y1: section.id === "parabola" ? 25 : 12,
              line: { color: darkMode ? "#6b7280" : "#374151", width: 2 },
            },
          ],
          annotations: [
            {
              x: 11.5,
              y: -1,
              text: "x",
              showarrow: false,
              font: { family: "Inter, system-ui, sans-serif", size: 14, color: darkMode ? "#d1d5db" : "#374151" },
            },
            {
              x: -1,
              y: section.id === "parabola" ? 24 : 11.5,
              text: "y",
              showarrow: false,
              font: { family: "Inter, system-ui, sans-serif", size: 14, color: darkMode ? "#d1d5db" : "#374151" },
            },
          ],
        },
      })

      setActiveTab("grafico")
    } catch (err) {
      console.error("Errore nella generazione del grafico:", err)
    }
  }

  return (
    <div
      ref={sectionRef}
      className={`py-16 px-4 opacity-100 transition-all duration-700 ${
        fullscreen ? "fixed inset-0 z-50 bg-white overflow-auto" : "min-h-screen"
      }`}
    >
      <div className={`mx-auto ${fullscreen ? "max-w-7xl" : "max-w-6xl"}`}>
        <Card
          className={`shadow-elegant-lg border-0 ${
            darkMode ? "bg-gray-800" : "bg-white"
          } backdrop-blur-sm overflow-hidden ${fullscreen ? "h-full" : ""}`}
        >
          <CardHeader
            className={`pb-6 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
            style={{ backgroundColor: section.lightColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md`}>
                  {section.icon}
                </div>
                <div>
                  <CardTitle className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {language === "it" ? section.title : section.titleEn}
                  </CardTitle>
                  <CardDescription className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {translate(
                      "Modifica i parametri e osserva come cambia il grafico",
                      "Modify parameters and observe how the graph changes",
                    )}
                  </CardDescription>
                </div>
              </div>
              {fullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Sezione Teoria Espansa */}
            <div
              className={`p-6 rounded-lg border shadow-sm ${
                darkMode
                  ? "bg-gradient-to-r from-gray-700 to-gray-700/30 border-gray-600"
                  : "bg-gradient-to-r from-gray-50 to-gray-50/30 border-gray-100"
              }`}
            >
              <button
                onClick={() => setShowTheory(!showTheory)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <Book className="w-6 h-6 text-gray-600" />
                  <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {translate("Teoria Matematica", "Mathematical Theory")}
                  </h3>
                </div>
                {showTheory ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showTheory && (
                <div className="mt-6 space-y-8">
                  {/* Definizione e Storia */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4
                        className={`font-semibold text-lg mb-3 flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-800"}`}
                      >
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        {translate("Definizione Geometrica", "Geometric Definition")}
                      </h4>
                      <p className={`leading-relaxed ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {language === "it" ? section.description : section.descriptionEn}
                      </p>
                    </div>

                    <div>
                      <h4
                        className={`font-semibold text-lg mb-3 flex items-center gap-2 ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-amber-500"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
                        </svg>
                        {translate("Cenni Storici", "Historical Notes")}
                      </h4>
                      <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {section.id === "parabola" &&
                          translate(
                            "La parabola fu studiata da Menecmo (350 a.C.) e successivamente da Apollonio di Perga, che le diede il nome attuale. Archimede utilizzò le parabole per i suoi studi sulla quadratura. Galileo dimostrò che i proiettili seguono traiettorie paraboliche.",
                            "The parabola was studied by Menaechmus (350 BC) and later by Apollonius of Perga, who gave it its current name. Archimedes used parabolas for his studies on quadrature. Galileo demonstrated that projectiles follow parabolic trajectories.",
                          )}
                        {section.id === "circonferenza" &&
                          translate(
                            "La circonferenza è stata studiata fin dall'antichità. Euclide (300 a.C.) ne formalizzò le proprietà negli 'Elementi'. Archimede calcolò un'approssimazione di π. Nel XVII secolo, Cartesio introdusse l'equazione analitica della circonferenza.",
                            "The circle has been studied since antiquity. Euclid (300 BC) formalized its properties in the 'Elements'. Archimedes calculated an approximation of π. In the 17th century, Descartes introduced the analytical equation of the circle.",
                          )}
                        {section.id === "ellisse" &&
                          translate(
                            "L'ellisse fu studiata da Menecmo e Apollonio di Perga. Keplero scoprì che i pianeti seguono orbite ellittiche (1609). L'ellisse acquisì importanza pratica con lo sviluppo dell'astronomia e della fisica newtoniana.",
                            "The ellipse was studied by Menaechmus and Apollonius of Perga. Kepler discovered that planets follow elliptical orbits (1609). The ellipse gained practical importance with the development of astronomy and Newtonian physics.",
                          )}
                        {section.id === "iperbole" &&
                          translate(
                            "L'iperbole fu studiata da Menecmo e formalizzata da Apollonio di Perga. Nel XVII secolo, Gregoire de Saint-Vincent studiò l'area sotto l'iperbole, contribuendo allo sviluppo dei logaritmi. Newton utilizzò l'iperbole nei suoi studi sulle orbite cometarie.",
                            "The hyperbola was studied by Menaechmus and formalized by Apollonius of Perga. In the 17th century, Gregoire de Saint-Vincent studied the area under the hyperbola, contributing to the development of logarithms. Newton used the hyperbola in his studies of cometary orbits.",
                          )}
                      </p>
                    </div>
                  </div>

                  {/* Teoria specifica per ogni conica */}
                  {section.id === "parabola" && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-blue-300" : "text-blue-800"
                            }`}
                          >
                            <Target className="h-4 w-4" />
                            {translate("Equazioni", "Equations")}
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-blue-200" : "text-blue-700"}`}>
                                {translate("Forma canonica:", "Canonical form:")}
                              </p>
                              <p className={`font-mono text-lg ${darkMode ? "text-blue-400" : "text-blue-700"}`}>
                                y = ax² + bx + c
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-blue-200" : "text-blue-700"}`}>
                                {translate("Forma con vertice:", "Vertex form:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-blue-400" : "text-blue-700"}`}>
                                y = a(x - h)² + k
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate("dove (h,k) è il vertice", "where (h,k) is the vertex")}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-blue-200" : "text-blue-700"}`}>
                                {translate("Forma focale:", "Focal form:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-blue-400" : "text-blue-700"}`}>
                                y - k = 1/(4p) · (x - h)²
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate("dove p è la distanza focale", "where p is the focal distance")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-purple-900/20 border-purple-800" : "bg-purple-50 border-purple-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-purple-300" : "text-purple-800"
                            }`}
                          >
                            <Zap className="h-4 w-4" />
                            {translate("Proprietà Geometriche", "Geometric Properties")}
                          </h5>
                          <ul className={`text-sm space-y-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Un punto P appartiene alla parabola se e solo se è equidistante dal fuoco F e dalla direttrice d",
                                  "A point P belongs to the parabola if and only if it is equidistant from the focus F and the directrix d",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "L'asse di simmetria passa per il vertice e il fuoco",
                                  "The axis of symmetry passes through the vertex and the focus",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "La distanza dal vertice al fuoco è |1/(4a)|",
                                  "The distance from the vertex to the focus is |1/(4a)|",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Proprietà riflessiva: i raggi paralleli all'asse vengono riflessi verso il fuoco",
                                  "Reflective property: rays parallel to the axis are reflected toward the focus",
                                )}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-green-300" : "text-green-800"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2 12h20M12 2v20M22 18a4 4 0 0 1-4 4M18 6a4 4 0 0 1 4 4M6 18a4 4 0 0 0 4 4M6 6a4 4 0 0 0 4 4"></path>
                            </svg>
                            {translate("Formule Importanti", "Important Formulas")}
                          </h5>
                          <div className={`text-sm space-y-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <div>
                              <p className="font-medium">
                                {translate("Coordinate del vertice:", "Vertex coordinates:")}
                              </p>
                              <p className="font-mono ml-2">V = (-b/(2a), c - b²/(4a))</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Coordinate del fuoco:", "Focus coordinates:")}</p>
                              <p className="font-mono ml-2">F = (-b/(2a), c - b²/(4a) + 1/(4a))</p>
                            </div>
                            <div>
                              <p className="font-medium">
                                {translate("Equazione della direttrice:", "Directrix equation:")}
                              </p>
                              <p className="font-mono ml-2">y = c - b²/(4a) - 1/(4a)</p>
                            </div>
                            <div>
                              <p className="font-medium">
                                {translate("Lunghezza del latus rectum:", "Length of latus rectum:")}
                              </p>
                              <p className="font-mono ml-2">LR = |1/a|</p>
                              <p className="text-xs italic">
                                {translate(
                                  "(segmento passante per il fuoco e perpendicolare all'asse)",
                                  "(segment passing through the focus and perpendicular to the axis)",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-indigo-900/20 border-indigo-800" : "bg-indigo-50 border-indigo-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-indigo-300" : "text-indigo-800"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4M12 8h.01"></path>
                            </svg>
                            {translate("Approfondimenti", "Further Insights")}
                          </h5>
                          <div className="grid md:grid-cols-1 gap-4">
                            <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              <p className="font-medium mb-1">
                                {translate("Interpretazione algebrica", "Algebraic interpretation")}
                              </p>
                              <p>
                                {translate(
                                  "La parabola rappresenta graficamente una funzione quadratica. Il coefficiente 'a' determina la concavità: se a > 0, la parabola è concava verso l'alto; se a < 0, è concava verso il basso.",
                                  "The parabola graphically represents a quadratic function. The coefficient 'a' determines the concavity: if a > 0, the parabola is concave upward; if a < 0, it is concave downward.",
                                )}
                              </p>
                            </div>
                            <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              <p className="font-medium mb-1">{translate("Sezione conica", "Conic section")}</p>
                              <p>
                                {translate(
                                  "La parabola può essere ottenuta sezionando un cono con un piano parallelo a una generatrice del cono. Questo è il motivo per cui è classificata come una sezione conica.",
                                  "The parabola can be obtained by sectioning a cone with a plane parallel to a generator of the cone. This is why it is classified as a conic section.",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === "circonferenza" && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-emerald-900/20 border-emerald-800" : "bg-emerald-50 border-emerald-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-emerald-300" : "text-emerald-800"
                            }`}
                          >
                            <Target className="h-4 w-4" />
                            {translate("Equazioni", "Equations")}
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <p
                                className={`text-sm font-medium ${darkMode ? "text-emerald-200" : "text-emerald-700"}`}
                              >
                                {translate("Forma canonica:", "Canonical form:")}
                              </p>
                              <p className={`font-mono text-lg ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                                (x - h)² + (y - k)² = r²
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate(
                                  "dove (h,k) è il centro e r è il raggio",
                                  "where (h,k) is the center and r is the radius",
                                )}
                              </p>
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium ${darkMode ? "text-emerald-200" : "text-emerald-700"}`}
                              >
                                {translate("Forma generale:", "General form:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                                x² + y² + Dx + Ey + F = 0
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate(
                                  "dove D = -2h, E = -2k, F = h² + k² - r²",
                                  "where D = -2h, E = -2k, F = h² + k² - r²",
                                )}
                              </p>
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium ${darkMode ? "text-emerald-200" : "text-emerald-700"}`}
                              >
                                {translate("Forma parametrica:", "Parametric form:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                                x = h + r·cos(t), y = k + r·sin(t)
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate("per t ∈ [0, 2π]", "for t ∈ [0, 2π]")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-blue-300" : "text-blue-800"
                            }`}
                          >
                            <Calculator className="h-4 w-4" />
                            {translate("Formule Fondamentali", "Fundamental Formulas")}
                          </h5>
                          <div className={`text-sm space-y-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <div>
                              <p className="font-medium">{translate("Circonferenza:", "Circumference:")}</p>
                              <p className="font-mono ml-2">C = 2πr</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Area:", "Area:")}</p>
                              <p className="font-mono ml-2">A = πr²</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Diametro:", "Diameter:")}</p>
                              <p className="font-mono ml-2">d = 2r</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Lunghezza dell'arco:", "Arc length:")}</p>
                              <p className="font-mono ml-2">L = r·θ</p>
                              <p className="text-xs italic">
                                {translate("(dove θ è l'angolo in radianti)", "(where θ is the angle in radians)")}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Area del settore:", "Sector area:")}</p>
                              <p className="font-mono ml-2">A = (1/2)·r²·θ</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg border ${
                          darkMode ? "bg-indigo-900/20 border-indigo-800" : "bg-indigo-50 border-indigo-200"
                        }`}
                      >
                        <h5
                          className={`font-semibold mb-3 flex items-center gap-2 ${
                            darkMode ? "text-indigo-300" : "text-indigo-800"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4M12 8h.01"></path>
                          </svg>
                          {translate("Proprietà Geometriche", "Geometric Properties")}
                        </h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <p className="font-medium mb-1">{translate("Simmetria", "Symmetry")}</p>
                            <p>
                              {translate(
                                "La circonferenza ha infiniti assi di simmetria (tutti i diametri) e simmetria rotazionale rispetto al centro.",
                                "The circle has infinite axes of symmetry (all diameters) and rotational symmetry with respect to the center.",
                              )}
                            </p>
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <p className="font-medium mb-1">
                              {translate("Proprietà isoperimetrica", "Isoperimetric property")}
                            </p>
                            <p>
                              {translate(
                                "Tra tutte le figure piane con lo stesso perimetro, la circonferenza racchiude l'area massima.",
                                "Among all plane figures with the same perimeter, the circle encloses the maximum area.",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === "ellisse" && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-violet-900/20 border-violet-800" : "bg-violet-50 border-violet-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-violet-300" : "text-violet-800"
                            }`}
                          >
                            <Target className="h-4 w-4" />
                            {translate("Equazioni", "Equations")}
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-violet-200" : "text-violet-700"}`}>
                                {translate(
                                  "Forma canonica (centro nell'origine):",
                                  "Canonical form (center at origin):",
                                )}
                              </p>
                              <p className={`font-mono text-lg ${darkMode ? "text-violet-400" : "text-violet-700"}`}>
                                x²/a² + y²/b² = 1
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate("dove a e b sono i semiassi", "where a and b are the semi-axes")}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-violet-200" : "text-violet-700"}`}>
                                {translate("Forma generale:", "General form:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-violet-400" : "text-violet-700"}`}>
                                Ax² + Cy² + Dx + Ey + F = 0
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate("dove A e C hanno lo stesso segno", "where A and C have the same sign")}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-violet-200" : "text-violet-700"}`}>
                                {translate("Forma parametrica:", "Parametric form:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-violet-400" : "text-violet-700"}`}>
                                x = h + a·cos(t), y = k + b·sin(t)
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate("per t ∈ [0, 2π]", "for t ∈ [0, 2π]")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-blue-300" : "text-blue-800"
                            }`}
                          >
                            <Calculator className="h-4 w-4" />
                            {translate("Parametri Fondamentali", "Fundamental Parameters")}
                          </h5>
                          <div className={`text-sm space-y-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <div>
                              <p className="font-medium">{translate("Semiasse maggiore:", "Semi-major axis:")}</p>
                              <p className="font-mono ml-2">a = max(a, b)</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Semiasse minore:", "Semi-minor axis:")}</p>
                              <p className="font-mono ml-2">b = min(a, b)</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Distanza focale:", "Focal distance:")}</p>
                              <p className="font-mono ml-2">c = √(a² - b²)</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Eccentricità:", "Eccentricity:")}</p>
                              <p className="font-mono ml-2">e = c/a</p>
                              <p className="text-xs italic">
                                {translate("(0 ≤ e < 1, e = 0 per un cerchio)", "(0 ≤ e < 1, e = 0 for a circle)")}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Area:", "Area:")}</p>
                              <p className="font-mono ml-2">A = πab</p>
                            </div>
                            <div>
                              <p className="font-medium">
                                {translate("Perimetro (approssimato):", "Perimeter (approximated):")}
                              </p>
                              <p className="font-mono ml-2">P ≈ 2π√((a² + b²)/2)</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-green-900/20 border-green-800" : "bg-green-50 border-green-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-green-300" : "text-green-800"
                            }`}
                          >
                            <Zap className="h-4 w-4" />
                            {translate("Proprietà Geometriche", "Geometric Properties")}
                          </h5>
                          <ul className={`text-sm space-y-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Per ogni punto P dell'ellisse, la somma delle distanze dai due fuochi è costante e uguale a 2a",
                                  "For every point P on the ellipse, the sum of distances from the two foci is constant and equal to 2a",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Due assi di simmetria: l'asse maggiore (che passa per i fuochi) e l'asse minore",
                                  "Two axes of symmetry: the major axis (passing through the foci) and the minor axis",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Proprietà riflessiva: un raggio che parte da un fuoco viene riflesso verso l'altro fuoco",
                                  "Reflective property: a ray starting from one focus is reflected toward the other focus",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "L'ellisse è una circonferenza deformata: se a = b, l'ellisse diventa una circonferenza",
                                  "The ellipse is a deformed circle: if a = b, the ellipse becomes a circle",
                                )}
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-indigo-900/20 border-indigo-800" : "bg-indigo-50 border-indigo-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-indigo-300" : "text-indigo-800"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4M12 8h.01"></path>
                            </svg>
                            {translate("Approfondimenti", "Further Insights")}
                          </h5>
                          <div className="grid md:grid-cols-1 gap-4">
                            <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              <p className="font-medium mb-1">
                                {translate("Relazione con altre coniche", "Relationship with other conics")}
                              </p>
                              <p>
                                {translate(
                                  "L'ellisse ha eccentricità 0 ≤ e < 1. Quando e = 0, diventa un cerchio; quando e si avvicina a 1, si allunga e si avvicina a una parabola.",
                                  "The ellipse has eccentricity 0 ≤ e < 1. When e = 0, it becomes a circle; when e approaches 1, it elongates and approaches a parabola.",
                                )}
                              </p>
                            </div>
                            <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              <p className="font-medium mb-1">
                                {translate("Teorema di Dandelin", "Dandelin's Theorem")}
                              </p>
                              <p>
                                {translate(
                                  "Le sfere di Dandelin dimostrano geometricamente che la sezione di un cono con un piano è un'ellisse, e i punti di tangenza delle sfere con il piano sono i fuochi dell'ellisse.",
                                  "Dandelin spheres geometrically demonstrate that the section of a cone with a plane is an ellipse, and the points of tangency of the spheres with the plane are the foci of the ellipse.",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === "iperbole" && (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-rose-900/20 border-rose-800" : "bg-rose-50 border-rose-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-rose-300" : "text-rose-800"
                            }`}
                          >
                            <Target className="h-4 w-4" />
                            {translate("Equazioni", "Equations")}
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-rose-200" : "text-rose-700"}`}>
                                {translate(
                                  "Forma canonica (asse trasverso orizzontale):",
                                  "Canonical form (horizontal transverse axis):",
                                )}
                              </p>
                              <p className={`font-mono text-lg ${darkMode ? "text-rose-400" : "text-rose-700"}`}>
                                x²/a² - y²/b² = 1
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-rose-200" : "text-rose-700"}`}>
                                {translate(
                                  "Forma canonica (asse trasverso verticale):",
                                  "Canonical form (vertical transverse axis):",
                                )}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-rose-400" : "text-rose-700"}`}>
                                y²/a² - x²/b² = 1
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-rose-200" : "text-rose-700"}`}>
                                {translate("Forma generale:", "General form:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-rose-400" : "text-rose-700"}`}>
                                Ax² + Cy² + Dx + Ey + F = 0
                              </p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate("dove A e C hanno segni opposti", "where A and C have opposite signs")}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? "text-rose-200" : "text-rose-700"}`}>
                                {translate("Iperbole equilatera:", "Equilateral hyperbola:")}
                              </p>
                              <p className={`font-mono ${darkMode ? "text-rose-400" : "text-rose-700"}`}>xy = k</p>
                              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {translate(
                                  "(caso particolare con asintoti perpendicolari)",
                                  "(special case with perpendicular asymptotes)",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-blue-300" : "text-blue-800"
                            }`}
                          >
                            <Calculator className="h-4 w-4" />
                            {translate("Parametri Fondamentali", "Fundamental Parameters")}
                          </h5>
                          <div className={`text-sm space-y-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <div>
                              <p className="font-medium">{translate("Semiasse trasverso:", "Transverse semi-axis:")}</p>
                              <p className="font-mono ml-2">a</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Semiasse coniugato:", "Conjugate semi-axis:")}</p>
                              <p className="font-mono ml-2">b</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Distanza focale:", "Focal distance:")}</p>
                              <p className="font-mono ml-2">c = √(a² + b²)</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Eccentricità:", "Eccentricity:")}</p>
                              <p className="font-mono ml-2">e = c/a</p>
                              <p className="text-xs italic">{translate("(e > 1, sempre)", "(e > 1, always)")}</p>
                            </div>
                            <div>
                              <p className="font-medium">
                                {translate("Equazioni degli asintoti:", "Asymptote equations:")}
                              </p>
                              <p className="font-mono ml-2">y = ±(b/a)x</p>
                            </div>
                            <div>
                              <p className="font-medium">{translate("Vertici:", "Vertices:")}</p>
                              <p className="font-mono ml-2">V₁ = (a, 0), V₂ = (-a, 0)</p>
                              <p className="text-xs italic">
                                {translate(
                                  "(per iperbole con asse trasverso orizzontale)",
                                  "(for hyperbola with horizontal transverse axis)",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-purple-900/20 border-purple-800" : "bg-purple-50 border-purple-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-purple-300" : "text-purple-800"
                            }`}
                          >
                            <Zap className="h-4 w-4" />
                            {translate("Proprietà Geometriche", "Geometric Properties")}
                          </h5>
                          <ul className={`text-sm space-y-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Per ogni punto P dell'iperbole, la differenza delle distanze dai due fuochi è costante e uguale a ±2a",
                                  "For every point P on the hyperbola, the difference of distances from the two foci is constant and equal to ±2a",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Due assi di simmetria: l'asse trasverso (che passa per i fuochi) e l'asse coniugato",
                                  "Two axes of symmetry: the transverse axis (passing through the foci) and the conjugate axis",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Due rami distinti che si estendono all'infinito",
                                  "Two distinct branches extending to infinity",
                                )}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 mt-1">•</span>
                              <span>
                                {translate(
                                  "Proprietà riflessiva: un raggio che parte da un fuoco viene riflesso come se provenisse dall'altro fuoco",
                                  "Reflective property: a ray starting from one focus is reflected as if coming from the other focus",
                                )}
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div
                          className={`p-4 rounded-lg border ${
                            darkMode ? "bg-indigo-900/20 border-indigo-800" : "bg-indigo-50 border-indigo-200"
                          }`}
                        >
                          <h5
                            className={`font-semibold mb-3 flex items-center gap-2 ${
                              darkMode ? "text-indigo-300" : "text-indigo-800"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 16v-4M12 8h.01"></path>
                            </svg>
                            {translate("Approfondimenti", "Further Insights")}
                          </h5>
                          <div className="grid md:grid-cols-1 gap-4">
                            <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              <p className="font-medium mb-1">{translate("Asintoti", "Asymptotes")}</p>
                              <p>
                                {translate(
                                  "Gli asintoti sono rette a cui i rami dell'iperbole si avvicinano indefinitamente senza mai toccarle. Rappresentano il comportamento della curva all'infinito.",
                                  "Asymptotes are lines that the branches of the hyperbola approach indefinitely without ever touching them. They represent the behavior of the curve at infinity.",
                                )}
                              </p>
                            </div>
                            <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              <p className="font-medium mb-1">
                                {translate("Iperbole equilatera", "Equilateral hyperbola")}
                              </p>
                              <p>
                                {translate(
                                  "Un'iperbole equilatera ha a = b, quindi i suoi asintoti sono perpendicolari. La sua equazione può essere scritta come xy = k. È particolarmente importante in fisica e ingegneria.",
                                  "An equilateral hyperbola has a = b, so its asymptotes are perpendicular. Its equation can be written as xy = k. It is particularly important in physics and engineering.",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Pannello Controlli e Grafico */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pannello Controlli */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {translate("Parametri Interattivi", "Interactive Parameters")}
                  </h4>
                  <Button variant="outline" size="sm" onClick={resetParameters}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {translate("Reset", "Reset")}
                  </Button>
                </div>

                <div
                  className={`p-4 rounded-lg border space-y-6 ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  {Object.entries(section.parameters).map(([key, param]) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {language === "it" ? param.label : param.labelEn}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={parameters[key]?.toFixed(1) || param.default.toFixed(1)}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            className={`w-20 h-8 text-xs text-center ${
                              darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                            }`}
                          />
                        </div>
                      </div>
                      <Slider
                        value={[parameters[key] || param.default]}
                        onValueChange={(value) => updateParameter(key, value[0])}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        className="w-full"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} cursor-help`}>
                              {language === "it" ? param.description : param.descriptionEn}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{language === "it" ? param.description : param.descriptionEn}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>

                {/* Equazione Corrente */}
                <div
                  className={`p-4 rounded-lg border ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <h5 className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>
                    {translate("Equazione Corrente", "Current Equation")}
                  </h5>
                  <code
                    className={`block p-3 rounded text-sm font-mono ${
                      darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}
                    style={{ color: section.accentColor }}
                  >
                    {equation}
                  </code>
                </div>
              </div>

              {/* Grafico */}
              <div className="lg:col-span-2">
                <div
                  className={`rounded-lg border shadow-sm overflow-hidden ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="relative">
                    {!fullscreen && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList
                        className={`w-full justify-start p-0 bg-transparent border-b ${
                          darkMode ? "border-gray-600" : "border-gray-200"
                        }`}
                      >
                        <TabsTrigger
                          value="grafico"
                          className={`px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:shadow-none rounded-none transition-colors duration-300 ${
                            darkMode
                              ? "text-gray-300 hover:text-white data-[state=active]:text-[color:var(--accent-color)] hover:bg-gray-700/50 data-[state=active]:bg-gray-700"
                              : "text-gray-600 hover:text-gray-900 data-[state=active]:text-[color:var(--accent-color)] hover:bg-gray-50 data-[state=active]:bg-gray-100"
                          }`}
                          style={
                            {
                              borderBottomColor: activeTab === "grafico" ? section.accentColor : "transparent",
                              "--accent-color": section.accentColor,
                            } as React.CSSProperties
                          }
                        >
                          {translate("Grafico", "Graph")}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="grafico" className="m-0">
                        <div
                          ref={plotRef}
                          className={`min-h-[500px] flex items-center justify-center p-4 ${
                            darkMode ? "bg-gray-800" : "bg-white"
                          }`}
                        >
                          {plotData ? (
                            <Plot
                              data={plotData.data}
                              layout={plotData.layout}
                              style={{ width: "100%", height: "500px" }}
                              config={{
                                responsive: true,
                                displayModeBar: false,
                                staticPlot: false,
                              }}
                            />
                          ) : (
                            <div className="text-center text-gray-500 p-8">
                              <div className="text-4xl mb-4">📊</div>
                              <p className="mb-2">{translate("Caricamento grafico...", "Loading graph...")}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            </div>

            {/* Parametri calcolati */}
            {calculatedInfo.length > 0 && (
              <div
                className={`mt-6 rounded-lg border shadow-sm overflow-hidden ${
                  darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
              >
                <div
                  className={`p-4 border-b flex justify-between items-center ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-700"} flex items-center gap-2`}>
                    <Calculator className="h-4 w-4 text-gray-500" />
                    {translate("Proprietà Calcolate", "Calculated Properties")}
                  </h4>
                  <Badge variant="outline" className="text-xs font-normal">
                    {calculatedInfo.length} {translate("proprietà", "properties")}
                  </Badge>
                </div>
                <ScrollArea className="h-[200px]">
                  <div className="p-4 space-y-3">
                    {calculatedInfo.map((param, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  {param.name}:
                                </span>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-medium">{param.description}</p>
                              {param.tooltip && <p className="text-sm mt-1 opacity-90">{param.tooltip}</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className="font-mono text-sm">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ConicheInterattive() {
  const [darkMode, setDarkMode] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [language, setLanguage] = useState("it")

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Funzione di traduzione
  const translate = (it: string, en: string) => {
    return language === "it" ? it : en
  }

  // Oggetto con tutte le traduzioni
  const translations = {
    // Header e navigazione
    title: translate("Coniche Interattive", "Interactive Conics"),
    darkMode: translate("Modalità Scura", "Dark Mode"),
    language: translate("Lingua", "Language"),

    // Hero section
    heroTitle1: translate("Esplora le ", "Explore "),
    heroTitle2: translate("Sezioni Coniche", "Conic Sections"),
    heroDescription: translate(
      "Modifica i parametri in tempo reale e osserva come cambiano le proprietà geometriche delle coniche attraverso grafici interattivi.",
      "Modify parameters in real-time and observe how the geometric properties of conics change through interactive graphs.",
    ),

    // Sezione teoria generale
    introTitle: translate("Le Sezioni Coniche: Introduzione", "Conic Sections: Introduction"),
    introDescription: translate(
      "Le sezioni coniche sono curve ottenute dall'intersezione di un piano con un cono circolare retto. Furono studiate per la prima volta dai matematici greci, in particolare da Apollonio di Perga (III secolo a.C.), che diede loro i nomi che usiamo ancora oggi.",
      "Conic sections are curves obtained from the intersection of a plane with a right circular cone. They were first studied by Greek mathematicians, particularly by Apollonius of Perga (3rd century BC), who gave them the names we still use today.",
    ),

    // Come si formano
    howFormedTitle: translate("Come si formano:", "How they are formed:"),
    circleFormation: translate(
      "Circonferenza: Piano perpendicolare all'asse del cono",
      "Circle: Plane perpendicular to the cone's axis",
    ),
    ellipseFormation: translate(
      "Ellisse: Piano obliquo che interseca una falda",
      "Ellipse: Oblique plane intersecting one nappe",
    ),
    parabolaFormation: translate(
      "Parabola: Piano parallelo a una generatrice",
      "Parabola: Plane parallel to a generator",
    ),
    hyperbolaFormation: translate(
      "Iperbole: Piano che interseca entrambe le falde",
      "Hyperbola: Plane intersecting both nappes",
    ),

    // Proprietà comuni
    commonPropsTitle: translate("Proprietà comuni:", "Common properties:"),
    prop1: translate("Sono curve algebriche di secondo grado", "They are second-degree algebraic curves"),
    prop2: translate("Hanno equazioni polinomiali di grado 2", "They have degree-2 polynomial equations"),
    prop3: translate("Possiedono proprietà focali uniche", "They possess unique focal properties"),
    prop4: translate("Sono invarianti per trasformazioni affini", "They are invariant under affine transformations"),

    // Footer
    footerDescription: translate(
      "Un strumento educativo per esplorare le sezioni coniche attraverso la matematica interattiva.",
      "An educational tool to explore conic sections through interactive mathematics.",
    ),
    footerAudience1: translate("Perfetto per studenti delle scuole superiori", "Perfect for high school students"),
    footerAudience2: translate("Appassionati di matematica", "Math enthusiasts"),
    footerAudience3: translate("Insegnanti", "Teachers"),

    // Progetto scolastico
    projectTitle: translate("Il Capolavoro", "The Masterpiece"),
    projectDescription: translate(
      "Questo progetto rappresenta il mio capolavoro scolastico, un'applicazione web interattiva per l'esplorazione delle sezioni coniche.",
      "This project represents my school masterpiece, an interactive web application for exploring conic sections.",
    ),
    authorCredit: translate(
      "Sviluppato da Enrico Fasoli come progetto finale del percorso di studi del terzo anno.",
      "Developed by Enrico Fasoli as a final project for the course of study of the third year.",
    ),
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowMenu(false)
      }}
    >
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-50 text-gray-900"
        }`}
      >
        {/* Header fisso */}
        <header
          className={`fixed top-0 left-0 right-0 backdrop-blur-md shadow-sm z-50 border-b transition-colors duration-300 ${
            darkMode ? "bg-gray-800/95 border-gray-700" : "bg-white/95 border-gray-100"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col gap-1">
                    <div className="w-4 h-0.5 bg-white rounded"></div>
                    <div className="w-4 h-0.5 bg-white rounded"></div>
                    <div className="w-4 h-0.5 bg-white rounded"></div>
                  </div>
                </button>
                <h1
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {translations.title}
                </h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                {conicSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`transition-colors font-medium px-3 py-2 rounded-md ${
                      darkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-700"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {language === "it" ? section.title : section.titleEn}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            className={`fixed top-20 left-4 rounded-lg shadow-lg border z-50 min-w-[200px] transition-colors duration-300 ${
              darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
            }`}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {translations.darkMode}
                </span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                    darkMode ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      darkMode ? "translate-x-5" : "translate-x-1"
                    }`}
                  ></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {translations.language}
                </span>
                <button
                  onClick={() => setLanguage(language === "it" ? "en" : "it")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {language === "it" ? "English" : "Italiano"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2
                className={`text-6xl font-bold mb-6 leading-tight transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {translations.heroTitle1}
                <span className="text-gradient">{translations.heroTitle2}</span>
              </h2>
              <p
                className={`text-xl mb-8 leading-relaxed max-w-3xl mx-auto transition-colors duration-300 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {translations.heroDescription}
              </p>
            </div>

            {/* Sezione Teoria Generale */}
            <div
              className={`rounded-xl shadow-elegant-lg p-8 mb-12 text-left border transition-colors duration-300 ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <h3
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {translations.introTitle}
                </h3>
              </div>

              <div className="space-y-6">
                <p
                  className={`leading-relaxed text-lg transition-colors duration-300 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {translations.introDescription}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div
                    className={`p-6 rounded-lg border transition-colors duration-300 ${
                      darkMode
                        ? "bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-blue-800"
                        : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                    }`}
                  >
                    <h4
                      className={`font-semibold text-lg mb-3 flex items-center gap-2 transition-colors duration-300 ${
                        darkMode ? "text-blue-300" : "text-indigo-800"
                      }`}
                    >
                      <ArrowRight className="h-5 w-5" />
                      {translations.howFormedTitle}
                    </h4>
                    <ul
                      className={`space-y-2 text-sm transition-colors duration-300 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <li>
                        <strong>{translate("Circonferenza:", "Circle:")}</strong>{" "}
                        {translations.circleFormation.split(": ")[1]}
                      </li>
                      <li>
                        <strong>{translate("Ellisse:", "Ellipse:")}</strong>{" "}
                        {translations.ellipseFormation.split(": ")[1]}
                      </li>
                      <li>
                        <strong>{translate("Parabola:", "Parabola:")}</strong>{" "}
                        {translations.parabolaFormation.split(": ")[1]}
                      </li>
                      <li>
                        <strong>{translate("Iperbole:", "Hyperbola:")}</strong>{" "}
                        {translations.hyperbolaFormation.split(": ")[1]}
                      </li>
                    </ul>
                  </div>

                  <div
                    className={`p-6 rounded-lg border transition-colors duration-300 ${
                      darkMode
                        ? "bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-800"
                        : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
                    }`}
                  >
                    <h4
                      className={`font-semibold text-lg mb-3 flex items-center gap-2 transition-colors duration-300 ${
                        darkMode ? "text-purple-300" : "text-purple-800"
                      }`}
                    >
                      <Check className="h-5 w-5" />
                      {translations.commonPropsTitle}
                    </h4>
                    <ul
                      className={`space-y-2 text-sm transition-colors duration-300 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <li>{translations.prop1}</li>
                      <li>{translations.prop2}</li>
                      <li>{translations.prop3}</li>
                      <li>{translations.prop4}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {conicSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border group card-hover ${
                    darkMode
                      ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                      : "bg-white border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    {section.icon}
                  </div>
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      darkMode ? "text-gray-300 group-hover:text-white" : "text-gray-700 group-hover:text-gray-900"
                    }`}
                  >
                    {language === "it" ? section.title : section.titleEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Sezioni delle coniche */}
        {conicSections.map((section) => (
          <section key={section.id} id={section.id}>
            <ConicSectionComponent section={section} darkMode={darkMode} language={language} />
          </section>
        ))}

        {/* Footer */}
        <footer
          className={`py-12 px-4 transition-colors duration-300 ${
            darkMode
              ? "bg-gradient-to-r from-gray-900 to-black text-white"
              : "bg-gradient-to-r from-gray-800 to-gray-900 text-white"
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h3 className="text-2xl font-bold">{translations.title}</h3>
            </div>
            <p
              className={`mb-6 text-lg transition-colors duration-300 ${darkMode ? "text-gray-300" : "text-gray-300"}`}
            >
              {translations.footerDescription}
            </p>
            <div
              className={`flex justify-center gap-6 text-sm transition-colors duration-300 mb-8 ${
                darkMode ? "text-gray-400" : "text-gray-400"
              }`}
            >
              <span>{translations.footerAudience1}</span>
              <span>•</span>
              <span>{translations.footerAudience2}</span>
              <span>•</span>
              <span>{translations.footerAudience3}</span>
            </div>

            {/* Sezione Progetto Scolastico */}
            <div className="border-t border-gray-600 pt-8">
              <h4 className="text-xl font-bold mb-4 text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {translations.projectTitle}
              </h4>
              <p className="text-gray-300 mb-2">{translations.projectDescription}</p>
              <p className="text-gray-400 text-sm">{translations.authorCredit}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ConicheInterattive
