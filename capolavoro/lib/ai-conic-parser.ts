interface ConicAnalysis {
  type: "parabola" | "circonferenza" | "ellisse" | "iperbole" | "unknown"
  confidence: number
  standardForm: string
  parameters: {
    center?: { x: number; y: number }
    radius?: number
    semiMajorAxis?: number
    semiMinorAxis?: number
    focus1?: { x: number; y: number }
    focus2?: { x: number; y: number }
    vertex?: { x: number; y: number }
    directrix?: string
    eccentricity?: number
    coefficients?: {
      a?: number
      b?: number
      c?: number
      d?: number
      e?: number
      f?: number
    }
  }
  explanation: string
  graphingPoints?: Array<{ x: number; y: number }>
}

// Enhance the fallback parser to better handle polynomial expressions
export async function parseConicWithAI(equation: string): Promise<ConicAnalysis | null> {
  try {
    // Normalize the equation before sending to API
    const normalizedEquation = normalizeEquation(equation)

    const response = await fetch("/api/parse-conic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ equation: normalizedEquation }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.warn("API response not ok:", errorData)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.error) {
      console.warn("API returned error:", result.error)
      throw new Error(result.error)
    }

    // Add a note if this was parsed with fallback
    if (result.explanation && result.explanation.includes("fallback")) {
      result.explanation += " (Nota: Analisi effettuata senza AI)"
    }

    return result as ConicAnalysis
  } catch (error) {
    console.error("Errore nella chiamata AI:", error)

    // Return a basic analysis as fallback
    return {
      type: "unknown",
      confidence: 0.1,
      standardForm: equation,
      parameters: {},
      explanation: `Impossibile analizzare l'equazione: ${error instanceof Error ? error.message : "Errore sconosciuto"}. Prova a inserire l'equazione in una forma più standard.`,
    }
  }
}

// Helper function to normalize equation before sending to API
function normalizeEquation(equation: string): string {
  // Remove spaces
  let normalized = equation.replace(/\s+/g, "")

  // Replace ** with ^ for exponentiation if present
  normalized = normalized.replace(/\*\*/g, "^")

  // Ensure multiplication is explicit (e.g., 2x -> 2*x)
  normalized = normalized.replace(/(\d)([a-zA-Z])/g, "$1*$2")

  // Normalize ^ notation (e.g., x^2 is standard)
  normalized = normalized.replace(/x\*\*2/g, "x^2").replace(/y\*\*2/g, "y^2")

  return normalized
}

