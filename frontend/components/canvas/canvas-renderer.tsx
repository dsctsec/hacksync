"use client"

import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Rect, Image as KonvaImage, Text, Circle, Line } from 'react-konva'
import { CanvasState, CanvasLayer } from '@/lib/canvas-types'
import useImage from 'use-image'

interface CanvasRendererProps {
  canvas: CanvasState
  selectedLayerId: string | null
  onLayerSelect: (layerId: string) => void
  onLayerUpdate?: (layerId: string, updates: Partial<CanvasLayer>) => void
  scale?: number
}

// Component to render an image layer
function ImageLayerRenderer({ layer, isSelected, onClick, onDragEnd, canvasWidth, canvasHeight }: { 
  layer: CanvasLayer; 
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (e: any) => void;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const [image] = useImage(layer.imageData?.imageUrl || '', 'anonymous')
  
  // For primary image, ensure it fills the canvas bounds
  let imageBounds = layer.bounds
  if (layer.type === 'primary-image' && image) {
    // Calculate aspect ratio of the image
    const imageAspect = image.width / image.height
    const canvasAspect = canvasWidth / canvasHeight
    
    let width = canvasWidth
    let height = canvasHeight
    let x = 0
    let y = 0
    
    // Fit image to canvas while maintaining aspect ratio (cover mode)
    if (imageAspect > canvasAspect) {
      // Image is wider - fit to height
      height = canvasHeight
      width = height * imageAspect
      x = (canvasWidth - width) / 2
    } else {
      // Image is taller - fit to width
      width = canvasWidth
      height = width / imageAspect
      y = (canvasHeight - height) / 2
    }
    
    imageBounds = { x, y, width, height }
  }
  
  return (
    <>
      <KonvaImage
        image={image}
        x={imageBounds.x}
        y={imageBounds.y}
        width={imageBounds.width}
        height={imageBounds.height}
        opacity={layer.opacity}
        visible={layer.visible}
        listening={!layer.locked && layer.type !== 'primary-image'}
        draggable={!layer.locked && layer.type !== 'primary-image'}
        onClick={onClick}
        onTap={onClick}
        onDragEnd={onDragEnd}
      />
      {isSelected && (
        <Rect
          x={imageBounds.x}
          y={imageBounds.y}
          width={imageBounds.width}
          height={imageBounds.height}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[10, 5]}
          listening={false}
        />
      )}
    </>
  )
}

// Component to render a text layer
function TextLayerRenderer({ layer, isSelected, onClick, onDragEnd }: { 
  layer: CanvasLayer; 
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (e: any) => void;
}) {
  if (!layer.textData) return null

  return (
    <>
      <Text
        text={layer.textData.text}
        x={layer.bounds.x}
        y={layer.bounds.y}
        width={layer.bounds.width}
        height={layer.bounds.height}
        fontSize={layer.textData.fontSize}
        fontFamily={layer.textData.fontFamily}
        fontStyle={layer.textData.fontWeight}
        fill={layer.textData.color}
        align={layer.textData.align}
        verticalAlign="middle"
        opacity={layer.opacity}
        visible={layer.visible}
        listening={!layer.locked}
        draggable={!layer.locked}
        onClick={onClick}
        onTap={onClick}
        onDragEnd={onDragEnd}
      />
      {isSelected && (
        <Rect
          x={layer.bounds.x}
          y={layer.bounds.y}
          width={layer.bounds.width}
          height={layer.bounds.height}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[10, 5]}
          listening={false}
        />
      )}
    </>
  )
}

