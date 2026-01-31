"use client"

import { CanvasLayer } from '@/lib/canvas-types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Settings } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface PropertiesPanelProps {
  layer: CanvasLayer | null
  onUpdateLayer: (layerId: string, updates: Partial<CanvasLayer>) => void
}

export function PropertiesPanel({ layer, onUpdateLayer }: PropertiesPanelProps) {
  if (!layer) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a layer to edit its properties</p>
        </CardContent>
      </Card>
    )
  }

  const handleTextChange = (field: string, value: string | number) => {
    if (!layer.textData) return
    
    onUpdateLayer(layer.id, {
      textData: {
        ...layer.textData,
        [field]: value
      }
    })
  }

  const handleShapeChange = (field: string, value: string | number) => {
    if (!layer.shapeData) return
    
    onUpdateLayer(layer.id, {
      shapeData: {
        ...layer.shapeData,
        [field]: value
      }
    })
  }

  const handleOpacityChange = (value: number[]) => {
    onUpdateLayer(layer.id, { opacity: value[0] })
  }

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layer Name */}
        <div className="space-y-2">
          <Label className="text-xs">Layer Name</Label>
          <Input
            value={layer.name}
            onChange={(e) => onUpdateLayer(layer.id, { name: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <Label className="text-xs">Opacity: {Math.round(layer.opacity * 100)}%</Label>
          <Slider
            value={[layer.opacity]}
            onValueChange={handleOpacityChange}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Z-Index */}
        <div className="space-y-2">
          <Label className="text-xs">Layer Order (Z-Index)</Label>
          <Input
            type="number"
            value={layer.zIndex}
            onChange={(e) => onUpdateLayer(layer.id, { zIndex: parseInt(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
        </div>

        {/* Position and Size */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Position & Size</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">X</Label>
              <Input
                type="number"
                value={layer.bounds.x}
                onChange={(e) => onUpdateLayer(layer.id, {
                  bounds: { ...layer.bounds, x: parseInt(e.target.value) || 0 }
                })}
                className="h-7 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={layer.bounds.y}
                onChange={(e) => onUpdateLayer(layer.id, {
                  bounds: { ...layer.bounds, y: parseInt(e.target.value) || 0 }
                })}
                className="h-7 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Width</Label>
              <Input
                type="number"
                value={layer.bounds.width}
                onChange={(e) => onUpdateLayer(layer.id, {
                  bounds: { ...layer.bounds, width: parseInt(e.target.value) || 0 }
                })}
                className="h-7 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Height</Label>
              <Input
                type="number"
                value={layer.bounds.height}
                onChange={(e) => onUpdateLayer(layer.id, {
                  bounds: { ...layer.bounds, height: parseInt(e.target.value) || 0 }
                })}
                className="h-7 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Text Properties */}
        {layer.textData && (
          <>
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs font-semibold">Text Properties</Label>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Text Content</Label>
                <Textarea
                  value={layer.textData.text}
                  onChange={(e) => handleTextChange('text', e.target.value)}
                  className="min-h-[60px] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Font Size</Label>
                  <Input
                    type="number"
                    value={layer.textData.fontSize}
                    onChange={(e) => handleTextChange('fontSize', parseInt(e.target.value) || 12)}
                    className="h-7 text-sm"
                    min="8"
                    max="300"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <Input
                    type="color"
                    value={layer.textData.color}
                    onChange={(e) => handleTextChange('color', e.target.value)}
                    className="h-7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Family</Label>
                  <select
                    value={layer.textData.fontFamily}
                    onChange={(e) => handleTextChange('fontFamily', e.target.value)}
                    className="w-full h-7 text-sm border rounded px-2"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Impact">Impact</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Font Weight</Label>
                  <select
                    value={layer.textData.fontWeight}
                    onChange={(e) => handleTextChange('fontWeight', e.target.value)}
                    className="w-full h-7 text-sm border rounded px-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Alignment</Label>
                <select
                  value={layer.textData.align}
                  onChange={(e) => handleTextChange('align', e.target.value)}
                  className="w-full h-7 text-sm border rounded px-2"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              {layer.textData.lineHeight !== undefined && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Line Height</Label>
                  <Input
                    type="number"
                    value={layer.textData.lineHeight}
                    onChange={(e) => handleTextChange('lineHeight', parseFloat(e.target.value) || 1.2)}
                    className="h-7 text-sm"
                    min="0.5"
                    max="3"
                    step="0.1"
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Image Properties */}
        {layer.imageData && (
          <div className="border-t pt-4 space-y-3">
            <Label className="text-xs font-semibold">Image Properties</Label>
            
            {layer.imageData.imageUrl && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <img 
                  src={layer.imageData.imageUrl} 
                  alt="Layer preview" 
                  className="w-full rounded border"
                />
              </div>
            )}

            {layer.imageData.userPrompt && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Image Prompt (Used)</Label>
                <Textarea
                  value={layer.imageData.userPrompt}
                  readOnly
                  className="min-h-[60px] text-xs bg-muted"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="text-xs">
                {layer.imageData.generationStatus === 'complete' && '✓ Generated'}
                {layer.imageData.generationStatus === 'generating' && '⏳ Generating...'}
                {layer.imageData.generationStatus === 'pending' && '⏸️ Pending'}
                {layer.imageData.generationStatus === 'error' && '❌ Error'}
              </div>
            </div>
          </div>
        )}

        {/* Shape Properties */}
        {layer.shapeData && (
          <div className="border-t pt-4 space-y-3">
            <Label className="text-xs font-semibold">Shape Properties</Label>
            
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Shape Type</Label>
              <select
                value={layer.shapeData.shapeType}
                onChange={(e) => handleShapeChange('shapeType', e.target.value)}
                className="w-full h-7 text-sm border rounded px-2"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
                <option value="line">Line</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Fill Color</Label>
                <Input
                  type="color"
                  value={layer.shapeData.fillColor}
                  onChange={(e) => handleShapeChange('fillColor', e.target.value)}
                  className="h-7"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Stroke Color</Label>
                <Input
                  type="color"
                  value={layer.shapeData.strokeColor || '#000000'}
                  onChange={(e) => handleShapeChange('strokeColor', e.target.value)}
                  className="h-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Stroke Width</Label>
              <Input
                type="number"
                value={layer.shapeData.strokeWidth || 0}
                onChange={(e) => handleShapeChange('strokeWidth', parseInt(e.target.value) || 0)}
                min="0"
                max="20"
                className="h-7 text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
