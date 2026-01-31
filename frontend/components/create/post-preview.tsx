"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Repeat2, ArrowUp, ArrowDown } from "lucide-react"
import type { MediaFile } from "./media-uploader"
import type { RedditPostData } from "./reddit-input"

interface PostPreviewProps {
  selectedPlatforms: string[]
  captions: Record<string, string>
  media: MediaFile[]
  redditData?: RedditPostData
}

export function PostPreview({ selectedPlatforms, captions, media, redditData }: PostPreviewProps) {
  const platformNames: Record<string, string> = {
    instagram: "Instagram",
    twitter: "Twitter/X",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    reddit: "Reddit",
    bluesky: "Bluesky",
  }

  if (selectedPlatforms.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            Select platforms to see preview
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border max-h-max">
      <CardHeader className="">
        <CardTitle className="text-base">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={selectedPlatforms[0]} className="w-full">
          <TabsList className="w-full bg-secondary mb-4">
            {selectedPlatforms.map((platform) => (
              <TabsTrigger key={platform} value={platform} className="flex-1 text-xs">
                {platformNames[platform]}
              </TabsTrigger>
            ))}
          </TabsList>

          {selectedPlatforms.map((platform) => (
            <TabsContent key={platform} value={platform}>
              {platform === "instagram" && <InstagramPreview caption={captions[platform] || ""} media={media} />}
              {platform === "twitter" && <TwitterPreview caption={captions[platform] || ""} media={media} />}
              {platform === "linkedin" && <LinkedInPreview caption={captions[platform] || ""} media={media} />}
              {platform === "facebook" && <FacebookPreview caption={captions[platform] || ""} media={media} />}
              {platform === "reddit" && redditData && <RedditPreview redditData={redditData} media={media} />}
              {platform === "bluesky" && <BlueskyPreview caption={captions[platform] || ""} media={media} />}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function InstagramPreview({ caption, media }: { caption: string; media: MediaFile[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background max-w-[350px] mx-auto">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>SN</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">socialnest</span>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>
      <div className="aspect-square bg-secondary flex items-center justify-center">
        {media[0] ? (
          <img src={media[0].url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted-foreground text-sm">No media</span>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6" />
            <MessageCircle className="h-6 w-6" />
            <Share2 className="h-6 w-6" />
          </div>
          <Bookmark className="h-6 w-6" />
        </div>
        <p className="text-sm">
          <span className="font-medium">socialnest</span>{" "}
          {caption || <span className="text-muted-foreground">Your caption here...</span>}
        </p>
      </div>
    </div>
  )
}

function TwitterPreview({ caption, media }: { caption: string; media: MediaFile[] }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-background max-w-[500px] mx-auto">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm">SocialNest</span>
            <span className="text-muted-foreground text-sm">@socialnest · now</span>
          </div>
          <p className="text-sm mt-1">{caption || <span className="text-muted-foreground">Your tweet here...</span>}</p>
          {media[0] && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <img src={media[0].url || "/placeholder.svg"} alt="" className="w-full aspect-video object-cover" />
            </div>
          )}
          <div className="flex items-center justify-between mt-3 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <Repeat2 className="h-4 w-4" />
            <Heart className="h-4 w-4" />
            <Share2 className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkedInPreview({ caption, media }: { caption: string; media: MediaFile[] }) {
  return (
    <div className="border border-border rounded-lg bg-background max-w-[500px] mx-auto">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>SN</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">SocialNest</p>
            <p className="text-xs text-muted-foreground">AI-Powered Social Media Platform</p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>
        </div>
        <p className="text-sm mt-3">
          {caption || <span className="text-muted-foreground">Your LinkedIn post here...</span>}
        </p>
      </div>
      {media[0] && <img src={media[0].url || "/placeholder.svg"} alt="" className="w-full aspect-video object-cover" />}
      <div className="p-4 flex items-center justify-between border-t border-border">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <ThumbsUp className="h-4 w-4" />
          Like
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          Comment
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Repeat2 className="h-4 w-4" />
          Repost
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Share2 className="h-4 w-4" />
          Send
        </div>
      </div>
    </div>
  )
}

function FacebookPreview({ caption, media }: { caption: string; media: MediaFile[] }) {
  return (
    <div className="border border-border rounded-lg bg-background max-w-[500px] mx-auto">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>SN</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">SocialNest</p>
            <p className="text-xs text-muted-foreground">Just now · Public</p>
          </div>
        </div>
        <p className="text-sm mt-3">
          {caption || <span className="text-muted-foreground">Your Facebook post here...</span>}
        </p>
      </div>
      {media[0] && <img src={media[0].url || "/placeholder.svg"} alt="" className="w-full aspect-video object-cover" />}
      <div className="p-4 flex items-center justify-around border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ThumbsUp className="h-5 w-5" />
          Like
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-5 w-5" />
          Comment
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Share2 className="h-5 w-5" />
          Share
        </div>
      </div>
    </div>
  )
}

function BlueskyPreview({ caption, media }: { caption: string; media: MediaFile[] }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-background max-w-[500px] mx-auto">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm">SocialNest</span>
            <span className="text-muted-foreground text-sm">@socialnest.bsky.social</span>
          </div>
          <p className="text-sm mt-1">{caption || <span className="text-muted-foreground">Your post here...</span>}</p>
          {media[0] && (
            <div className="mt-3 rounded-lg overflow-hidden">
              <img src={media[0].url || "/placeholder.svg"} alt="" className="w-full aspect-video object-cover" />
            </div>
          )}
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <Repeat2 className="h-4 w-4" />
            <Heart className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function RedditPreview({ redditData, media }: { redditData: RedditPostData; media: MediaFile[] }) {
  return (
    <div className="border border-border rounded bg-background max-w-[600px] mx-auto">
      {/* Reddit Post Header */}
      <div className="flex items-start gap-2 p-3 border-b border-border">
        <div className="flex flex-col items-center gap-1 pt-1">
          <ArrowUp className="h-5 w-5 text-muted-foreground hover:text-orange-500 cursor-pointer" />
          <span className="text-xs font-bold">•</span>
          <ArrowDown className="h-5 w-5 text-muted-foreground hover:text-blue-500 cursor-pointer" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="font-medium text-foreground">r/Ettara</span>
            <span>•</span>
            <span>Posted by u/socialnest</span>
            <span>•</span>
            <span>just now</span>
          </div>
          
          {/* Post Title */}
          <h3 className="text-lg font-semibold mb-2">
            {redditData.title || <span className="text-muted-foreground">Your post title...</span>}
          </h3>

          {/* Post Content */}
          {redditData.type === "text" && redditData.text && (
            <p className="text-sm mb-2">{redditData.text}</p>
          )}

          {redditData.type === "link" && redditData.url && (
            <div className="mb-2">
              <a 
                href={redditData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline break-all"
              >
                {redditData.url}
              </a>
            </div>
          )}

          {/* Media Preview */}
          {media[0] && (
            <div className="mb-2 rounded overflow-hidden bg-secondary">
              <img src={media[0].url || "/placeholder.svg"} alt="" className="w-full max-h-[400px] object-contain" />
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-secondary px-2 py-1 rounded">
              <MessageCircle className="h-4 w-4" />
              <span>Comment</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:bg-secondary px-2 py-1 rounded">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:bg-secondary px-2 py-1 rounded">
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
