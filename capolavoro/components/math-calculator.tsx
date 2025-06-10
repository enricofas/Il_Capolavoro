"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Calculator, Brain, Zap, TrendingUp, Copy, CheckCircle } from "lucide-react"
import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface MathResult {
  source: "mathjs" | "wolfram"
  originalExpression: string
  simplifiedExpression?: string
  expandedExpression?: string
  derivative?: string
  solutions?: string[]
  steps?: string[]
  explanation?: string
  graphData?: {
    points: Array<{ x: number; y: number }>
    domain: { min: number; max: number }
    range: { min: number; max: number }
  }
  plots?: string[]
  result?: string
  alternativeForms?: string[]
  properties?: Record<string, any>
}

export function MathCalculator() {
  const [expression, setExpression] = useState("")
  const [result, setResult] = useState<MathResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [useWolfram, setUseWolfram] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const examples = [
    "x^2 + 2*x + 1",
    "sin(x) + cos(x)",
    "x^2 - 4 = 0",
    "derivative of x^3 + 2*x^2 + x",
    "(x+1)*(x-1)",
    "x^2/4 + y^2/9 = 1",
    "integrate x^2 dx",
  ]

  const handleCalculate = async () => {
    if (!expression.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/math-calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expression: expression.trim(),
          useWolfram,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const renderGraphData = () => {
    if (!result?.graphData?.points || result.graphData.points.length === 0) {
      return null
    }

    const { points } = result.graphData

    return (
      <div className="mt-4">
        <Plot
          data={[
            {
              x: points.map((p) => p.x),
              y: points.map((p) => p.y),
              type: "scatter",
              mode: "lines",
              line: { color: "#3b82f6", width: 2 },
              name: "f(x)",
            },
          ]}
          layout={{
            title: {
              text: `Grafico di: ${result.simplifiedExpression || result.originalExpression}`,
              font: { size: 16 },
            },
            xaxis: {
              title: "x",
              gridcolor: "#e5e7eb",
              zeroline: true,
              zerolinecolor: "#374151",
            },
            yaxis: {
              title: "y",
              gridcolor: "#e5e7eb",
              zeroline: true,
              zerolinecolor: "#374151",
            },
            plot_bgcolor: "#f8fafc",
            paper_bgcolor: "#ffffff",
            margin: { l: 60, r: 40, t: 60, b: 60 },
          }}
          style={{ width: "100%", height: "400px" }}
          config={{
            responsive: true,
            displayModeBar: false,
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-500" />
            Calcolatore Matematico Avanzato
          </CardTitle>
          <CardDescription>
            Risolvi equazioni, semplifica espressioni e genera grafici usando Math.js e Wolfram Alpha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Engine Selection */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Motore di calcolo:</span>
              <Badge variant={useWolfram ? "default" : "secondary"}>{useWolfram ? "Wolfram Alpha" : "Math.js"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Math.js</span>
              <Switch checked={useWolfram} onCheckedChange={setUseWolfram} />
              <span className="text-sm text-gray-600">Wolfram Alpha</span>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Esempi (clicca per usare):</label>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setExpression(example)}
                  className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Inserisci espressione matematica:</label>
            <div className="flex gap-2">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Es: x^2 + 2*x + 1 o x^2 - 4 = 0"
                className="font-mono"
                onKeyPress={(e) => e.key === "Enter" && handleCalculate()}
              />
              <Button onClick={handleCalculate} disabled={loading || !expression.trim()} className="min-w-[120px]">
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                    Calcolo...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Calcola
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {result && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Risultati</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {result.source === "wolfram" ? <Brain className="h-3 w-3" /> : <Calculator className="h-3 w-3" />}
                    {result.source === "wolfram" ? "Wolfram Alpha" : "Math.js"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="results" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="results">Risultati</TabsTrigger>
                    <TabsTrigger value="steps">Passaggi</TabsTrigger>
                    <TabsTrigger value="graph">Grafico</TabsTrigger>
                    <TabsTrigger value="properties">Proprietà</TabsTrigger>
                  </TabsList>

                  <TabsContent value="results" className="space-y-4">
                    {/* Main Results */}
                    <div className="grid gap-4">
                      {result.result && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-green-800">Risultato principale:</h4>
                              <p className="font-mono text-lg text-green-700">{result.result}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.result!, "result")}>
                              {copied === "result" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {result.simplifiedExpression && result.simplifiedExpression !== result.originalExpression && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-blue-800">Forma semplificata:</h4>
                              <p className="font-mono text-blue-700">{result.simplifiedExpression}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.simplifiedExpression!, "simplified")}
                            >
                              {copied === "simplified" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {result.expandedExpression && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-purple-800">Forma espansa:</h4>
                              <p className="font-mono text-purple-700">{result.expandedExpression}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.expandedExpression!, "expanded")}
                            >
                              {copied === "expanded" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {result.derivative && (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-orange-800">Derivata:</h4>
                              <p className="font-mono text-orange-700">{result.derivative}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(result.derivative!, "derivative")}
                            >
                              {copied === "derivative" ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {result.solutions && result.solutions.length > 0 && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <h4 className="font-semibold text-emerald-800 mb-2">Soluzioni:</h4>
                          <div className="space-y-1">
                            {result.solutions.map((solution, index) => (
                              <p key={index} className="font-mono text-emerald-700">
                                x = {solution}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.alternativeForms && result.alternativeForms.length > 0 && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Forme alternative:</h4>
                          <div className="space-y-1">
                            {result.alternativeForms.map((form, index) => (
                              <p key={index} className="font-mono text-gray-700">
                                {form}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="steps">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {result.steps && result.steps.length > 0 ? (
                          result.steps.map((step, index) => (
                            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Badge variant="outline" className="mt-0.5">
                                  {index + 1}
                                </Badge>
                                <p className="text-sm">{step}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">
                            Nessun passaggio disponibile per questa espressione
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="graph">
                    <div className="space-y-4">
                      {result.plots && result.plots.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Grafici da Wolfram Alpha:
                          </h4>
                          {result.plots.map((plot, index) => (
                            <img
                              key={index}
                              src={plot || "/placeholder.svg"}
                              alt={`Grafico ${index + 1}`}
                              className="max-w-full h-auto border border-gray-200 rounded-lg"
                            />
                          ))}
                        </div>
                      ) : (
                        renderGraphData()
                      )}

                      {!result.plots && !result.graphData && (
                        <p className="text-gray-500 text-center py-8">
                          Nessun grafico disponibile per questa espressione
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="properties">
                    <div className="space-y-3">
                      {result.properties && Object.keys(result.properties).length > 0 ? (
                        Object.entries(result.properties).map(([key, value]) => (
                          <div key={key} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <h5 className="font-semibold text-gray-800 capitalize">{key}:</h5>
                            <p className="text-gray-700 mt-1">{value}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">Nessuna proprietà aggiuntiva disponibile</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
