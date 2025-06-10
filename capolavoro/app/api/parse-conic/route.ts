import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const ConicSchema = z.object({
  type: z.enum(["parabola", "circonferenza", "ellisse", "iperbole", "unknown"]),
  confidence: z.number().min(0).max(1),
  standardForm: z.string(),
  parameters: z.object({
    center: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    radius: z.number().optional(),
    semiMajorAxis: z.number().optional(),
    semiMinorAxis: z.number().optional(),
    focus1: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    focus2: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    vertex: z
      .object({
        x: z.number(),
        y: z.number(),
      })
      .optional(),
    directrix: z.string().optional(),
    eccentricity: z.number().optional(),
    coefficients: z
      .object({
        a: z.number().optional(),
        b: z.number().optional(),
        c: z.number().optional(),
        d: z.number().optional(),
        e: z.number().optional(),
        f: z.number().optional(),
      })
      .optional(),
  }),
  explanation: z.string(),
  graphingPoints: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
      }),
    )
    .optional(),
})

// Enhanced fallback function for manual parsing when AI is not available
function fallbackConicParser(equation: string) {
  // Normalize the equation first
  let cleanEquation = equation.trim().toLowerCase()

  // Replace spaces around operators to standardize
  cleanEquation = cleanEquation.replace(/\s*([+\-=*/^()])\s*/g, "$1")

  // Remove all spaces
  cleanEquation = cleanEquation.replace(/\s+/g, "")

  console.log("Fallback parser analyzing:", cleanEquation)

  // Helper function to extract numbers from regex matches with improved handling
  const extractNumber = (match: string | undefined, defaultValue = 1): number => {
    if (!match) return defaultValue

    // Handle cases like "+x" or "-x" (implicit 1)
    if (match === "+" || match === "") return 1
    if (match === "-") return -1

    // Remove non-numeric characters except decimal point and minus sign
    const cleaned = match.replace(/[^0-9.-]/g, "")
    if (cleaned === "" || cleaned === "+" || cleaned === "-") return defaultValue

    const num = Number.parseFloat(cleaned)
    return isNaN(num) ? defaultValue : num
  }

  // Parse general form: Ax² + By² + Cxy + Dx + Ey + F = 0
  // This is a more comprehensive approach that can handle all conic sections
  function parseGeneralForm(eq: string) {
    // Move everything to the left side of the equation
    let leftSide = eq
    if (eq.includes("=")) {
      const parts = eq.split("=")
      if (parts.length !== 2) return null

      // Move right side to left with opposite sign
      leftSide = parts[0] + "-(" + parts[1] + ")"
    }

    // Normalize to standard form
    leftSide = leftSide.replace(/--/g, "+").replace(/\+-/g, "-").replace(/-\+/g, "-")

    // Extract coefficients using regex
    const coefficients = {
      A: 0, // x²
      B: 0, // y²
      C: 0, // xy
      D: 0, // x
      E: 0, // y
      F: 0, // constant
    }

    // Match x² terms
    const x2Regex = /([+-]?\d*\.?\d*)x\^2/g
    let match
    while ((match = x2Regex.exec(leftSide)) !== null) {
      coefficients.A += extractNumber(match[1])
    }

    // Match y² terms
    const y2Regex = /([+-]?\d*\.?\d*)y\^2/g
    while ((match = y2Regex.exec(leftSide)) !== null) {
      coefficients.B += extractNumber(match[1])
    }

    // Match xy terms
    const xyRegex = /([+-]?\d*\.?\d*)xy/g
    while ((match = xyRegex.exec(leftSide)) !== null) {
      coefficients.C += extractNumber(match[1])
    }

    // Match x terms
    const xRegex = /([+-]?\d*\.?\d*)x(?!\^|y)/g
    while ((match = xRegex.exec(leftSide)) !== null) {
      coefficients.D += extractNumber(match[1])
    }

    // Match y terms
    const yRegex = /([+-]?\d*\.?\d*)y(?!\^)/g
    while ((match = yRegex.exec(leftSide)) !== null) {
      coefficients.E += extractNumber(match[1])
    }

    // Match constant terms
    const constRegex = /([+-]?\d+\.?\d*)(?![xy])/g
    while ((match = constRegex.exec(leftSide)) !== null) {
      // Make sure it's not part of a coefficient
      const prevChar = leftSide.charAt(match.index - 1)
      if (prevChar !== "^" && prevChar !== "*") {
        coefficients.F += Number(match[1])
      }
    }

    return coefficients
  }

  // Identify the type of conic section based on coefficients
  function identifyConicType(coeffs: { A: number; B: number; C: number; D: number; E: number; F: number }) {
    // Discriminant for conic sections
    const discriminant = coeffs.C * coeffs.C - 4 * coeffs.A * coeffs.B

    if (Math.abs(discriminant) < 1e-10) {
      // Discriminant ≈ 0
      if (coeffs.A === coeffs.B && coeffs.A !== 0) {
        return "circonferenza" // Circle
      } else if (coeffs.A !== 0 || coeffs.B !== 0) {
        return "parabola" // Parabola
      }
    } else if (discriminant < 0) {
      return "ellisse" // Ellipse
    } else if (discriminant > 0) {
      return "iperbole" // Hyperbola
    }

    // Default case - try to determine from the form
    if (coeffs.A !== 0 && coeffs.B === 0) return "parabola"
    if (coeffs.A === 0 && coeffs.B !== 0) return "parabola"
    if (coeffs.A === coeffs.B && coeffs.A !== 0) return "circonferenza"

    return "unknown"
  }

  // Try to parse the equation using the general form approach
  const coeffs = parseGeneralForm(cleanEquation)
  if (coeffs) {
    const conicType = identifyConicType(coeffs)

    // Calculate parameters based on the conic type
    if (conicType === "circonferenza") {
      // For a circle: x² + y² + Dx + Ey + F = 0
      // Center: (-D/2, -E/2), Radius: sqrt((D²+E²)/4 - F)
      const h = -coeffs.D / (2 * coeffs.A)
      const k = -coeffs.E / (2 * coeffs.B)
      const radiusSquared = (coeffs.D * coeffs.D + coeffs.E * coeffs.E) / (4 * coeffs.A) - coeffs.F / coeffs.A

      if (radiusSquared > 0) {
        const radius = Math.sqrt(radiusSquared)
        return {
          type: "circonferenza" as const,
          confidence: 0.85,
          standardForm: `(x${h >= 0 ? "-" : "+"}${Math.abs(h).toFixed(2)})² + (y${k >= 0 ? "-" : "+"}${Math.abs(k).toFixed(2)})² = ${radius.toFixed(2)}²`,
          parameters: {
            center: { x: h, y: k },
            radius: radius,
          },
          explanation: `Riconosciuta come circonferenza con centro (${h.toFixed(2)}, ${k.toFixed(2)}) e raggio ${radius.toFixed(2)}`,
        }
      }
    } else if (conicType === "ellisse") {
      // For an ellipse centered at origin: Ax² + By² = C
      // or (x²/a²) + (y²/b²) = 1 where a² = C/A, b² = C/B
      if (coeffs.C === 0 && coeffs.D === 0 && coeffs.E === 0 && coeffs.A > 0 && coeffs.B > 0) {
        const C = -coeffs.F
        if (C > 0) {
          const a = Math.sqrt(C / coeffs.A)
          const b = Math.sqrt(C / coeffs.B)
          const c = Math.sqrt(Math.abs(a * a - b * b))
          const e = c / Math.max(a, b)

          return {
            type: "ellisse" as const,
            confidence: 0.85,
            standardForm: `${coeffs.A}x² + ${coeffs.B}y² = ${C}`,
            parameters: {
              center: { x: 0, y: 0 },
              semiMajorAxis: Math.max(a, b),
              semiMinorAxis: Math.min(a, b),
              eccentricity: e,
              focus1: { x: a > b ? c : 0, y: a > b ? 0 : c },
              focus2: { x: a > b ? -c : 0, y: a > b ? 0 : -c },
            },
            explanation: `Riconosciuta come ellisse con semiassi ${a.toFixed(2)} e ${b.toFixed(2)}`,
          }
        }
      }
    } else if (conicType === "iperbole") {
      // For a hyperbola centered at origin: Ax² - By² = C or -Ax² + By² = C
      if (
        coeffs.C === 0 &&
        coeffs.D === 0 &&
        coeffs.E === 0 &&
        ((coeffs.A > 0 && coeffs.B < 0) || (coeffs.A < 0 && coeffs.B > 0))
      ) {
        const C = -coeffs.F
        if (C !== 0) {
          // Ensure A is positive for standard form
          let a, b
          if (coeffs.A > 0) {
            a = Math.sqrt(C / coeffs.A)
            b = Math.sqrt(-C / coeffs.B)
          } else {
            a = Math.sqrt(C / coeffs.B)
            b = Math.sqrt(-C / coeffs.A)
          }

          const c = Math.sqrt(a * a + b * b)
          const e = c / a

          return {
            type: "iperbole" as const,
            confidence: 0.85,
            standardForm: coeffs.A > 0 ? `x²/${a * a} - y²/${b * b} = 1` : `y²/${a * a} - x²/${b * b} = 1`,
            parameters: {
              center: { x: 0, y: 0 },
              semiMajorAxis: a,
              semiMinorAxis: b,
              eccentricity: e,
              focus1: coeffs.A > 0 ? { x: c, y: 0 } : { x: 0, y: c },
              focus2: coeffs.A > 0 ? { x: -c, y: 0 } : { x: 0, y: -c },
            },
            explanation: `Riconosciuta come iperbole con semiassi ${a.toFixed(2)} e ${b.toFixed(2)}`,
          }
        }
      }
    } else if (conicType === "parabola") {
      // For a parabola: y = ax² + bx + c
      if (coeffs.B === 0 && coeffs.C === 0 && coeffs.A !== 0) {
        const a = coeffs.A
        const b = coeffs.D
        const c = coeffs.F

        // Calculate vertex: x = -b/(2a), y = c - b²/(4a)
        const xVertex = -b / (2 * a)
        const yVertex = -c - (b * b) / (4 * a)

        return {
          type: "parabola" as const,
          confidence: 0.85,
          standardForm: `y = ${a}x² ${b >= 0 ? "+" : ""}${b}x ${c >= 0 ? "+" : ""}${c}`,
          parameters: {
            coefficients: { a, b, c },
            vertex: { x: xVertex, y: yVertex },
            focus1: { x: xVertex, y: yVertex + 1 / (4 * a) },
            directrix: `y = ${(yVertex - 1 / (4 * a)).toFixed(4)}`,
          },
          explanation: `Riconosciuta come parabola con vertice (${xVertex.toFixed(2)}, ${yVertex.toFixed(2)})`,
        }
      }
    }
  }

  // 1. CIRCONFERENZA - Various forms
  // x^2 + y^2 = r^2
  let circleMatch = cleanEquation.match(/x\^?2\s*\+\s*y\^?2\s*=\s*(\d+)/)
  if (circleMatch) {
    const radiusSquared = Number.parseFloat(circleMatch[1])
    const radius = Math.sqrt(radiusSquared)
    return {
      type: "circonferenza" as const,
      confidence: 0.9,
      standardForm: `x² + y² = ${radiusSquared}`,
      parameters: {
        center: { x: 0, y: 0 },
        radius: radius,
      },
      explanation: `Riconosciuta come circonferenza con centro nell'origine e raggio ${radius.toFixed(2)}`,
    }
  }

  // (x-h)^2 + (y-k)^2 = r^2
  circleMatch = cleanEquation.match(/$$x([+-]\d+)$$\^?2\s*\+\s*$$y([+-]\d+)$$\^?2\s*=\s*(\d+)/)
  if (circleMatch) {
    const h = -Number.parseFloat(circleMatch[1])
    const k = -Number.parseFloat(circleMatch[2])
    const radiusSquared = Number.parseFloat(circleMatch[3])
    const radius = Math.sqrt(radiusSquared)
    return {
      type: "circonferenza" as const,
      confidence: 0.9,
      standardForm: `(x${h >= 0 ? "+" : ""}${h})² + (y${k >= 0 ? "+" : ""}${k})² = ${radiusSquared}`,
      parameters: {
        center: { x: h, y: k },
        radius: radius,
      },
      explanation: `Riconosciuta come circonferenza con centro (${h}, ${k}) e raggio ${radius.toFixed(2)}`,
    }
  }

  // General form: x^2 + y^2 + Dx + Ey + F = 0
  circleMatch = cleanEquation.match(/x\^?2\s*\+\s*y\^?2\s*([+-]\d*)\*?x\s*([+-]\d*)\*?y\s*([+-]\d+)\s*=\s*0/)
  if (circleMatch) {
    const D = extractNumber(circleMatch[1], 0)
    const E = extractNumber(circleMatch[2], 0)
    const F = extractNumber(circleMatch[3], 0)
    const h = -D / 2
    const k = -E / 2
    const radiusSquared = (D * D + E * E) / 4 - F
    if (radiusSquared > 0) {
      const radius = Math.sqrt(radiusSquared)
      return {
        type: "circonferenza" as const,
        confidence: 0.8,
        standardForm: `x² + y² ${D >= 0 ? "+" : ""}${D}x ${E >= 0 ? "+" : ""}${E}y ${F >= 0 ? "+" : ""}${F} = 0`,
        parameters: {
          center: { x: h, y: k },
          radius: radius,
        },
        explanation: `Riconosciuta come circonferenza in forma generale con centro (${h.toFixed(2)}, ${k.toFixed(2)}) e raggio ${radius.toFixed(2)}`,
      }
    }
  }

  // 2. PARABOLA - Enhanced parsing for y = ax² + bx + c
  function parseParabola(equation: string) {
    // Remove spaces and normalize
    const eq = equation.replace(/\s+/g, "").toLowerCase()

    // Handle different forms of parabola equations
    let a = 0,
      b = 0,
      c = 0

    // Case 1: y = ax² + bx + c format
    const standardMatch = eq.match(/y\s*=\s*(.+)/)
    if (standardMatch) {
      const rightSide = standardMatch[1]

      // Extract x² coefficient (a) - improved to handle decimals and negatives
      const x2Matches = rightSide.match(/([+-]?\d*\.?\d*)\*?x\^?2/g)
      if (x2Matches) {
        x2Matches.forEach((match) => {
          const coeffMatch = match.match(/([+-]?\d*\.?\d*)\*?x\^?2/)
          if (coeffMatch) {
            let coeff = coeffMatch[1]
            if (coeff === "" || coeff === "+") coeff = "1"
            if (coeff === "-") coeff = "-1"
            // Handle decimal coefficients like -0.5
            const numCoeff = Number.parseFloat(coeff)
            if (!isNaN(numCoeff)) {
              a += numCoeff
            } else {
              a += 1 // fallback
            }
          }
        })
      }

      // Extract x coefficient (b) - improved to handle decimals and negatives
      const xMatches = rightSide.match(/([+-]?\d*\.?\d*)\*?x(?!\^)/g)
      if (xMatches) {
        xMatches.forEach((match) => {
          const coeffMatch = match.match(/([+-]?\d*\.?\d*)\*?x(?!\^)/)
          if (coeffMatch) {
            let coeff = coeffMatch[1]
            if (coeff === "" || coeff === "+") coeff = "1"
            if (coeff === "-") coeff = "-1"
            const numCoeff = Number.parseFloat(coeff)
            if (!isNaN(numCoeff)) {
              b += numCoeff
            } else {
              b += 1 // fallback
            }
          }
        })
      }

      // Extract constant terms (c) - improved to handle decimals and negatives
      const constMatches = rightSide.match(/([+-]?\d+\.?\d*)(?![xy^])/g)
      if (constMatches) {
        constMatches.forEach((match) => {
          // Make sure it's not part of a coefficient for x or x²
          const fullMatch = match.trim()
          if (!/[xy]/.test(fullMatch)) {
            const numConst = Number.parseFloat(fullMatch)
            if (!isNaN(numConst)) {
              c += numConst
            }
          }
        })
      }

      // Calculate vertex: x = -b/(2a), y = c - b²/(4a)
      if (a !== 0) {
        const xVertex = -b / (2 * a)
        const yVertex = a * xVertex * xVertex + b * xVertex + c

        // Calculate focus and directrix
        const p = 1 / (4 * a) // focal parameter
        const focusX = xVertex
        const focusY = yVertex + p
        const directrix = `y = ${(yVertex - p).toFixed(4)}`

        return {
          type: "parabola" as const,
          confidence: 0.95,
          standardForm: `y = ${a}x² ${b >= 0 ? "+" : ""}${b}x ${c >= 0 ? "+" : ""}${c}`,
          parameters: {
            coefficients: { a, b, c },
            vertex: { x: xVertex, y: yVertex },
            focus1: { x: focusX, y: focusY },
            directrix: directrix,
          },
          explanation: `Riconosciuta come parabola con a=${a}, b=${b}, c=${c}. Vertice: (${xVertex.toFixed(2)}, ${yVertex.toFixed(2)})`,
        }
      }
    }

    // Case 2: Handle implicit y format like "-0.5x^2 + 4" (without y=)
    if (!eq.includes("y=") && (eq.includes("x^2") || eq.includes("x²"))) {
      // Assume it's y = [expression]
      const expression = eq

      // Extract x² coefficient (a)
      const x2Matches = expression.match(/([+-]?\d*\.?\d*)\*?x\^?2/g)
      if (x2Matches) {
        x2Matches.forEach((match) => {
          const coeffMatch = match.match(/([+-]?\d*\.?\d*)\*?x\^?2/)
          if (coeffMatch) {
            let coeff = coeffMatch[1]
            if (coeff === "" || coeff === "+") coeff = "1"
            if (coeff === "-") coeff = "-1"
            const numCoeff = Number.parseFloat(coeff)
            if (!isNaN(numCoeff)) {
              a += numCoeff
            } else {
              a += 1
            }
          }
        })
      }

      // Extract x coefficient (b)
      const xMatches = expression.match(/([+-]?\d*\.?\d*)\*?x(?!\^)/g)
      if (xMatches) {
        xMatches.forEach((match) => {
          const coeffMatch = match.match(/([+-]?\d*\.?\d*)\*?x(?!\^)/)
          if (coeffMatch) {
            let coeff = coeffMatch[1]
            if (coeff === "" || coeff === "+") coeff = "1"
            if (coeff === "-") coeff = "-1"
            const numCoeff = Number.parseFloat(coeff)
            if (!isNaN(numCoeff)) {
              b += numCoeff
            } else {
              b += 1
            }
          }
        })
      }

      // Extract constant terms (c)
      const constMatches = expression.match(/([+-]?\d+\.?\d*)(?![xy^])/g)
      if (constMatches) {
        constMatches.forEach((match) => {
          const fullMatch = match.trim()
          if (!/[xy]/.test(fullMatch)) {
            const numConst = Number.parseFloat(fullMatch)
            if (!isNaN(numConst)) {
              c += numConst
            }
          }
        })
      }

      if (a !== 0) {
        const xVertex = -b / (2 * a)
        const yVertex = a * xVertex * xVertex + b * xVertex + c

        const p = 1 / (4 * a)
        const focusX = xVertex
        const focusY = yVertex + p
        const directrix = `y = ${(yVertex - p).toFixed(4)}`

        return {
          type: "parabola" as const,
          confidence: 0.95,
          standardForm: `y = ${a}x² ${b >= 0 ? "+" : ""}${b}x ${c >= 0 ? "+" : ""}${c}`,
          parameters: {
            coefficients: { a, b, c },
            vertex: { x: xVertex, y: yVertex },
            focus1: { x: focusX, y: focusY },
            directrix: directrix,
          },
          explanation: `Riconosciuta come parabola con a=${a}, b=${b}, c=${c}. Vertice: (${xVertex.toFixed(2)}, ${yVertex.toFixed(2)})`,
        }
      }
    }
    return null
  }

  // Replace the existing parabola parsing section with:
  const parabolaResult = parseParabola(cleanEquation)
  if (parabolaResult) {
    return parabolaResult
  }

  // 3. ELLISSE - Various forms
  // x^2/a^2 + y^2/b^2 = 1
  let ellipseMatch = cleanEquation.match(/x\^?2\/(\d+)\s*\+\s*y\^?2\/(\d+)\s*=\s*1/)
  if (ellipseMatch) {
    const aSquared = Number.parseFloat(ellipseMatch[1])
    const bSquared = Number.parseFloat(ellipseMatch[2])
    const a = Math.sqrt(aSquared)
    const b = Math.sqrt(bSquared)
    const c = Math.sqrt(Math.abs(aSquared - bSquared))
    const e = a > b ? c / a : c / b
    return {
      type: "ellisse" as const,
      confidence: 0.9,
      standardForm: `x²/${aSquared} + y²/${bSquared} = 1`,
      parameters: {
        center: { x: 0, y: 0 },
        semiMajorAxis: Math.max(a, b),
        semiMinorAxis: Math.min(a, b),
        eccentricity: e,
      },
      explanation: `Riconosciuta come ellisse con semiassi ${a.toFixed(2)} e ${b.toFixed(2)}`,
    }
  }

  // ax^2 + by^2 = c
  ellipseMatch = cleanEquation.match(/(\d*)\*?x\^?2\s*\+\s*(\d*)\*?y\^?2\s*=\s*(\d+)/)
  if (ellipseMatch) {
    const coeffA = extractNumber(ellipseMatch[1], 1)
    const coeffB = extractNumber(ellipseMatch[2], 1)
    const c = Number.parseFloat(ellipseMatch[3])
    if (coeffA > 0 && coeffB > 0 && c > 0) {
      const a = Math.sqrt(c / coeffA)
      const b = Math.sqrt(c / coeffB)
      return {
        type: "ellisse" as const,
        confidence: 0.8,
        standardForm: `${coeffA}x² + ${coeffB}y² = ${c}`,
        parameters: {
          center: { x: 0, y: 0 },
          semiMajorAxis: Math.max(a, b),
          semiMinorAxis: Math.min(a, b),
        },
        explanation: `Riconosciuta come ellisse in forma generale`,
      }
    }
  }

  // 4. IPERBOLE - Various forms
  // x^2/a^2 - y^2/b^2 = 1
  let hyperbolaMatch = cleanEquation.match(/x\^?2\/(\d+)\s*-\s*y\^?2\/(\d+)\s*=\s*1/)
  if (hyperbolaMatch) {
    const aSquared = Number.parseFloat(hyperbolaMatch[1])
    const bSquared = Number.parseFloat(hyperbolaMatch[2])
    const a = Math.sqrt(aSquared)
    const b = Math.sqrt(bSquared)
    const c = Math.sqrt(aSquared + bSquared)
    const e = c / a
    return {
      type: "iperbole" as const,
      confidence: 0.9,
      standardForm: `x²/${aSquared} - y²/${bSquared} = 1`,
      parameters: {
        center: { x: 0, y: 0 },
        semiMajorAxis: a,
        semiMinorAxis: b,
        eccentricity: e,
      },
      explanation: `Riconosciuta come iperbole con semiassi ${a.toFixed(2)} e ${b.toFixed(2)}`,
    }
  }

  // y^2/a^2 - x^2/b^2 = 1
  hyperbolaMatch = cleanEquation.match(/y\^?2\/(\d+)\s*-\s*x\^?2\/(\d+)\s*=\s*1/)
  if (hyperbolaMatch) {
    const aSquared = Number.parseFloat(hyperbolaMatch[1])
    const bSquared = Number.parseFloat(hyperbolaMatch[2])
    const a = Math.sqrt(aSquared)
    const b = Math.sqrt(bSquared)
    return {
      type: "iperbole" as const,
      confidence: 0.9,
      standardForm: `y²/${aSquared} - x²/${bSquared} = 1`,
      parameters: {
        center: { x: 0, y: 0 },
        semiMajorAxis: a,
        semiMinorAxis: b,
      },
      explanation: `Riconosciuta come iperbole con asse trasverso verticale`,
    }
  }

  // xy = k (equilateral hyperbola)
  hyperbolaMatch = cleanEquation.match(/x\*?y\s*=\s*([+-]?\d+)/)
  if (hyperbolaMatch) {
    const k = Number.parseFloat(hyperbolaMatch[1])
    return {
      type: "iperbole" as const,
      confidence: 0.9,
      standardForm: `xy = ${k}`,
      parameters: {
        center: { x: 0, y: 0 },
        semiMajorAxis: Math.sqrt(Math.abs(k)),
        semiMinorAxis: Math.sqrt(Math.abs(k)),
      },
      explanation: `Riconosciuta come iperbole equilatera`,
    }
  }

  // 5. Try to guess based on presence of terms
  if (cleanEquation.includes("x^2") && cleanEquation.includes("y^2")) {
    if (cleanEquation.includes("+") && cleanEquation.includes("=")) {
      // Likely circle or ellipse - default to circle
      return {
        type: "circonferenza" as const,
        confidence: 0.5,
        standardForm: equation,
        parameters: {
          center: { x: 0, y: 0 },
          radius: 5,
        },
        explanation: "Riconosciuta come possibile circonferenza basata sulla presenza di x² + y²",
      }
    } else if (cleanEquation.includes("-")) {
      // Likely hyperbola
      return {
        type: "iperbole" as const,
        confidence: 0.5,
        standardForm: equation,
        parameters: {
          center: { x: 0, y: 0 },
          semiMajorAxis: 4,
          semiMinorAxis: 3,
        },
        explanation: "Riconosciuta come possibile iperbole basata sulla presenza di x² - y²",
      }
    }
  } else if (cleanEquation.includes("x^2") || cleanEquation.includes("y^2")) {
    // Only one squared term - likely parabola
    return {
      type: "parabola" as const,
      confidence: 0.6,
      standardForm: equation,
      parameters: {
        coefficients: { a: 1, b: 0, c: 0 },
        vertex: { x: 0, y: 0 },
      },
      explanation: "Riconosciuta come possibile parabola basata sulla presenza di un solo termine quadratico",
    }
  }

  // If nothing matches, return a default parabola to avoid complete failure
  return {
    type: "unknown" as const,
    confidence: 0.3,
    standardForm: equation,
    parameters: {},
    explanation: `Impossibile riconoscere l'equazione "${equation}". Prova con forme più standard come: x² + y² = 25, y = x², x²/4 + y²/9 = 1, x²/4 - y²/9 = 1`,
  }
}

