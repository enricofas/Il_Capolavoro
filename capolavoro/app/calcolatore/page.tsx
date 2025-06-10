import { MathCalculator } from "@/components/math-calculator"

export default function CalcolatorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Calcolatore Matematico</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Risolvi equazioni complesse, semplifica espressioni e genera grafici usando i più avanzati motori di calcolo
            matematico disponibili.
          </p>
        </div>
        <MathCalculator />
      </div>
    </div>
  )
}
