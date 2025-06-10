"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PolynomialParser } from "@/components/polynomial-parser"

export default function StrumentiPage() {
  const [activeTab, setActiveTab] = useState("parser")

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Strumenti Matematici</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="parser">Parser Polinomiale</TabsTrigger>
        </TabsList>

        <TabsContent value="parser" className="space-y-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Parser Polinomiale</h2>
            <p className="text-muted-foreground mb-6">
              Questo strumento analizza un'equazione polinomiale, combina i termini simili e identifica il tipo di
              sezione conica rappresentata. Utile per verificare i calcoli prima di utilizzare il visualizzatore di
              coniche.
            </p>

            <PolynomialParser />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
