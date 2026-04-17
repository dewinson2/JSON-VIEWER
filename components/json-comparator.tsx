"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Equal, Plus, Minus, RefreshCw } from "lucide-react"

interface DiffResult {
  path: string
  type: "added" | "removed" | "modified" | "equal"
  leftValue?: any
  rightValue?: any
}

interface JsonComparatorProps {
  isDarkMode: boolean
}

export function JsonComparator({ isDarkMode }: JsonComparatorProps) {
  const [leftJson, setLeftJson] = useState("")
  const [rightJson, setRightJson] = useState("")
  const [leftParsed, setLeftParsed] = useState<any>(null)
  const [rightParsed, setRightParsed] = useState<any>(null)
  const [leftError, setLeftError] = useState<string | null>(null)
  const [rightError, setRightError] = useState<string | null>(null)
  const [differences, setDifferences] = useState<DiffResult[]>([])
  const [hasCompared, setHasCompared] = useState(false)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())

  const parseJson = (input: string, side: "left" | "right") => {
    if (!input.trim()) {
      if (side === "left") {
        setLeftParsed(null)
        setLeftError(null)
      } else {
        setRightParsed(null)
        setRightError(null)
      }
      return null
    }

    try {
      const parsed = JSON.parse(input)
      if (side === "left") {
        setLeftParsed(parsed)
        setLeftError(null)
      } else {
        setRightParsed(parsed)
        setRightError(null)
      }
      return parsed
    } catch (err) {
      if (side === "left") {
        setLeftError(err instanceof Error ? err.message : "Invalid JSON")
        setLeftParsed(null)
      } else {
        setRightError(err instanceof Error ? err.message : "Invalid JSON")
        setRightParsed(null)
      }
      return null
    }
  }

  const handleLeftChange = (value: string) => {
    setLeftJson(value)
    parseJson(value, "left")
    setHasCompared(false)
  }

  const handleRightChange = (value: string) => {
    setRightJson(value)
    parseJson(value, "right")
    setHasCompared(false)
  }

  const compareJsons = (left: any, right: any, path = ""): DiffResult[] => {
    const results: DiffResult[] = []

    if (left === null && right === null) {
      return [{ path: path || "root", type: "equal", leftValue: null, rightValue: null }]
    }

    if (left === null || right === null) {
      return [{ path: path || "root", type: "modified", leftValue: left, rightValue: right }]
    }

    const leftType = Array.isArray(left) ? "array" : typeof left
    const rightType = Array.isArray(right) ? "array" : typeof right

    if (leftType !== rightType) {
      return [{ path: path || "root", type: "modified", leftValue: left, rightValue: right }]
    }

    if (leftType !== "object" && leftType !== "array") {
      if (left === right) {
        return [{ path: path || "root", type: "equal", leftValue: left, rightValue: right }]
      }
      return [{ path: path || "root", type: "modified", leftValue: left, rightValue: right }]
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      const maxLength = Math.max(left.length, right.length)
      for (let i = 0; i < maxLength; i++) {
        const currentPath = path ? `${path}[${i}]` : `[${i}]`
        if (i >= left.length) {
          results.push({ path: currentPath, type: "added", rightValue: right[i] })
        } else if (i >= right.length) {
          results.push({ path: currentPath, type: "removed", leftValue: left[i] })
        } else {
          results.push(...compareJsons(left[i], right[i], currentPath))
        }
      }
      return results
    }

    const allKeys = new Set([...Object.keys(left), ...Object.keys(right)])

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key
      const leftHasKey = key in left
      const rightHasKey = key in right

      if (!leftHasKey) {
        results.push({ path: currentPath, type: "added", rightValue: right[key] })
      } else if (!rightHasKey) {
        results.push({ path: currentPath, type: "removed", leftValue: left[key] })
      } else {
        results.push(...compareJsons(left[key], right[key], currentPath))
      }
    }

    return results
  }

  const runComparison = () => {
    if (leftParsed && rightParsed) {
      const diffs = compareJsons(leftParsed, rightParsed)
      setDifferences(diffs)
      setHasCompared(true)
      // Expand all paths by default
      const paths = new Set(diffs.map(d => d.path))
      setExpandedPaths(paths)
    }
  }

  const togglePath = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const formatValue = (value: any): string => {
    if (value === null) return "null"
    if (value === undefined) return "undefined"
    if (typeof value === "string") return `"${value}"`
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    return String(value)
  }

  const getDiffStats = () => {
    const added = differences.filter(d => d.type === "added").length
    const removed = differences.filter(d => d.type === "removed").length
    const modified = differences.filter(d => d.type === "modified").length
    const equal = differences.filter(d => d.type === "equal").length
    return { added, removed, modified, equal, total: differences.length }
  }

  const clearAll = () => {
    setLeftJson("")
    setRightJson("")
    setLeftParsed(null)
    setRightParsed(null)
    setLeftError(null)
    setRightError(null)
    setDifferences([])
    setHasCompared(false)
  }

  const swapJsons = () => {
    const tempJson = leftJson
    const tempParsed = leftParsed
    const tempError = leftError

    setLeftJson(rightJson)
    setLeftParsed(rightParsed)
    setLeftError(rightError)

    setRightJson(tempJson)
    setRightParsed(tempParsed)
    setRightError(tempError)

    setHasCompared(false)
  }

  const loadSamples = () => {
    const left = {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      active: true,
      roles: ["admin", "user"],
      settings: {
        theme: "dark",
        notifications: true
      }
    }

    const right = {
      name: "John Doe",
      age: 31,
      email: "john.doe@example.com",
      active: true,
      roles: ["admin", "editor"],
      settings: {
        theme: "light",
        notifications: true,
        language: "en"
      },
      lastLogin: "2024-01-15"
    }

    const leftStr = JSON.stringify(left, null, 2)
    const rightStr = JSON.stringify(right, null, 2)

    setLeftJson(leftStr)
    setRightJson(rightStr)
    parseJson(leftStr, "left")
    parseJson(rightStr, "right")
    setHasCompared(false)
  }

  const stats = getDiffStats()
  const hasDifferences = stats.added > 0 || stats.removed > 0 || stats.modified > 0

  return (
    <div className="flex flex-col h-full gap-4">
      {/* JSON Input Panels */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left JSON */}
        <Card className={`flex-1 flex flex-col ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                JSON Original (Izquierda)
              </CardTitle>
              {leftParsed && !leftError && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Valid
                </Badge>
              )}
              {leftError && <Badge variant="destructive">Error</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 pt-0">
            <textarea
              placeholder="Pega el JSON original aqui..."
              value={leftJson}
              onChange={(e) => handleLeftChange(e.target.value)}
              className={`flex-1 w-full font-mono text-sm resize-none rounded-md p-3 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 placeholder-gray-400"
                  : "bg-gray-50 text-gray-900 placeholder-gray-500"
              }`}
              style={{ minHeight: "150px" }}
              spellCheck={false}
            />
            {leftError && (
              <div className={`mt-2 text-xs ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                {leftError}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Center Actions */}
        <div className="flex flex-col items-center justify-center gap-2">
          <Button
            onClick={swapJsons}
            size="sm"
            variant="outline"
            className="px-2"
            title="Intercambiar JSONs"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Right JSON */}
        <Card className={`flex-1 flex flex-col ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                JSON Nuevo (Derecha)
              </CardTitle>
              {rightParsed && !rightError && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Valid
                </Badge>
              )}
              {rightError && <Badge variant="destructive">Error</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 pt-0">
            <textarea
              placeholder="Pega el JSON nuevo aqui..."
              value={rightJson}
              onChange={(e) => handleRightChange(e.target.value)}
              className={`flex-1 w-full font-mono text-sm resize-none rounded-md p-3 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 placeholder-gray-400"
                  : "bg-gray-50 text-gray-900 placeholder-gray-500"
              }`}
              style={{ minHeight: "150px" }}
              spellCheck={false}
            />
            {rightError && (
              <div className={`mt-2 text-xs ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                {rightError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button
          onClick={runComparison}
          disabled={!leftParsed || !rightParsed}
          size="sm"
        >
          Comparar JSONs
        </Button>
        <Button onClick={loadSamples} size="sm" variant="outline">
          Cargar Ejemplos
        </Button>
        <Button onClick={clearAll} size="sm" variant="outline">
          Limpiar Todo
        </Button>
      </div>

      {/* Results */}
      {hasCompared && (
        <Card className={`flex-1 min-h-0 flex flex-col ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className={`text-sm ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
                Resultados de la Comparacion
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {stats.added > 0 && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Plus className="w-3 h-3 mr-1" />
                    {stats.added} agregados
                  </Badge>
                )}
                {stats.removed > 0 && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <Minus className="w-3 h-3 mr-1" />
                    {stats.removed} eliminados
                  </Badge>
                )}
                {stats.modified > 0 && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    {stats.modified} modificados
                  </Badge>
                )}
                {!hasDifferences && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Equal className="w-3 h-3 mr-1" />
                    Identicos
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 pt-0">
            {!hasDifferences ? (
              <div className={`flex items-center justify-center h-full ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <div className="text-center">
                  <Equal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Los dos JSONs son identicos</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {differences.filter(d => d.type !== "equal").map((diff, index) => (
                  <div
                    key={index}
                    className={`rounded-md p-3 ${
                      diff.type === "added"
                        ? isDarkMode
                          ? "bg-green-900/30 border border-green-700"
                          : "bg-green-50 border border-green-200"
                        : diff.type === "removed"
                        ? isDarkMode
                          ? "bg-red-900/30 border border-red-700"
                          : "bg-red-50 border border-red-200"
                        : isDarkMode
                        ? "bg-yellow-900/30 border border-yellow-700"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => togglePath(diff.path)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {expandedPaths.has(diff.path) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-medium">{diff.path}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              diff.type === "added"
                                ? "border-green-500 text-green-700 dark:text-green-400"
                                : diff.type === "removed"
                                ? "border-red-500 text-red-700 dark:text-red-400"
                                : "border-yellow-500 text-yellow-700 dark:text-yellow-400"
                            }`}
                          >
                            {diff.type === "added" ? "Agregado" : diff.type === "removed" ? "Eliminado" : "Modificado"}
                          </Badge>
                        </div>
                        {expandedPaths.has(diff.path) && (
                          <div className="mt-2 space-y-1">
                            {diff.type === "modified" && (
                              <>
                                <div className={`text-xs ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                                  <span className="font-semibold">Antes:</span>{" "}
                                  <code className="font-mono bg-red-100 dark:bg-red-900/50 px-1 rounded">
                                    {formatValue(diff.leftValue)}
                                  </code>
                                </div>
                                <div className={`text-xs ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                                  <span className="font-semibold">Despues:</span>{" "}
                                  <code className="font-mono bg-green-100 dark:bg-green-900/50 px-1 rounded">
                                    {formatValue(diff.rightValue)}
                                  </code>
                                </div>
                              </>
                            )}
                            {diff.type === "added" && (
                              <div className={`text-xs ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                                <span className="font-semibold">Valor:</span>{" "}
                                <code className="font-mono bg-green-100 dark:bg-green-900/50 px-1 rounded">
                                  {formatValue(diff.rightValue)}
                                </code>
                              </div>
                            )}
                            {diff.type === "removed" && (
                              <div className={`text-xs ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                                <span className="font-semibold">Valor:</span>{" "}
                                <code className="font-mono bg-red-100 dark:bg-red-900/50 px-1 rounded">
                                  {formatValue(diff.leftValue)}
                                </code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
