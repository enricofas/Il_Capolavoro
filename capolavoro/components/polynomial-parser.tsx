"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, AlertTriangle } from "lucide-react"

interface Term {
  coefficient: number
  xPower: number
  yPower: number
}

export function PolynomialParser() {
  const [equation, setEquation] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  const parsePolynomial = () => {
    setIsCalculating(true)
    setError("")
    setResult(null)

    try {
      // Normalize the equation
      const normalized = equation.replace(/\s+/g, "")

      // Move everything to the left side
      let leftSide = normalized
      if (normalized.includes("=")) {
        const parts = normalized.split("=")
        if (parts.length !== 2) throw new Error("Formato equazione non valido")
        leftSide = `${parts[0]}-(${parts[1]})`
      }

      // Replace -- with + and +- with -
      leftSide = leftSide.replace(/--/g, "+").replace(/\+-/g, "-")

      // Extract terms
      const terms: Term[] = []

      // Helper function to extract coefficient
      const extractCoefficient = (match: string): number => {
        if (!match || match === "+" || match === "") return 1
        if (match === "-") return -1
        return Number.parseFloat(match)
      }

      // Match x²y² terms
      const x2y2Regex = /([+-]?\d*\.?\d*)x\^2y\^2/g
      let match
      while ((match = x2y2Regex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 2,
          yPower: 2,
        })
      }

      // Match x²y terms
      const x2yRegex = /([+-]?\d*\.?\d*)x\^2y(?!\^)/g
      while ((match = x2yRegex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 2,
          yPower: 1,
        })
      }

      // Match xy² terms
      const xy2Regex = /([+-]?\d*\.?\d*)xy\^2/g
      while ((match = xy2Regex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 1,
          yPower: 2,
        })
      }

      // Match x² terms
      const x2Regex = /([+-]?\d*\.?\d*)x\^2(?![a-zA-Z])/g
      while ((match = x2Regex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 2,
          yPower: 0,
        })
      }

      // Match y² terms
      const y2Regex = /([+-]?\d*\.?\d*)y\^2(?![a-zA-Z])/g
      while ((match = y2Regex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 0,
          yPower: 2,
        })
      }

      // Match xy terms
      const xyRegex = /([+-]?\d*\.?\d*)xy(?!\^)/g
      while ((match = xyRegex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 1,
          yPower: 1,
        })
      }

      // Match x terms
      const xRegex = /([+-]?\d*\.?\d*)x(?!\^|y)/g
      while ((match = xRegex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 1,
          yPower: 0,
        })
      }

      // Match y terms
      const yRegex = /([+-]?\d*\.?\d*)y(?!\^)/g
      while ((match = yRegex.exec(leftSide)) !== null) {
        terms.push({
          coefficient: extractCoefficient(match[1]),
          xPower: 0,
          yPower: 1,
        })
      }

      // Match constant terms
      const constRegex = /([+-]?\d+\.?\d*)(?![a-zA-Z^])/g
      while ((match = constRegex.exec(leftSide)) !== null) {
        // Make sure it's not part of a coefficient
        const prevChar = leftSide.charAt(match.index - 1)
        if (prevChar !== "^" && prevChar !== "*") {
          terms.push({
            coefficient: Number.parseFloat(match[1]),
            xPower: 0,
            yPower: 0,
          })
        }
      }

      // Combine like terms
      const combinedTerms: { [key: string]: number } = {
        "x^2y^2": 0,
        "x^2y": 0,
        "xy^2": 0,
        "x^2": 0,
        "y^2": 0,
        xy: 0,
        x: 0,
        y: 0,
        const: 0,
      }

      terms.forEach((term) => {
        if (term.xPower === 2 && term.yPower === 2) {
          combinedTerms["x^2y^2"] += term.coefficient
        } else if (term.xPower === 2 && term.yPower === 1) {
          combinedTerms["x^2y"] += term.coefficient
        } else if (term.xPower === 1 && term.yPower === 2) {
          combinedTerms["xy^2"] += term.coefficient
        } else if (term.xPower === 2 && term.yPower === 0) {
          combinedTerms["x^2"] += term.coefficient
        } else if (term.xPower === 0 && term.yPower === 2) {
          combinedTerms["y^2"] += term.coefficient
        } else if (term.xPower === 1 && term.yPower === 1) {
          combinedTerms["xy"] += term.coefficient
        } else if (term.xPower === 1 && term.yPower === 0) {
          combinedTerms["x"] += term.coefficient
        } else if (term.xPower === 0 && term.yPower === 1) {
          combinedTerms["y"] += term.coefficient
        } else if (term.xPower === 0 && term.yPower === 0) {
          combinedTerms["const"] += term.coefficient
        }
      })

      // Format the result
      const formattedResult = Object.entries(combinedTerms)
        .filter(([_, value]) => value !== 0)
        .map(([term, coeff]) => {
          if (term === "const") return coeff.toFixed(2)
          const sign = coeff >= 0 ? "+" : ""
          return `${sign}${coeff.toFixed(2)}${term}`
        })
        .join(" ")
        .replace(/^\+/, "") // Remove leading + if present

      // Identify conic section type
      const A = combinedTerms["x^2"]
      const B = combinedTerms["y^2"]
      const C = combinedTerms["xy"]
      const D = combinedTerms["x"]
      const E = combinedTerms["y"]
      const F = combinedTerms["const"]

      let conicType = "sconosciuta"
      const discriminant = C * C - 4 * A * B

      if (Math.abs(discriminant) < 1e-10) {
        if (A === B && A !== 0) {
          conicType = "circonferenza"
        } else if (A !== 0 || B !== 0) {
          conicType = "parabola"
        }
      } else if (discriminant < 0) {
        conicType = "ellisse"
      } else if (discriminant > 0) {
        conicType = "iperbole"
      }

      setResult({
        originalEquation: equation,
        normalizedEquation: leftSide,
        terms: combinedTerms,
        formattedResult: formattedResult,
        conicType: conicType,
        coefficients: {
          A,
          B,
          C,
          D,
          E,
          F,
        },
      })
    } catch (err) {
      setError(`Errore nell'analisi: ${err instanceof Error ? err.message : "Formato non valido"}`)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Analisi Polinomiale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Inserisci l'equazione polinomiale:</label>
          <Input
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="Es: x^2 + y^2 + 3x - 2y + 5 = 0"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Supporta termini come x^2, y^2, xy, x, y e costanti. Puoi usare = per separare i membri.
          </p>
        </div>

        <Button onClick={parsePolynomial} className="w-full" disabled={isCalculating || !equation.trim()}>
          {isCalculating ? "Analisi in corso..." : "Analizza Polinomio"}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3 border rounded-md p-4">
            <div>
              <h3 className="font-medium">Equazione originale:</h3>
              <p className="font-mono">{result.originalEquation}</p>
            </div>

            <div>
              <h3 className="font-medium">Termini combinati:</h3>
              <p className="font-mono">{result.formattedResult}</p>
            </div>

            <div>
              <h3 className="font-medium">Tipo di conica:</h3>
              <p className="font-medium text-primary">{result.conicType}</p>
            </div>

            <div>
              <h3 className="font-medium">Coefficienti:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-mono">A (x²): {result.coefficients.A.toFixed(2)}</div>
                <div className="font-mono">B (y²): {result.coefficients.B.toFixed(2)}</div>
                <div className="font-mono">C (xy): {result.coefficients.C.toFixed(2)}</div>
                <div className="font-mono">D (x): {result.coefficients.D.toFixed(2)}</div>
                <div className="font-mono">E (y): {result.coefficients.E.toFixed(2)}</div>
                <div className="font-mono">F (const): {result.coefficients.F.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
