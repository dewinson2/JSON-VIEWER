"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface JsonViewerProps {
  data: any
  level?: number
  isLast?: boolean
  parentKey?: string
  expandAll?: boolean
}

export function JsonViewer({ data, level = 0, isLast = true, parentKey, expandAll = false }: JsonViewerProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (expandAll !== undefined) {
      const newCollapsed: Record<string, boolean> = {}
      const setAllCollapsed = (obj: any, prefix = "") => {
        if (typeof obj === "object" && obj !== null) {
          Object.keys(obj).forEach((key) => {
            const fullKey = prefix ? `${prefix}.${key}` : key
            newCollapsed[fullKey] = !expandAll
            if (typeof obj[key] === "object" && obj[key] !== null) {
              setAllCollapsed(obj[key], fullKey)
            }
          })
        }
      }
      setAllCollapsed(data, parentKey)
      setCollapsed(newCollapsed)
    }
  }, [expandAll, data, parentKey])

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const renderValue = (value: any, key: string, index: number, array: any[]) => {
    const isLastItem = index === array.length - 1
    const fullKey = parentKey ? `${parentKey}.${key}` : key

    if (value === null) {
      return (
        <div className="flex items-center">
          <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">"{key}":</span>
          <span className="text-gray-500 italic">null</span>
          {!isLastItem && <span className="text-gray-400">,</span>}
        </div>
      )
    }

    if (typeof value === "string") {
      return (
        <div className="flex items-center">
          <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">"{key}":</span>
          <span className="text-green-600 dark:text-green-400">"{value}"</span>
          {!isLastItem && <span className="text-gray-400">,</span>}
        </div>
      )
    }

    if (typeof value === "number") {
      return (
        <div className="flex items-center">
          <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">"{key}":</span>
          <span className="text-orange-600 dark:text-orange-400">{value}</span>
          {!isLastItem && <span className="text-gray-400">,</span>}
        </div>
      )
    }

    if (typeof value === "boolean") {
      return (
        <div className="flex items-center">
          <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">"{key}":</span>
          <span className="text-purple-600 dark:text-purple-400">{value.toString()}</span>
          {!isLastItem && <span className="text-gray-400">,</span>}
        </div>
      )
    }

    if (Array.isArray(value)) {
      const isCollapsed = collapsed[fullKey]
      return (
        <div>
          <div className="flex items-center">
            <button
              onClick={() => toggleCollapse(fullKey)}
              className="flex items-center hover:bg-muted rounded p-1 -ml-1"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">"{key}":</span>
            <span className="text-gray-600 dark:text-gray-400">
              [{value.length} {value.length === 1 ? "elemento" : "elementos"}]
            </span>
            {!isLastItem && <span className="text-gray-400">,</span>}
          </div>
          {!isCollapsed && (
            <div className="ml-6 border-l border-gray-200 dark:border-gray-700 pl-4 mt-2">
              {value.map((item, idx) => (
                <div key={idx} className="mb-1">
                  <JsonViewer
                    data={{ [`[${idx}]`]: item }}
                    level={level + 1}
                    isLast={idx === value.length - 1}
                    parentKey={fullKey}
                    expandAll={expandAll}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object") {
      const keys = Object.keys(value)
      const isCollapsed = collapsed[fullKey]
      return (
        <div>
          <div className="flex items-center">
            <button
              onClick={() => toggleCollapse(fullKey)}
              className="flex items-center hover:bg-muted rounded p-1 -ml-1"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">"{key}":</span>
            <span className="text-gray-600 dark:text-gray-400">
              {"{"}...{"}"}
            </span>
            {!isLastItem && <span className="text-gray-400">,</span>}
          </div>
          {!isCollapsed && (
            <div className="ml-6 border-l border-gray-200 dark:border-gray-700 pl-4 mt-2">
              <JsonViewer data={value} level={level + 1} isLast={true} parentKey={fullKey} expandAll={expandAll} />
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center">
        <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">"{key}":</span>
        <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>
        {!isLastItem && <span className="text-gray-400">,</span>}
      </div>
    )
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-1">
        {data.map((item, index) => (
          <div key={index}>
            <JsonViewer
              data={{ [`[${index}]`]: item }}
              level={level}
              isLast={index === data.length - 1}
              parentKey={parentKey}
              expandAll={expandAll}
            />
          </div>
        ))}
      </div>
    )
  }

  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data)
    return (
      <div className="space-y-1">
        {entries.map(([key, value], index) => (
          <div key={key}>{renderValue(value, key, index, entries)}</div>
        ))}
      </div>
    )
  }

  return <div className="text-gray-600 dark:text-gray-400">{String(data)}</div>
}
