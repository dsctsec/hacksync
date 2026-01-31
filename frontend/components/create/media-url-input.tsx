"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Link2 } from "lucide-react"

interface MediaUrlInputProps {
  onUrlAdd: (url: string) => void
}

export function MediaUrlInput({ onUrlAdd }: MediaUrlInputProps) {
  const [url, setUrl] = useState("")

  const handleAdd = () => {
    if (url.trim() && (url.startsWith("http://") || url.startsWith("https://"))) {
      onUrlAdd(url.trim())
      setUrl("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Or use an image URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="media-url" className="text-xs text-muted-foreground">
            Enter a publicly accessible image URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="media-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleAdd} disabled={!url.trim()} size="sm">
              <Link2 className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 Tip: For Facebook posting, use publicly accessible image URLs (e.g., from Unsplash, Imgur, or your own CDN)
        </p>
      </CardContent>
    </Card>
  )
}