export async function POST(request: Request) {
  try {
    const { equation } = await request.json()

    if (!equation || typeof equation !== "string") {
      return Response.json({ error: "Equazione non fornita" }, { status: 400 })
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.warn("OpenAI API key not found, using fallback parser")
      const fallbackResult = fallbackConicParser(equation)
      return Response.json(fallbackResult)
    }

    try {
      // Configure OpenAI client with the API key
      const openaiClient = openai({
        apiKey: apiKey,
      })

      const { object } = await generateObject({
        model: openaiClient("gpt-4o"),
        schema: ConicSchema,
        prompt: `
          Analizza la seguente equazione matematica e determina che tipo di sezione conica rappresenta.
          Devi eseguire tutti i calcoli algebrici necessari, combinando correttamente i termini simili.

          Equazione: "${equation}"

          Devi:
          1. Combinare tutti i termini simili (tutti i termini in x², tutti i termini in x, ecc.)
          2. Identificare il tipo di conica (parabola, circonferenza, ellisse, iperbole, o unknown se non riconoscibile)
          3. Convertire l'equazione in forma standard
          4. Estrarre tutti i parametri geometrici rilevanti:
             - Per circonferenze: centro e raggio
             - Per ellissi: centro, semiassi maggiore e minore, fuochi, eccentricità
             - Per parabole: vertice, fuoco, direttrice, coefficienti a, b, c
             - Per iperboli: centro, semiassi, fuochi, eccentricità, asintoti
          5. Fornire una spiegazione del riconoscimento con i passaggi algebrici eseguiti
          6. Calcolare alcuni punti per il grafico (opzionale)

          Esempi di forme che devi riconoscere:
          - Circonferenze: x² + y² = r², (x-h)² + (y-k)² = r², x² + y² + Dx + Ey + F = 0
          - Ellissi: x²/a² + y²/b² = 1, (x-h)²/a² + (y-k)²/b² = 1
          - Parabole: y = ax² + bx + c, x = ay² + by + c, y² = 4px, x² = 4py
          - Iperboli: x²/a² - y²/b² = 1, y²/a² - x²/b² = 1, xy = k

          Sii preciso nei calcoli matematici e fornisci una confidence tra 0 e 1.
          
          IMPORTANTE: Assicurati di combinare correttamente tutti i termini simili nell'equazione prima di identificare la conica.
          Ad esempio, se ci sono più termini in x² come "2x² + 3x² - x²", devi prima calcolare "4x²".
        `,
      })

      return Response.json(object)
    } catch (aiError) {
      console.warn("AI parsing failed, using fallback parser:", aiError)
      const fallbackResult = fallbackConicParser(equation)
      return Response.json(fallbackResult)
    }
  } catch (error) {
    console.error("Errore nel parsing:", error)

    // Try fallback parser as last resort
    try {
      const { equation } = await request.json()
      const fallbackResult = fallbackConicParser(equation)
      return Response.json(fallbackResult)
    } catch (fallbackError) {
      return Response.json(
        {
          error: "Errore nell'analisi dell'equazione",
          details: error instanceof Error ? error.message : "Errore sconosciuto",
        },
        { status: 500 },
      )
    }
  }
}
