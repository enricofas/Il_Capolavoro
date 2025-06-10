export interface WolframAlphaResult {
  success: boolean
  data?: {
    input: string
    result: string
    plots?: string[]
    steps?: string[]
    alternativeForms?: string[]
    properties?: Record<string, any>
  }
  error?: string
}

export class WolframAlphaAPI {
  private static readonly BASE_URL = "https://api.wolframalpha.com/v2/query"

  static async query(input: string, appId?: string): Promise<WolframAlphaResult> {
    // Check if API key is available
    if (!appId && !process.env.WOLFRAM_ALPHA_APP_ID) {
      return {
        success: false,
        error: "Wolfram Alpha API key not configured",
      }
    }

    const apiKey = appId || process.env.WOLFRAM_ALPHA_APP_ID

    try {
      const params = new URLSearchParams({
        input: input,
        appid: apiKey!,
        output: "json",
        format: "plaintext,image",
        includepodid: "Input,Result,Plot,Solution,AlternateForm,Properties",
      })

      const response = await fetch(`${this.BASE_URL}?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.queryresult?.success) {
        return {
          success: true,
          data: this.parseWolframResponse(data.queryresult),
        }
      } else {
        return {
          success: false,
          error: "Wolfram Alpha could not interpret the query",
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  private static parseWolframResponse(queryResult: any) {
    const pods = queryResult.pods || []
    const result: any = {
      input: "",
      result: "",
      plots: [],
      steps: [],
      alternativeForms: [],
      properties: {},
    }

    for (const pod of pods) {
      const title = pod.title?.toLowerCase() || ""
      const subpods = pod.subpods || []

      if (title.includes("input")) {
        result.input = subpods[0]?.plaintext || ""
      } else if (title.includes("result") || title.includes("solution")) {
        result.result = subpods[0]?.plaintext || ""
      } else if (title.includes("plot") || title.includes("graph")) {
        for (const subpod of subpods) {
          if (subpod.img?.src) {
            result.plots.push(subpod.img.src)
          }
        }
      } else if (title.includes("step") || title.includes("solution steps")) {
        for (const subpod of subpods) {
          if (subpod.plaintext) {
            result.steps.push(subpod.plaintext)
          }
        }
      } else if (title.includes("alternate") || title.includes("form")) {
        for (const subpod of subpods) {
          if (subpod.plaintext) {
            result.alternativeForms.push(subpod.plaintext)
          }
        }
      } else {
        // Store other properties
        for (const subpod of subpods) {
          if (subpod.plaintext) {
            result.properties[title] = subpod.plaintext
          }
        }
      }
    }

    return result
  }
}
