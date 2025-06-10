import { MathEngine } from "@/lib/math-engine"
import { WolframAlphaAPI } from "@/lib/wolfram-alpha"

export async function POST(request: Request) {
  try {
    const { expression, useWolfram = false } = await request.json()

    if (!expression || typeof expression !== "string") {
      return Response.json({ error: "Expression not provided" }, { status: 400 })
    }

    // Use Wolfram Alpha if requested and API key is available
    if (useWolfram) {
      const wolframResult = await WolframAlphaAPI.query(expression)

      if (wolframResult.success) {
        return Response.json({
          source: "wolfram",
          ...wolframResult.data,
        })
      } else {
        console.warn("Wolfram Alpha failed, falling back to Math.js:", wolframResult.error)
      }
    }

    // Use local Math.js engine
    const result = await MathEngine.analyzeExpression(expression)

    return Response.json({
      source: "mathjs",
      ...result,
    })
  } catch (error) {
    console.error("Error in math calculation:", error)
    return Response.json(
      {
        error: "Error processing mathematical expression",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
