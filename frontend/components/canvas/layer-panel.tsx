"use client"

import { CanvasLayer } from '@/lib/canvas-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Loader2,
  Image as ImageIcon,
  Type,
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayerPanelProps {
  layers: CanvasLayer[]
  selectedLayerId: string | null
  onLayerSelect: (layerId: string) => void
  onRegenerateLayer: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
  onToggleLock: (layerId: string) => void
  regeneratingLayerId: string | null
}

function getLayerIcon(type: CanvasLayer['type']) {
  switch (type) {
    case 'primary-image':
    case 'icon':
    case 'sticker':
      return <ImageIcon className="h-4 w-4" />
    case 'text':
      return <Type className="h-4 w-4" />
    case 'shape':
      return <Layers className="h-4 w-4" />
    default:
      return <Layers className="h-4 w-4" />
  }
}

function getStatusBadge(layer: CanvasLayer) {
  if (!layer.imageData) return null

  const { generationStatus } = layer.imageData

  switch (generationStatus) {
    case 'pending':
      return <Badge variant="outline" className="text-xs">Pending</Badge>
    case 'generating':
      return (
        <Badge variant="secondary" className="text-xs">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Generating
        </Badge>
      )
    case 'complete':
      return <Badge variant="default" className="text-xs bg-green-600">Ready</Badge>
    case 'error':
      return <Badge variant="destructive" className="text-xs">Error</Badge>
    default:
      return null
  }
}

export function LayerPanel({
  layers,
  selectedLayerId,
  onLayerSelect,
  onRegenerateLayer,
  onToggleVisibility,
  onToggleLock,
  regeneratingLayerId
}: LayerPanelProps) {
  // Sort layers by zIndex (reverse to show top layers first)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Layers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4">
        {sortedLayers.map((layer) => {
          const isSelected = layer.id === selectedLayerId
          const isRegenerating = regeneratingLayerId === layer.id
          const canRegenerate = 
            (layer.type === 'primary-image' || 
             layer.type === 'icon' || 
             layer.type === 'sticker') &&
            !isRegenerating

          return (
            <div
              key={layer.id}
              className={cn(
                "border rounded-lg p-3 transition-all cursor-pointer",
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {getLayerIcon(layer.type)}
                  <span className="text-sm font-medium truncate">{layer.name}</span>
                  {getStatusBadge(layer)}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleVisibility(layer.id)
                    }}
                  >
                    {layer.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLock(layer.id)
                    }}
                  >
                    {layer.locked ? (
                      <Lock className="h-3 w-3" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {canRegenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRegenerateLayer(layer.id)
                  }}
                  disabled={isRegenerating || layer.locked}
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </>
                  )}
                </Button>
              )}

              {layer.imageData?.errorMessage && (
                <p className="text-xs text-destructive mt-2">
                  {layer.imageData.errorMessage}
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
