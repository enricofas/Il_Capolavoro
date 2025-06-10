import { create, all } from "mathjs"

// Create a math.js instance with all functions
const math = create(all)

export interface MathCalculationResult {
  originalExpression: string
  simplifiedExpression: string
  expandedExpression?: string
  factorizedExpression?: string
  derivative?: string
  integral?: string
  solutions?: string[]
  graphData?: {
    points: Array<{ x: number; y: number }>
    domain: { min: number; max: number }
    range: { min: number; max: number }
  }
  steps?: string[]
  explanation: string
}

export class MathEngine {
  // Simplify mathematical expressions
  static simplify(expression: string): string {
    try {
      const simplified = math.simplify(expression)
      return simplified.toString()
    } catch (error) {
      console.error("Error simplifying expression:", error)
      return expression
    }
  }

  // Expand mathematical expressions
  static expand(expression: string): string {
    try {
      const expanded = math.simplify(expression, { expand: true })
      return expanded.toString()
    } catch (error) {
      console.error("Error expanding expression:", error)
      return expression
    }
  }

  // Calculate derivative
  static derivative(expression: string, variable = "x"): string {
    try {
      const expr = math.parse(expression)
      const derivative = math.derivative(expr, variable)
      return derivative.toString()
    } catch (error) {
      console.error("Error calculating derivative:", error)
      return "Unable to calculate derivative"
    }
  }

  // Solve equations
  static solve(equation: string, variable = "x"): string[] {
    try {
      // Handle different equation formats
      let leftSide = equation
      let rightSide = "0"

      if (equation.includes("=")) {
        const parts = equation.split("=")
        leftSide = parts[0].trim()
        rightSide = parts[1].trim()
      }

      // Create equation in the form f(x) = 0
      const expr = `${leftSide} - (${rightSide})`
      const solutions = math.solve(expr, variable)

      if (Array.isArray(solutions)) {
        return solutions.map((sol) => sol.toString())
      } else {
        return [solutions.toString()]
      }
    } catch (error) {
      console.error("Error solving equation:", error)
      return []
    }
  }

  // Generate graph data for plotting
  static generateGraphData(
    expression: string,
    variable = "x",
    domain: { min: number; max: number } = { min: -10, max: 10 },
  ): {
    points: Array<{ x: number; y: number }>
    domain: { min: number; max: number }
    range: { min: number; max: number }
  } {
    const points: Array<{ x: number; y: number }> = []
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    try {
      const expr = math.parse(expression)
      const compiled = expr.compile()

      const step = (domain.max - domain.min) / 1000

      for (let x = domain.min; x <= domain.max; x += step) {
        try {
          const scope = { [variable]: x }
          const y = compiled.evaluate(scope)

          if (typeof y === "number" && isFinite(y)) {
            points.push({ x, y })
            minY = Math.min(minY, y)
            maxY = Math.max(maxY, y)
          }
        } catch (evalError) {
          // Skip points where evaluation fails
          continue
        }
      }
    } catch (error) {
      console.error("Error generating graph data:", error)
    }

    return {
      points,
      domain,
      range: {
        min: minY === Number.POSITIVE_INFINITY ? -10 : minY,
        max: maxY === Number.NEGATIVE_INFINITY ? 10 : maxY,
      },
    }
  }

  // Comprehensive analysis of mathematical expressions
  static async analyzeExpression(expression: string): Promise<MathCalculationResult> {
    const steps: string[] = []

    try {
      // Step 1: Simplify
      steps.push(`Espressione originale: ${expression}`)
      const simplified = this.simplify(expression)
      steps.push(`Semplificazione: ${simplified}`)

      // Step 2: Expand if different from simplified
      const expanded = this.expand(expression)
      if (expanded !== simplified) {
        steps.push(`Espansione: ${expanded}`)
      }

      // Step 3: Try to calculate derivative
      let derivative = ""
      try {
        derivative = this.derivative(simplified)
        steps.push(`Derivata: ${derivative}`)
      } catch (error) {
        steps.push("Derivata: Non calcolabile per questa espressione")
      }

      // Step 4: Try to solve if it's an equation
      let solutions: string[] = []
      if (expression.includes("=")) {
        solutions = this.solve(expression)
        if (solutions.length > 0) {
          steps.push(`Soluzioni: ${solutions.join(", ")}`)
        }
      }

      // Step 5: Generate graph data
      const graphData = this.generateGraphData(simplified)

      return {
        originalExpression: expression,
        simplifiedExpression: simplified,
        expandedExpression: expanded !== simplified ? expanded : undefined,
        derivative: derivative || undefined,
        solutions: solutions.length > 0 ? solutions : undefined,
        graphData,
        steps,
        explanation: `Analisi completata con ${steps.length} passaggi`,
      }
    } catch (error) {
      return {
        originalExpression: expression,
        simplifiedExpression: expression,
        steps: [`Errore nell'analisi: ${error}`],
        explanation: "Impossibile analizzare completamente l'espressione",
      }
    }
  }
}
