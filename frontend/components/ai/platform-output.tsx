"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Send } from "lucide-react"
import { useState } from "react"

interface PlatformContent {
  platform: string
  icon: string
  content: string
  hashtags: string[]
}

interface PlatformOutputProps {
  outputs: PlatformContent[]
  onSendToCreate: (content: PlatformContent) => void
}

export function PlatformOutput({ outputs, onSendToCreate }: PlatformOutputProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null)

  const handleCopy = async (platform: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedPlatform(platform)
    setTimeout(() => setCopiedPlatform(null), 2000)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Platform-Specific Output</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={outputs[0]?.platform} className="w-full">
          <TabsList className="w-full bg-secondary">
            {outputs.map((output) => (
              <TabsTrigger key={output.platform} value={output.platform} className="flex-1 text-xs gap-1">
                <span>{output.icon}</span>
                {output.platform}
              </TabsTrigger>
            ))}
          </TabsList>

          {outputs.map((output) => (
            <TabsContent key={output.platform} value={output.platform} className="space-y-3 mt-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm whitespace-pre-wrap">{output.content}</p>
              </div>

              {output.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {output.hashtags.map((hashtag) => (
                    <Badge key={hashtag} variant="secondary" className="text-xs">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleCopy(output.platform, output.content)}
                >
                  {copiedPlatform === output.platform ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button size="sm" className="flex-1" onClick={() => onSendToCreate(output)}>
                  <Send className="h-3 w-3 mr-1" />
                  Send to Create
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export type { PlatformContent }
