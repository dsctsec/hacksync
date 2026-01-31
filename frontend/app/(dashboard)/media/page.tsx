"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Upload,
  Grid3X3,
  List,
  MoreHorizontal,
  ImageIcon,
  Video,
  Folder,
  Trash2,
  Download,
  Link,
  Copy,
  Tag,
  Play,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaItem {
  id: string
  type: "image" | "video"
  name: string
  url: string
  thumbnail?: string
  size: string
  uploadedAt: string
  tags: string[]
}

const mediaItems: MediaItem[] = [
  {
    id: "0",
    type: "video",
    name: "gen.mp4",
    url: "/sample_0.mp4",
    thumbnail: "/video-thumb.jpg",
    size: "12.5 MB",
    uploadedAt: "Jan 15, 2026",
    tags: ["featured", "promo"],
  },
  {
    id: "1",
    type: "image",
    name: "product-launch-hero.jpg",
    url: "/product-launch-hero-image.jpg",
    size: "2.4 MB",
    uploadedAt: "Jan 15, 2026",
    tags: ["facebook", "social"],
  },
  {
    id: "2",
    type: "image",
    name: "coffee.jpg",
    url: "/coffee.jpg",
    size: "3.1 MB",
    uploadedAt: "Jan 14, 2026",
    tags: ["facebook", "social"],
  },
  {
    id: "4",
    type: "image",
    name: "social-banner.png",
    url: "/coffee-3.jpg",
    size: "1.8 MB",
    uploadedAt: "Jan 12, 2026",
    tags: ["facebook", "social"],
  },
  {
    id: "5",
    type: "image",
    name: "coffee2.png",
    url: "/coffee-2.jpg",
    size: "2.2 MB",
    uploadedAt: "Jan 11, 2026",
    tags: ["facebook", "social"],
  },
  {
    id: "6",
    type: "image",
    name: "coffee4.png",
    url: "/coffee-4.jpg",
    size: "0.8 MB",
    uploadedAt: "Jan 10, 2026",
    tags: ["facebook", "social"],
  },
]

export default function MediaLibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  const filteredItems = mediaItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const openPreview = (item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewItem(item)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage and organize your media assets</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>Drag and drop files or browse to upload</DialogDescription>
            </DialogHeader>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
              <Button variant="outline">Browse Files</Button>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Link className="h-4 w-4 mr-2" />
                Giphy
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <Folder className="h-4 w-4 mr-2" />
                Dropbox
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <ImageIcon className="h-4 w-4 mr-2" />
                Canva
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or tag..."
            className="pl-9 bg-secondary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList className="bg-secondary">
              <TabsTrigger value="grid">
                <Grid3X3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {selectedItems.length > 0 && (
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "group cursor-pointer overflow-hidden bg-card border-border",
                selectedItems.includes(item.id) && "ring-2 ring-primary",
              )}
              onClick={() => toggleSelection(item.id)}
            >
              <div className="aspect-square relative bg-secondary h-44 scale-[140%]">
                <img
                  src={item.type === "video" ? (item.thumbnail || "/placeholder.svg") : (item.url || "/placeholder.svg")}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.type === "video" && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                    onClick={(e) => openPreview(item, e)}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="h-6 w-6 text-black ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.type === "video" && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}>
                          <Play className="h-4 w-4 mr-2" />
                          Play video
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Tag className="h-4 w-4 mr-2" />
                        Edit tags
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.size}</p>
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-secondary/50 cursor-pointer",
                    selectedItems.includes(item.id) && "bg-primary/5",
                  )}
                  onClick={() => toggleSelection(item.id)}
                >
                  <div className="h-16 w-16 rounded bg-secondary overflow-hidden shrink-0 relative">
                    <img
                      src={item.type === "video" ? (item.thumbnail || "/placeholder.svg") : (item.url || "/placeholder.svg")}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.type === "video" && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50"
                        onClick={(e) => openPreview(item, e)}
                      >
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{item.name}</p>
                      {item.type === "video" && (
                        <Badge variant="outline" className="text-xs">
                          <Video className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.size} • {item.uploadedAt}
                    </p>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.type === "video" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => openPreview(item, e)}
                      className="shrink-0"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.type === "video" && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}>
                          <Play className="h-4 w-4 mr-2" />
                          Play video
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black">
          <DialogHeader className="sr-only">
            <DialogTitle>{previewItem?.name || "Media Preview"}</DialogTitle>
            <DialogDescription>Preview of {previewItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setPreviewItem(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Video player */}
            {previewItem?.type === "video" && (
              <video
                src={previewItem.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            )}

            {/* Image preview */}
            {previewItem?.type === "image" && (
              <img
                src={previewItem.url}
                alt={previewItem.name}
                className="w-full max-h-[80vh] object-contain"
              />
            )}
          </div>

          {/* Video info bar */}
          <div className="bg-background p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{previewItem?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {previewItem?.size} • {previewItem?.uploadedAt}
                </p>
              </div>
              <div className="flex gap-2">
                {previewItem?.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
