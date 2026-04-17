"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Expand,
  Minimize,
  Maximize,
  X,
  Moon,
  Sun,
  FileJson,
  FileCode,
  Sheet,
  GitCompare,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { JsonViewer } from "@/components/json-viewer"
import { JsonComparator } from "@/components/json-comparator"

export default function JsonViewerPage() {
  const [jsonInput, setJsonInput] = useState("")
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [expandAll, setExpandAll] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState<"viewer" | "comparator">("viewer")
  const { toast } = useToast()

  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const validateAndParseJson = (input: string) => {
    if (!input.trim()) {
      setParsedJson(null)
      setError(null)
      setIsValid(false)
      return
    }

    try {
      const parsed = JSON.parse(input)
      setParsedJson(parsed)
      setError(null)
      setIsValid(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setParsedJson(null)
      setIsValid(false)
    }
  }

  const handleInputChange = (value: string) => {
    setJsonInput(value)
    validateAndParseJson(value)
  }

  const formatJson = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2)
      setJsonInput(formatted)
      setTimeout(() => {
        validateAndParseJson(formatted)
        const textarea = document.querySelector("textarea") as HTMLTextAreaElement
        if (textarea) {
          textarea.focus()
          textarea.setSelectionRange(0, 0)
          textarea.blur()
          textarea.focus()
        }
      }, 10)
    }
  }

  const minifyJson = () => {
    if (parsedJson) {
      const minified = JSON.stringify(parsedJson)
      setJsonInput(minified)
      setTimeout(() => {
        validateAndParseJson(minified)
        const textarea = document.querySelector("textarea") as HTMLTextAreaElement
        if (textarea) {
          textarea.focus()
          textarea.setSelectionRange(0, 0)
          textarea.blur()
          textarea.focus()
        }
      }, 10)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonInput)
      toast({
        title: "Copied",
        description: "JSON copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const downloadJson = () => {
    const blob = new Blob([jsonInput], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const jsonToXml = (obj: any, rootName = "root"): string => {
    const convertValue = (key: string, value: any, indent: string): string => {
      if (value === null) {
        return `${indent}<${key} />\n`
      }
      if (Array.isArray(value)) {
        return value.map((item) => convertValue(key, item, indent)).join("")
      }
      if (typeof value === "object") {
        const nested = Object.entries(value)
          .map(([k, v]) => convertValue(k, v, indent + "  "))
          .join("")
        return `${indent}<${key}>\n${nested}${indent}</${key}>\n`
      }
      return `${indent}<${key}>${value}</${key}>\n`
    }

    const xmlContent = Object.entries(obj)
      .map(([key, value]) => convertValue(key, value, "  "))
      .join("")
    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${xmlContent}</${rootName}>`
  }

  const jsonToCsv = (obj: any): string => {
    const flatten = (data: any, prefix = ""): any => {
      const result: any = {}
      for (const key in data) {
        const newKey = prefix ? `${prefix}.${key}` : key
        if (data[key] !== null && typeof data[key] === "object" && !Array.isArray(data[key])) {
          Object.assign(result, flatten(data[key], newKey))
        } else if (Array.isArray(data[key])) {
          result[newKey] = JSON.stringify(data[key])
        } else {
          result[newKey] = data[key]
        }
      }
      return result
    }

    const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) return ""
      const stringValue = String(value)
      // Always quote if contains comma, quote, newline, or starts with special chars
      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes("\r")
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const rows: any[] = []
    if (Array.isArray(obj)) {
      obj.forEach((item) => rows.push(flatten(item)))
    } else {
      rows.push(flatten(obj))
    }

    if (rows.length === 0) return ""

    const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
    const csvHeaders = headers.map((h) => escapeCSVValue(h)).join(",")
    const csvRows = rows.map((row) => headers.map((header) => escapeCSVValue(row[header])).join(",")).join("\n")

    return `${csvHeaders}\n${csvRows}`
  }

  const downloadXml = () => {
    if (!parsedJson) return
    try {
      const xml = jsonToXml(parsedJson)
      const blob = new Blob([xml], { type: "application/xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "data.xml"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "XML file downloaded successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not convert to XML",
        variant: "destructive",
      })
    }
  }

  const downloadCsv = () => {
    if (!parsedJson) return
    try {
      const csv = jsonToCsv(parsedJson)
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "data.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        title: "Downloaded",
        description: "CSV file downloaded successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not convert to CSV",
        variant: "destructive",
      })
    }
  }

  const loadSampleJson = () => {
    const sample = {
      user: {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        active: true,
        roles: ["admin", "editor"],
        settings: {
          theme: "dark",
          language: "en",
          notifications: {
            email: true,
            push: false,
          },
        },
        createdAt: "2024-01-15T10:30:00Z",
        lastAccess: null,
      },
      statistics: {
        totalUsers: 1250,
        activeUsers: 892,
        activityPercentage: 71.36,
      },
    }
    const formatted = JSON.stringify(sample, null, 2)
    setJsonInput(formatted)
    validateAndParseJson(formatted)
  }

  const clearJson = () => {
    setJsonInput("")
    setParsedJson(null)
    setError(null)
    setIsValid(false)
  }

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  const resetZoom = () => {
    setZoomLevel(100)
  }

  const toggleExpandAll = () => {
    setExpandAll(!expandAll)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleEditorFullscreen = () => {
    setIsEditorFullscreen(!isEditorFullscreen)
  }

  const highlightJson = (json: string) => {
    if (!json) return ""

    return json
      .replace(/(".*?")\s*:/g, '<span class="text-blue-600 dark:text-blue-400">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="text-green-600 dark:text-green-400">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-gray-500 dark:text-gray-400">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-orange-600 dark:text-orange-400">$1</span>')
      .replace(/([{}[\]])/g, '<span class="text-gray-700 dark:text-gray-300 font-bold">$1</span>')
  }

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "viewer" | "comparator")} className="w-auto">
            <TabsList className={isDarkMode ? "bg-gray-700" : "bg-gray-200"}>
              <TabsTrigger value="viewer" className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                <span className="hidden sm:inline">Visor JSON</span>
              </TabsTrigger>
              <TabsTrigger value="comparator" className="flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                <span className="hidden sm:inline">Comparador</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={toggleDarkMode} size="sm" variant="outline">
            {isDarkMode ? (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
        </div>

        {activeTab === "viewer" && (
        <div className="flex flex-1 gap-6 min-h-0">
          <Card
            className={`flex flex-col flex-1 min-w-0 ${isEditorFullscreen ? "fixed inset-0 z-50 rounded-none" : ""} ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={isDarkMode ? "text-gray-100" : "text-gray-900"}>JSON Editor</CardTitle>
                  <CardDescription className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Paste or write your JSON here
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={toggleEditorFullscreen} size="sm" variant="outline">
                    {isEditorFullscreen ? (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Exit</span>
                      </>
                    ) : (
                      <>
                        <Maximize className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Fullscreen</span>
                      </>
                    )}
                  </Button>
                  {isValid && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Valid
                    </Badge>
                  )}
                  {error && <Badge variant="destructive">Error</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4">
              <div className="flex-1 relative">
                <textarea
                  placeholder="Paste your JSON here..."
                  value={jsonInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={`absolute inset-0 w-full h-full font-mono text-sm resize-none rounded-md p-3 z-20 outline-none ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100 placeholder-gray-400"
                      : "bg-gray-50 text-gray-900 placeholder-gray-500"
                  }`}
                  style={{
                    caretColor: isDarkMode ? "#f3f4f6" : "#374151",
                    border: "none",
                    boxShadow: "none",
                  }}
                  spellCheck={false}
                />
                {!jsonInput && (
                  <div
                    className={`absolute inset-0 w-full h-full font-mono text-sm p-3 rounded-md overflow-auto pointer-events-none z-10 ${
                      isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    Paste your JSON here...
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-start">
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={formatJson} disabled={!isValid} size="sm">
                    Format
                  </Button>
                  <Button onClick={minifyJson} disabled={!isValid} size="sm" variant="outline">
                    Minify
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={copyToClipboard} disabled={!jsonInput} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button onClick={downloadJson} disabled={!jsonInput} size="sm" variant="outline">
                    <FileJson className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                  <Button onClick={downloadXml} disabled={!isValid} size="sm" variant="outline">
                    <FileCode className="w-4 h-4 mr-1" />
                    XML
                  </Button>
                  <Button onClick={downloadCsv} disabled={!isValid} size="sm" variant="outline">
                    <Sheet className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={loadSampleJson} size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-1" />
                    Sample
                  </Button>
                  <Button onClick={clearJson} disabled={!jsonInput} size="sm" variant="outline">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isEditorFullscreen && (
            <Card
              className={`flex flex-col flex-1 min-w-0 ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""} ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={isDarkMode ? "text-gray-100" : "text-gray-900"}>Preview</CardTitle>
                    <CardDescription className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                      Structured visualization of JSON
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Button onClick={toggleExpandAll} size="sm" variant="outline" disabled={!isValid || showRaw}>
                      {expandAll ? (
                        <>
                          <Minimize className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Collapse</span>
                        </>
                      ) : (
                        <>
                          <Expand className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Expand</span>
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button onClick={zoomOut} size="sm" variant="outline" disabled={!isValid || zoomLevel <= 50}>
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground min-w-[2.5rem] text-center">{zoomLevel}%</span>
                      <Button onClick={zoomIn} size="sm" variant="outline" disabled={!isValid || zoomLevel >= 200}>
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button onClick={resetZoom} size="sm" variant="outline" disabled={!isValid || zoomLevel === 100}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button onClick={() => setShowRaw(!showRaw)} size="sm" variant="outline" disabled={!isValid}>
                      {showRaw ? (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Tree</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Raw</span>
                        </>
                      )}
                    </Button>

                    <Button onClick={toggleFullscreen} size="sm" variant="outline" disabled={!isValid}>
                      {isFullscreen ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Exit</span>
                        </>
                      ) : (
                        <>
                          <Maximize className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Fullscreen</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div
                  className={`border rounded-md p-4 overflow-auto flex-1 ${
                    isFullscreen ? "min-h-[calc(100vh-200px)]" : ""
                  } ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"}`}
                >
                  {!parsedJson && !error && (
                    <div
                      className={`flex items-center justify-center h-full ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      <p>Enter valid JSON to see preview</p>
                    </div>
                  )}

                  {parsedJson && (
                    <div
                      className="transition-transform duration-200 origin-top-left"
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        minHeight: `${400 * (100 / zoomLevel)}px`,
                      }}
                    >
                      {showRaw ? (
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                          {JSON.stringify(parsedJson, null, 2)}
                        </pre>
                      ) : (
                        <JsonViewer data={parsedJson} expandAll={expandAll} />
                      )}
                    </div>
                  )}
                </div>
                {error && (
                  <div className={`mt-2 text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}>
                    <strong>Error:</strong> {error}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        )}

        {activeTab === "comparator" && (
          <div className="flex-1 min-h-0">
            <JsonComparator isDarkMode={isDarkMode} />
          </div>
        )}
      </div>
    </div>
  )
}
