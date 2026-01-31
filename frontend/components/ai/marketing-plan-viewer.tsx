"use client"

import React, { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  FileText, 
  Loader2, 
  Target, 
  Users, 
  Calendar,
  TrendingUp,
  Megaphone,
  CheckCircle2,
  Copy,
  Check,
  Save
} from "lucide-react"

interface MarketingPlanViewerProps {
  plan: string
  brandName?: string
  campaignName?: string
  onSave?: () => void
  collectedInfo?: any
}

export function MarketingPlanViewer({ plan, brandName, campaignName, onSave, collectedInfo }: MarketingPlanViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const decodeEscapedUnicode = (value: string) => {
    return value
      .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
      .replace(/\\x([0-9a-fA-F]{2})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
  }

  const handleExportPDF = async () => {
    if (!contentRef.current) return
    
    setIsExporting(true)
    
    try {
      const { jsPDF } = await import('jspdf')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // PDF settings
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const maxWidth = pageWidth - (margin * 2)
      let y = margin
      
      // Add title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
  const title = decodeEscapedUnicode(campaignName || brandName || 'Marketing Plan')
  pdf.text(title, margin, y)
      y += 10
      
      // Add date
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(128, 128, 128)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, y)
      y += 15
      
      // Reset text color
      pdf.setTextColor(0, 0, 0)
      
      // Process markdown content into lines
  const lines = plan.split('\n')
      
      for (const line of lines) {
        // Check if we need a new page
        if (y > pageHeight - margin) {
          pdf.addPage()
          y = margin
        }
        
  const trimmedLine = decodeEscapedUnicode(line.trim())
        
        // Handle headers
        if (trimmedLine.startsWith('### ')) {
          y += 5
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'bold')
          const text = trimmedLine.replace(/^### /, '')
          pdf.text(text, margin, y)
          y += 7
        } else if (trimmedLine.startsWith('## ')) {
          y += 8
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          const text = trimmedLine.replace(/^## /, '')
          pdf.text(text, margin, y)
          y += 8
        } else if (trimmedLine.startsWith('# ')) {
          y += 10
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          const text = trimmedLine.replace(/^# /, '')
          pdf.text(text, margin, y)
          y += 10
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          // Bullet points
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
          const text = trimmedLine.replace(/^[-*] /, '')
          const splitText = pdf.splitTextToSize(`• ${text}`, maxWidth - 5)
          pdf.text(splitText, margin + 5, y)
          y += splitText.length * 5
        } else if (trimmedLine.match(/^\d+\. /)) {
          // Numbered list
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
          const splitText = pdf.splitTextToSize(trimmedLine, maxWidth - 5)
          pdf.text(splitText, margin + 5, y)
          y += splitText.length * 5
        } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          // Bold text
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          const text = trimmedLine.replace(/\*\*/g, '')
          const splitText = pdf.splitTextToSize(text, maxWidth)
          pdf.text(splitText, margin, y)
          y += splitText.length * 5
        } else if (trimmedLine === '---') {
          // Horizontal rule
          y += 3
          pdf.setDrawColor(200, 200, 200)
          pdf.line(margin, y, pageWidth - margin, y)
          y += 5
        } else if (trimmedLine) {
          // Regular paragraph
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
          // Remove markdown formatting
          const cleanText = trimmedLine
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
          const splitText = pdf.splitTextToSize(cleanText, maxWidth)
          pdf.text(splitText, margin, y)
          y += splitText.length * 5
        } else {
          // Empty line
          y += 3
        }
      }
      
      const fileName = `${campaignName || brandName || 'marketing'}-plan-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('PDF export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plan)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    if (!onSave) return
    
    setIsSaving(true)
    try {
      const apiBase = typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api')
        : ''
      
      const title = campaignName || `${brandName || 'Marketing'} Campaign Plan`
      
      await fetch(`${apiBase}/marketing-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          plan,
          brandName,
          campaignName,
          collectedInfo,
        }),
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (onSave) onSave()
    } catch (error) {
      console.error('Failed to save plan:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {brandName && <Badge variant="outline">{brandName}</Badge>}
          {campaignName && <Badge variant="secondary">{campaignName}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          {onSave && (
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || saved}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Plan
                </>
              )}
            </Button>
          )}
          <Button onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Plan Content */}
      <div 
        ref={contentRef} 
        className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6 overflow-x-hidden"
        style={{ colorScheme: 'light' }}
      >
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Megaphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {campaignName || 'Marketing Campaign Plan'}
          </h1>
          {brandName && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">for {brandName}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Markdown Content with Custom Styling */}
        <div className="prose prose-sm prose-gray dark:prose-invert max-w-none overflow-hidden break-words
          prose-headings:text-gray-900 dark:prose-headings:text-gray-100
          prose-h1:text-xl prose-h1:font-bold prose-h1:border-b prose-h1:pb-2 prose-h1:mb-4
          prose-h2:text-lg prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-h2:flex prose-h2:items-center prose-h2:gap-2
          prose-h3:text-base prose-h3:font-medium prose-h3:mt-4 prose-h3:mb-2
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-2
          prose-ul:my-3 prose-li:my-0.5
          prose-strong:text-gray-900 dark:prose-strong:text-gray-100
          prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:my-3
          prose-table:w-full prose-table:text-sm
          prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2 prose-th:text-left prose-th:font-medium
          prose-td:p-2 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
        ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary flex-shrink-0" />
                  {children}
                </h1>
              ),
              h2: ({ children }) => {
                // Determine icon based on heading content
                const text = String(children).toLowerCase()
                let Icon = FileText
                if (text.includes('objective') || text.includes('goal')) Icon = Target
                else if (text.includes('audience') || text.includes('target')) Icon = Users
                else if (text.includes('timeline') || text.includes('schedule') || text.includes('calendar')) Icon = Calendar
                else if (text.includes('metric') || text.includes('kpi') || text.includes('success')) Icon = TrendingUp
                else if (text.includes('channel') || text.includes('strategy')) Icon = Megaphone
                
                return (
                  <h2 className="flex items-center gap-2 border-b pb-2">
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                    {children}
                  </h2>
                )
              },
              ul: ({ children }) => (
                <ul className="space-y-2 list-none pl-0">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{children}</span>
                </li>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-left font-semibold border border-gray-200 dark:border-gray-700">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">
                  {children}
                </td>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary bg-primary/5 py-3 px-4 my-4 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
                  {children}
                </code>
              ),
            }}
          >
            {plan}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500">
            Generated by NestGPT • SocialNest Marketing Platform
          </p>
        </div>
      </div>
    </div>
  )
}
