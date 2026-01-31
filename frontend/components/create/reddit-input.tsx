"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface RedditPostData {
  title: string
  text?: string
  url?: string
  type: "text" | "link"
}

interface RedditInputProps {
  value: RedditPostData
  onChange: (value: RedditPostData) => void
}

export function RedditInput({ value, onChange }: RedditInputProps) {
  const titleLimit = 300
  const textLimit = 40000
  const titleCount = value.title.length
  const textCount = value.text?.length || 0

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-secondary/20">
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="20"
          height="20"
          viewBox="0 0 48 48"
        >
          <path
            fill="#FFF"
            d="M12.193 19.555c-1.94-1.741-4.79-1.727-6.365.029-1.576 1.756-1.301 5.023.926 6.632L12.193 19.555zM35.807 19.555c1.939-1.741 4.789-1.727 6.365.029 1.575 1.756 1.302 5.023-.927 6.632L35.807 19.555zM38.32 6.975A3.5 3.5 0 1 0 38.32 13.975 3.5 3.5 0 1 0 38.32 6.975z"
          ></path>
          <path
            fill="#FFF"
            d="M24.085 15.665000000000001A18.085 12.946 0 1 0 24.085 41.557A18.085 12.946 0 1 0 24.085 15.665000000000001Z"
          ></path>
          <g>
            <path
              fill="#D84315"
              d="M30.365 23.506A2.884 2.884 0 1 0 30.365 29.274 2.884 2.884 0 1 0 30.365 23.506zM17.635 23.506A2.884 2.884 0 1 0 17.635 29.274 2.884 2.884 0 1 0 17.635 23.506z"
            ></path>
          </g>
          <g>
            <path
              fill="#37474F"
              d="M24.002 34.902c-3.252 0-6.14-.745-8.002-1.902 1.024 2.044 4.196 4 8.002 4 3.802 0 6.976-1.956 7.998-4C30.143 34.157 27.254 34.902 24.002 34.902zM41.83 27.026l-1.17-1.621c.831-.6 1.373-1.556 1.488-2.623.105-.98-.157-1.903-.721-2.531-.571-.637-1.391-.99-2.307-.994-.927.013-1.894.365-2.646 1.041l-1.336-1.488c1.123-1.008 2.545-1.523 3.991-1.553 1.488.007 2.833.596 3.786 1.658.942 1.05 1.387 2.537 1.221 4.081C43.961 24.626 43.121 26.096 41.83 27.026zM6.169 27.026c-1.29-.932-2.131-2.401-2.306-4.031-.166-1.543.279-3.03 1.221-4.079.953-1.062 2.297-1.651 3.785-1.658.009 0 .018 0 .027 0 1.441 0 2.849.551 3.965 1.553l-1.336 1.488c-.753-.676-1.689-1.005-2.646-1.041-.916.004-1.735.357-2.306.994-.563.628-.826 1.55-.721 2.53.115 1.067.657 2.023 1.488 2.624L6.169 27.026zM25 16.84h-2c0-2.885 0-10.548 4.979-10.548 2.154 0 3.193 1.211 3.952 2.096.629.734.961 1.086 1.616 1.086h1.37v2h-1.37c-1.604 0-2.453-.99-3.135-1.785-.67-.781-1.198-1.398-2.434-1.398C25.975 8.292 25 11.088 25 16.84z"
            ></path>
            <path
              fill="#37474F"
              d="M24.085 16.95c9.421 0 17.085 5.231 17.085 11.661 0 6.431-7.664 11.662-17.085 11.662S7 35.042 7 28.611C7 22.181 14.664 16.95 24.085 16.95M24.085 14.95C13.544 14.95 5 21.066 5 28.611c0 7.546 8.545 13.662 19.085 13.662 10.54 0 19.085-6.116 19.085-13.662C43.17 21.066 34.625 14.95 24.085 14.95L24.085 14.95zM38.32 7.975c1.379 0 2.5 1.122 2.5 2.5s-1.121 2.5-2.5 2.5-2.5-1.122-2.5-2.5S36.941 7.975 38.32 7.975M38.32 5.975c-2.484 0-4.5 2.015-4.5 4.5s2.016 4.5 4.5 4.5c2.486 0 4.5-2.015 4.5-4.5S40.807 5.975 38.32 5.975L38.32 5.975z"
            ></path>
          </g>
        </svg>
        <Label className="text-sm font-medium">Reddit Post</Label>
        <Badge variant="secondary" className="text-xs">r/Ettara</Badge>
      </div>

      {/* Post Type Selection */}
      <div className="space-y-2">
        <Label className="text-sm">Post Type</Label>
        <RadioGroup
          value={value.type}
          onValueChange={(type) => onChange({ ...value, type: type as "text" | "link" })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="text" id="text" />
            <Label htmlFor="text" className="text-sm font-normal cursor-pointer">Text Post</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="link" id="link" />
            <Label htmlFor="link" className="text-sm font-normal cursor-pointer">Link Post</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Title *</Label>
          <Badge variant={titleCount > titleLimit ? "destructive" : "secondary"} className="text-xs">
            {titleCount} / {titleLimit}
          </Badge>
        </div>
        <Input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Enter an interesting title for your post"
          className="bg-secondary/50"
        />
      </div>

      {/* Conditional Content based on type */}
      {value.type === "text" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Text Content (Optional)</Label>
            <Badge variant={textCount > textLimit ? "destructive" : "secondary"} className="text-xs">
              {textCount} / {textLimit}
            </Badge>
          </div>
          <Textarea
            value={value.text || ""}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
            placeholder="Write your post content here..."
            className="min-h-[120px] resize-none bg-secondary/50"
          />
        </div>
      )}

      {value.type === "link" && (
        <div className="space-y-2">
          <Label className="text-sm">URL *</Label>
          <Input
            value={value.url || ""}
            onChange={(e) => onChange({ ...value, url: e.target.value })}
            placeholder="https://example.com"
            type="url"
            className="bg-secondary/50"
          />
        </div>
      )}
    </div>
  )
}
