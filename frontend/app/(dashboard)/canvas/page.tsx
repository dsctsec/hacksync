"use client"

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { CanvasRenderer } from '@/components/canvas/canvas-renderer'
import { LayerPanel } from '@/components/canvas/layer-panel'
import { PropertiesPanel } from '@/components/canvas/properties-panel'
import { CanvasState, CanvasLayer, CreateCanvasRequest } from '@/lib/canvas-types'
import canvasAPI from '@/lib/canvas-api'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Download,
  Upload,
  Loader2,
  Save,
  Palette,
  Type,
  Square,
  Circle,
  Sparkles
} from 'lucide-react'

export default function CanvasPage() {
  const { toast } = useToast()
  const [canvases, setCanvases] = useState<CanvasState[]>([])
  const [currentCanvas, setCurrentCanvas] = useState<CanvasState | null>(null)
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [regeneratingLayerId, setRegeneratingLayerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAddLayerDialog, setShowAddLayerDialog] = useState(false)
  const [createForm, setCreateForm] = useState<CreateCanvasRequest>({
    name: 'My Brand Poster',
    imagePrompt: '',
    aspectRatio: '1:1',
    brandName: '',
    brandColors: ['#3b82f6', '#ffffff']
  })
  const [imageSource, setImageSource] = useState<'generate' | 'upload'>('generate')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null)
  const [addLayerForm, setAddLayerForm] = useState({
    layerType: 'text' as 'text' | 'shape' | 'icon' | 'sticker',
    name: '',
    text: 'Your text here',
    fontSize: 48,
    color: '#ffffff',
    shapeType: 'rectangle' as 'rectangle' | 'circle' | 'triangle' | 'line',
    fillColor: '#3b82f6',
    strokeColor: '#000000',
    useAI: false,
    aiPrompt: '',
    elementPrompt: '', // For AI-generated elements
  })

  // Load canvases on mount
  useEffect(() => {
    loadCanvases()
  }, [])

  const loadCanvases = async () => {
    try {
      const result = await canvasAPI.listCanvases()
      setCanvases(result.canvases)

      if (result.canvases.length > 0 && !currentCanvas) {
        setCurrentCanvas(result.canvases[0])
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleCreateCanvas = async () => {
    setIsLoading(true)
    try {
      let result
      if (imageSource === 'upload' && uploadedImage) {
        // Create canvas with uploaded image
        result = await canvasAPI.createCanvasWithImage({
          ...createForm,
          imageFile: uploadedImage
        })
      } else {
        // Create canvas with generated image
        result = await canvasAPI.createCanvas(createForm)
      }
      
      setCanvases([...canvases, result.canvas])
      setCurrentCanvas(result.canvas)
      setShowCreateDialog(false)
      
      // Reset form
      setImageSource('generate')
      setUploadedImage(null)
      setUploadedImagePreview(null)
      setCreateForm({
        name: 'My Brand Poster',
        imagePrompt: '',
        aspectRatio: '1:1',
        brandName: '',
        brandColors: ['#3b82f6', '#ffffff']
      })

      toast({
        title: 'Success',
        description: 'Canvas created successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegenerateLayer = async (layerId: string) => {
    if (!currentCanvas) return

    setRegeneratingLayerId(layerId)
    try {
      const result = await canvasAPI.regenerateLayer(currentCanvas.id, layerId)
      setCurrentCanvas(result.canvas)

      toast({
        title: 'Success',
        description: 'Layer regenerated successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setRegeneratingLayerId(null)
    }
  }

  const handleUpdateLayer = async (layerId: string, updates: Partial<CanvasLayer>) => {
    if (!currentCanvas) return

    try {
      const result = await canvasAPI.updateLayer(currentCanvas.id, layerId, updates)
      setCurrentCanvas(result.canvas)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleToggleVisibility = (layerId: string) => {
    if (!currentCanvas) return
    const layer = currentCanvas.layers.find(l => l.id === layerId)
    if (layer) {
      handleUpdateLayer(layerId, { visible: !layer.visible })
    }
  }

  const handleToggleLock = (layerId: string) => {
    if (!currentCanvas) return
    const layer = currentCanvas.layers.find(l => l.id === layerId)
    if (layer) {
      handleUpdateLayer(layerId, { locked: !layer.locked })
    }
  }

  const handleAddLayer = async () => {
    if (!currentCanvas) return

    setIsLoading(true)
    try {
      // If using AI, generate content via Gemini first
      let textContent = addLayerForm.text

      if (addLayerForm.useAI && addLayerForm.aiPrompt && addLayerForm.layerType === 'text') {
        try {
          // Call backend to generate text using Gemini
          const aiResponse = await fetch('http://localhost:3000/api/canvas/generate-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: addLayerForm.aiPrompt,
              context: {
                canvasName: currentCanvas.name,
                brandName: currentCanvas.metadata?.brandName,
              }
            }),
          })

          if (aiResponse.ok) {
            const aiData = await aiResponse.json()
            textContent = aiData.text
          }
        } catch (aiError) {
          // AI generation failed - continue with manual text
        }
      }

      // Handle AI-generated elements (icons/stickers)
      if ((addLayerForm.layerType === 'icon' || addLayerForm.layerType === 'sticker') && addLayerForm.elementPrompt) {
        try {
          const result = await canvasAPI.generateElement(currentCanvas.id, {
            elementType: addLayerForm.layerType,
            prompt: addLayerForm.elementPrompt,
            x: currentCanvas.width * 0.4,
            y: currentCanvas.height * 0.4,
            width: Math.min(currentCanvas.width * 0.2, 200),
            height: Math.min(currentCanvas.height * 0.2, 200),
          })
          setCurrentCanvas(result.canvas)
          setSelectedLayerId(result.layer.id)
          setShowAddLayerDialog(false)

          // Reset form
          setAddLayerForm({
            layerType: 'text',
            name: '',
            text: 'Your text here',
            fontSize: 48,
            color: '#ffffff',
            shapeType: 'rectangle',
            fillColor: '#3b82f6',
            strokeColor: '#000000',
            useAI: false,
            aiPrompt: '',
            elementPrompt: '',
          })

          toast({
            title: 'Success',
            description: 'AI element generated successfully'
          })
          return
        } catch (error: any) {
          toast({
            title: 'Error',
            description: error.message || 'Failed to generate AI element',
            variant: 'destructive'
          })
          return
        }
      }

      const layerData = {
        layerType: addLayerForm.layerType,
        name: addLayerForm.name || `${addLayerForm.layerType === 'text' ? 'Text' : addLayerForm.layerType === 'shape' ? 'Shape' : 'Element'} Layer`,
        ...(addLayerForm.layerType === 'text' ? {
          text: textContent,
          fontSize: addLayerForm.fontSize,
          color: addLayerForm.color,
          x: currentCanvas.width * 0.1,
          y: currentCanvas.height * 0.1,
          width: currentCanvas.width * 0.8,
          height: 100,
        } : addLayerForm.layerType === 'shape' ? {
          shapeType: addLayerForm.shapeType,
          fillColor: addLayerForm.fillColor,
          strokeColor: addLayerForm.strokeColor,
          x: currentCanvas.width * 0.3,
          y: currentCanvas.height * 0.3,
          width: currentCanvas.width * 0.4,
          height: currentCanvas.height * 0.4,
        } : {})
      }

      const result = await canvasAPI.addLayer(currentCanvas.id, layerData)
      setCurrentCanvas(result.canvas)
      setSelectedLayerId(result.layer.id)
      setShowAddLayerDialog(false)

      // Reset form
      setAddLayerForm({
        layerType: 'text',
        name: '',
        text: 'Your text here',
        fontSize: 48,
        color: '#ffffff',
        shapeType: 'rectangle',
        fillColor: '#3b82f6',
        strokeColor: '#000000',
        useAI: false,
        aiPrompt: '',
        elementPrompt: '',
      })

      toast({
        title: 'Success',
        description: 'Layer added successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCanvas = async () => {
    if (!currentCanvas) return

    try {
      const blob = await canvasAPI.exportCanvas(currentCanvas.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentCanvas.name}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Canvas exported successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const selectedLayer = currentCanvas?.layers.find(l => l.id === selectedLayerId) || null

  return (
    <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Brand Poster Canvas
          </h1>
          <p className="text-muted-foreground">
            System canvas with layered image generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Canvas
          </Button>
          {currentCanvas && (
            <>
              <Button onClick={() => setShowAddLayerDialog(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Layer
              </Button>
              <Button variant="outline" onClick={handleExportCanvas} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      {currentCanvas ? (
        <div className="flex-1 grid grid-cols-[250px_1fr_300px] gap-4 min-h-0">
          {/* Left Panel - Layers */}
          <div className="overflow-auto">
            <LayerPanel
              layers={currentCanvas.layers}
              selectedLayerId={selectedLayerId}
              onLayerSelect={setSelectedLayerId}
              onRegenerateLayer={handleRegenerateLayer}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              regeneratingLayerId={regeneratingLayerId}
            />
          </div>

          {/* Center - Canvas */}
          <Card className="flex items-center justify-center p-6 overflow-auto">
            <div className="w-full max-w-[500px] max-h-[700px] flex items-center justify-center">
              <CanvasRenderer
                canvas={currentCanvas}
                selectedLayerId={selectedLayerId}
                onLayerSelect={setSelectedLayerId}
                onLayerUpdate={handleUpdateLayer}
              />
            </div>
          </Card>

          {/* Right Panel - Properties */}
          <div className="overflow-auto">
            <PropertiesPanel
              layer={selectedLayer}
              onUpdateLayer={handleUpdateLayer}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full p-8 text-center">
            <CardContent className="space-y-4">
              <Palette className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-semibold">No Canvas Created</h2>
              <p className="text-muted-foreground">
                Create your first brand poster canvas to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Canvas
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Canvas Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Canvas</DialogTitle>
            <DialogDescription>
              Provide a prompt to generate the primary image for your brand poster
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Canvas Name</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="My Brand Poster"
              />
            </div>

            <div className="space-y-2">
              <Label>Image Source *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={imageSource === 'generate' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setImageSource('generate')
                    setUploadedImage(null)
                    setUploadedImagePreview(null)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
                <Button
                  type="button"
                  variant={imageSource === 'upload' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setImageSource('upload')
                    setCreateForm({ ...createForm, imagePrompt: '' })
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>

            {imageSource === 'generate' ? (
              <div className="space-y-2">
                <Label>Image Prompt *</Label>
                <textarea
                  value={createForm.imagePrompt}
                  onChange={(e) => setCreateForm({ ...createForm, imagePrompt: e.target.value })}
                  placeholder="Describe the image you want to generate (e.g., 'A modern smartphone on a clean white surface with soft lighting and minimal shadows')"
                  className="w-full min-h-[100px] border rounded px-3 py-2 text-sm resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be the main background image. You can add text, shapes, and other elements on top later.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Upload Image *</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {uploadedImagePreview ? (
                      <>
                        <img
                          src={uploadedImagePreview}
                          alt="Preview"
                          className="max-h-48 max-w-full rounded"
                        />
                        <p className="text-sm text-muted-foreground">
                          {uploadedImage?.name}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setUploadedImage(null)
                            setUploadedImagePreview(null)
                          }}
                        >
                          Change Image
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Brand Name (Optional)</Label>
              <Input
                value={createForm.brandName}
                onChange={(e) => setCreateForm({ ...createForm, brandName: e.target.value })}
                placeholder="Your Brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <select
                  value={createForm.aspectRatio}
                  onChange={(e) => setCreateForm({ ...createForm, aspectRatio: e.target.value })}
                  className="w-full h-9 border rounded px-3"
                >
                  <option value="1:1">Square (1:1)</option>
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Primary Brand Color</Label>
                <Input
                  type="color"
                  value={createForm.brandColors?.[0] || '#3b82f6'}
                  onChange={(e) => setCreateForm({
                    ...createForm,
                    brandColors: [e.target.value, createForm.brandColors?.[1] || '#ffffff']
                  })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCanvas}
              disabled={
                isLoading ||
                (imageSource === 'generate' && !createForm.imagePrompt.trim()) ||
                (imageSource === 'upload' && !uploadedImage)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating & Generating Image...
                </>
              ) : (
                'Create Canvas'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Layer Dialog */}
      <Dialog open={showAddLayerDialog} onOpenChange={setShowAddLayerDialog}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Add Layer</DialogTitle>
            <DialogDescription>
              Add a new text, shape, or AI-generated element to your canvas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Layer Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={addLayerForm.layerType === 'text' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setAddLayerForm({ ...addLayerForm, layerType: 'text' })}
                >
                  <Type className="h-4 w-4" />
                  Text
                </Button>
                <Button
                  type="button"
                  variant={addLayerForm.layerType === 'shape' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setAddLayerForm({ ...addLayerForm, layerType: 'shape' })}
                >
                  <Square className="h-4 w-4" />
                  Shape
                </Button>
                <Button
                  type="button"
                  variant={addLayerForm.layerType === 'icon' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setAddLayerForm({ ...addLayerForm, layerType: 'icon' })}
                >
                  <Sparkles className="h-4 w-4" />
                  AI Icon
                </Button>
                <Button
                  type="button"
                  variant={addLayerForm.layerType === 'sticker' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setAddLayerForm({ ...addLayerForm, layerType: 'sticker' })}
                >
                  <Sparkles className="h-4 w-4" />
                  AI Sticker
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Layer Name (Optional)</Label>
              <Input
                value={addLayerForm.name}
                onChange={(e) => setAddLayerForm({ ...addLayerForm, name: e.target.value })}
                placeholder={`${addLayerForm.layerType === 'text' ? 'Text' : addLayerForm.layerType === 'shape' ? 'Shape' : addLayerForm.layerType === 'icon' ? 'Icon' : 'Sticker'} Layer`}
              />
            </div>

            {(addLayerForm.layerType === 'icon' || addLayerForm.layerType === 'sticker') ? (
              <div className="space-y-2">
                <Label>AI Element Prompt *</Label>
                <textarea
                  value={addLayerForm.elementPrompt}
                  onChange={(e) => setAddLayerForm({ ...addLayerForm, elementPrompt: e.target.value })}
                  placeholder={`Describe the ${addLayerForm.layerType === 'icon' ? 'icon' : 'sticker'} you want to generate (e.g., 'a modern rocket icon', 'a cute cat sticker', 'a coffee cup icon')`}
                  className="w-full min-h-[100px] border rounded px-3 py-2 text-sm resize-none"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  AI will generate a {addLayerForm.layerType === 'icon' ? 'small icon' : 'sticker'} that you can drag around the canvas.
                </p>
              </div>
            ) : addLayerForm.layerType === 'text' ? (
              <>
                <div className="flex items-center space-x-2 p-3 border rounded bg-muted/30">
                  <input
                    type="checkbox"
                    id="useAI"
                    checked={addLayerForm.useAI}
                    onChange={(e) => setAddLayerForm({ ...addLayerForm, useAI: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="useAI" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Generate text with AI
                  </label>
                </div>

                {addLayerForm.useAI ? (
                  <div className="space-y-2">
                    <Label>AI Prompt</Label>
                    <textarea
                      value={addLayerForm.aiPrompt}
                      onChange={(e) => setAddLayerForm({ ...addLayerForm, aiPrompt: e.target.value })}
                      placeholder="Describe the text you want (e.g., 'catchy headline for a tech product launch')"
                      className="w-full min-h-[80px] border rounded px-3 py-2 text-sm resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Text Content</Label>
                    <Input
                      value={addLayerForm.text}
                      onChange={(e) => setAddLayerForm({ ...addLayerForm, text: e.target.value })}
                      placeholder="Your text here"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Input
                      type="number"
                      value={addLayerForm.fontSize}
                      onChange={(e) => setAddLayerForm({ ...addLayerForm, fontSize: Number(e.target.value) })}
                      min="12"
                      max="200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      value={addLayerForm.color}
                      onChange={(e) => setAddLayerForm({ ...addLayerForm, color: e.target.value })}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Shape Type</Label>
                  <select
                    value={addLayerForm.shapeType}
                    onChange={(e) => setAddLayerForm({ ...addLayerForm, shapeType: e.target.value as any })}
                    className="w-full h-9 border rounded px-3"
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fill Color</Label>
                    <Input
                      type="color"
                      value={addLayerForm.fillColor}
                      onChange={(e) => setAddLayerForm({ ...addLayerForm, fillColor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stroke Color</Label>
                    <Input
                      type="color"
                      value={addLayerForm.strokeColor}
                      onChange={(e) => setAddLayerForm({ ...addLayerForm, strokeColor: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLayerDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddLayer} 
              disabled={
                isLoading ||
                ((addLayerForm.layerType === 'icon' || addLayerForm.layerType === 'sticker') && !addLayerForm.elementPrompt.trim())
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {addLayerForm.layerType === 'icon' || addLayerForm.layerType === 'sticker' ? 'Generating...' : 'Adding...'}
                </>
              ) : (
                addLayerForm.layerType === 'icon' || addLayerForm.layerType === 'sticker' ? 'Generate Element' : 'Add Layer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