export function formatParametersForDisplay(analysis: ConicAnalysis): Array<{
  name: string
  value: string
  description: string
}> {
  const params: Array<{ name: string; value: string; description: string }> = []

  if (analysis.type === "circonferenza") {
    if (analysis.parameters.center) {
      params.push({
        name: "Centro",
        value: `(${analysis.parameters.center.x.toFixed(2)}, ${analysis.parameters.center.y.toFixed(2)})`,
        description: "Punto centrale della circonferenza",
      })
    }
    if (analysis.parameters.radius) {
      params.push({
        name: "Raggio",
        value: analysis.parameters.radius.toFixed(2),
        description: "Distanza dal centro a qualsiasi punto della circonferenza",
      })
      params.push({
        name: "Diametro",
        value: (analysis.parameters.radius * 2).toFixed(2),
        description: "Doppio del raggio",
      })
      params.push({
        name: "Area",
        value: (Math.PI * analysis.parameters.radius * analysis.parameters.radius).toFixed(2),
        description: "Area del cerchio",
      })
      params.push({
        name: "Circonferenza",
        value: (2 * Math.PI * analysis.parameters.radius).toFixed(2),
        description: "Lunghezza della circonferenza",
      })
    }
  } else if (analysis.type === "ellisse") {
    if (analysis.parameters.center) {
      params.push({
        name: "Centro",
        value: `(${analysis.parameters.center.x.toFixed(2)}, ${analysis.parameters.center.y.toFixed(2)})`,
        description: "Punto centrale dell'ellisse",
      })
    }
    if (analysis.parameters.semiMajorAxis) {
      params.push({
        name: "Semiasse maggiore (a)",
        value: analysis.parameters.semiMajorAxis.toFixed(2),
        description: "Metà dell'asse maggiore",
      })
    }
    if (analysis.parameters.semiMinorAxis) {
      params.push({
        name: "Semiasse minore (b)",
        value: analysis.parameters.semiMinorAxis.toFixed(2),
        description: "Metà dell'asse minore",
      })
    }
    if (analysis.parameters.focus1 && analysis.parameters.focus2) {
      params.push({
        name: "Fuochi",
        value: `(${analysis.parameters.focus1.x.toFixed(2)}, ${analysis.parameters.focus1.y.toFixed(2)}), (${analysis.parameters.focus2.x.toFixed(2)}, ${analysis.parameters.focus2.y.toFixed(2)})`,
        description: "Punti fissi della definizione",
      })
    }
    if (analysis.parameters.eccentricity) {
      params.push({
        name: "Eccentricità (e)",
        value: analysis.parameters.eccentricity.toFixed(3),
        description: 'Misura della "schiacciatura" dell\'ellisse',
      })
    }
    if (analysis.parameters.semiMajorAxis && analysis.parameters.semiMinorAxis) {
      params.push({
        name: "Area",
        value: (Math.PI * analysis.parameters.semiMajorAxis * analysis.parameters.semiMinorAxis).toFixed(2),
        description: "Area dell'ellisse",
      })
    }
  } else if (analysis.type === "parabola") {
    if (analysis.parameters.coefficients) {
      const { a, b, c } = analysis.parameters.coefficients
      if (a !== undefined) {
        params.push({
          name: "a",
          value: a.toFixed(3),
          description: "Coefficiente di x²",
        })
      }
      if (b !== undefined) {
        params.push({
          name: "b",
          value: b.toFixed(3),
          description: "Coefficiente di x",
        })
      }
      if (c !== undefined) {
        params.push({
          name: "c",
          value: c.toFixed(3),
          description: "Termine noto",
        })
      }
    }
    if (analysis.parameters.vertex) {
      params.push({
        name: "Vertice",
        value: `(${analysis.parameters.vertex.x.toFixed(2)}, ${analysis.parameters.vertex.y.toFixed(2)})`,
        description: "Punto di minimo/massimo della parabola",
      })
    }
    if (analysis.parameters.focus1) {
      params.push({
        name: "Fuoco",
        value: `(${analysis.parameters.focus1.x.toFixed(2)}, ${analysis.parameters.focus1.y.toFixed(2)})`,
        description: "Punto fisso della definizione",
      })
    }
    if (analysis.parameters.directrix) {
      params.push({
        name: "Direttrice",
        value: analysis.parameters.directrix,
        description: "Retta fissa della definizione",
      })
    }
  } else if (analysis.type === "iperbole") {
    if (analysis.parameters.center) {
      params.push({
        name: "Centro",
        value: `(${analysis.parameters.center.x.toFixed(2)}, ${analysis.parameters.center.y.toFixed(2)})`,
        description: "Punto centrale dell'iperbole",
      })
    }
    if (analysis.parameters.semiMajorAxis) {
      params.push({
        name: "Semiasse trasverso (a)",
        value: analysis.parameters.semiMajorAxis.toFixed(2),
        description: "Metà dell'asse trasverso",
      })
    }
    if (analysis.parameters.semiMinorAxis) {
      params.push({
        name: "Semiasse non trasverso (b)",
        value: analysis.parameters.semiMinorAxis.toFixed(2),
        description: "Metà dell'asse non trasverso",
      })
    }
    if (analysis.parameters.focus1 && analysis.parameters.focus2) {
      params.push({
        name: "Fuochi",
        value: `(${analysis.parameters.focus1.x.toFixed(2)}, ${analysis.parameters.focus1.y.toFixed(2)}), (${analysis.parameters.focus2.x.toFixed(2)}, ${analysis.parameters.focus2.y.toFixed(2)})`,
        description: "Punti fissi della definizione",
      })
    }
    if (analysis.parameters.eccentricity) {
      params.push({
        name: "Eccentricità (e)",
        value: analysis.parameters.eccentricity.toFixed(3),
        description: "Rapporto c/a, sempre > 1 per le iperboli",
      })
    }
  }

  // Aggiungi sempre la forma standard e la spiegazione
  params.push({
    name: "Forma standard",
    value: analysis.standardForm,
    description: "Equazione in forma canonica",
  })

  return params
}