// Component to render a shape layer
function ShapeLayerRenderer({ layer, isSelected, onClick, onDragEnd }: { 
  layer: CanvasLayer; 
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (e: any) => void;
}) {
  if (!layer.shapeData) return null

  const shapeData = layer.shapeData

  const commonProps = {
    opacity: layer.opacity,
    visible: layer.visible,
    listening: !layer.locked,
    draggable: !layer.locked,
    onClick,
    onTap: onClick,
    onDragEnd,
    fill: shapeData.fillColor,
    stroke: shapeData.strokeColor,
    strokeWidth: shapeData.strokeWidth || 0,
  }

  const renderShape = () => {
    switch (shapeData.shapeType) {
      case 'rectangle':
        return (
          <Rect
            x={layer.bounds.x}
            y={layer.bounds.y}
            width={layer.bounds.width}
            height={layer.bounds.height}
            {...commonProps}
          />
        )
      case 'circle':
        return (
          <Circle
            x={layer.bounds.x + layer.bounds.width / 2}
            y={layer.bounds.y + layer.bounds.height / 2}
            radius={Math.min(layer.bounds.width, layer.bounds.height) / 2}
            {...commonProps}
          />
        )
      case 'triangle':
        const centerX = layer.bounds.x + layer.bounds.width / 2
        const topY = layer.bounds.y
        const bottomY = layer.bounds.y + layer.bounds.height
        const leftX = layer.bounds.x
        const rightX = layer.bounds.x + layer.bounds.width
        return (
          <Line
            points={[centerX, topY, rightX, bottomY, leftX, bottomY]}
            closed
            {...commonProps}
          />
        )
      case 'line':
        return (
          <Line
            points={[
              layer.bounds.x, 
              layer.bounds.y, 
              layer.bounds.x + layer.bounds.width, 
              layer.bounds.y + layer.bounds.height
            ]}
            {...commonProps}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Rect
          x={layer.bounds.x}
          y={layer.bounds.y}
          width={layer.bounds.width}
          height={layer.bounds.height}
          stroke="#3b82f6"
          strokeWidth={2}
          dash={[10, 5]}
          listening={false}
        />
      )}
    </>
  )
}

export function CanvasRenderer({ 
  canvas, 
  selectedLayerId, 
  onLayerSelect,
  onLayerUpdate,
  scale = 1 
}: CanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 })

  const handleDragEnd = (layerId: string, e: any) => {
    if (!onLayerUpdate) return
    
    const layer = canvas.layers.find(l => l.id === layerId)
    if (!layer) return

    const scaleX = canvas.width / dimensions.width
    const scaleY = canvas.height / dimensions.height

    onLayerUpdate(layerId, {
      bounds: {
        ...layer.bounds,
        x: e.target.x() * scaleX,
        y: e.target.y() * scaleY,
      }
    })
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const aspectRatio = canvas.width / canvas.height
        const scaledHeight = containerWidth / aspectRatio
        
        setDimensions({
          width: containerWidth,
          height: scaledHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [canvas.width, canvas.height])

  const scaleX = dimensions.width / canvas.width
  const scaleY = dimensions.height / canvas.height

  // Sort layers by zIndex
  const sortedLayers = [...canvas.layers].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage width={dimensions.width} height={dimensions.height} scale={{ x: scaleX * scale, y: scaleY * scale }}>
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={canvas.width}
            height={canvas.height}
            fill={canvas.backgroundColor}
          />

          {/* Render all layers */}
          {sortedLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId
            
            // Render image layers (primary-image, icon, sticker)
            if (layer.type === 'primary-image' || layer.type === 'icon' || layer.type === 'sticker') {
              return (
                <ImageLayerRenderer
                  key={layer.id}
                  layer={layer}
                  isSelected={isSelected}
                  onClick={() => onLayerSelect(layer.id)}
                  onDragEnd={(e) => handleDragEnd(layer.id, e)}
                  canvasWidth={canvas.width}
                  canvasHeight={canvas.height}
                />
              )
            } 
            
            // Render text layers
            if (layer.type === 'text') {
              return (
                <TextLayerRenderer
                  key={layer.id}
                  layer={layer}
                  isSelected={isSelected}
                  onClick={() => onLayerSelect(layer.id)}
                  onDragEnd={(e) => handleDragEnd(layer.id, e)}
                />
              )
            }
            
            // Render shape layers
            if (layer.type === 'shape') {
              return (
                <ShapeLayerRenderer
                  key={layer.id}
                  layer={layer}
                  isSelected={isSelected}
                  onClick={() => onLayerSelect(layer.id)}
                  onDragEnd={(e) => handleDragEnd(layer.id, e)}
                />
              )
            }
            
            return null
          })}
        </Layer>
      </Stage>
    </div>
  )
}
