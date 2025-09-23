import * as THREE from 'three'

export interface HeightmapData {
  heights: number[]
  width: number
  height: number
  minHeight: number
  maxHeight: number
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
  }
}

/**
 * Extrait les hauteurs d'un terrain 3D pour créer une heightmap 2D
 */
export function extractHeightsFromTerrain(
  geometry: THREE.BufferGeometry,
  resolution: number = 64,
): HeightmapData {
  const positionAttribute = geometry.attributes.position
  const vertices = positionAttribute.array

  // Calculer les limites du terrain
  let minX = Infinity,
    maxX = -Infinity
  let minZ = Infinity,
    maxZ = -Infinity
  let minY = Infinity,
    maxY = -Infinity

  // Parcourir tous les vertices pour trouver les limites
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i]
    const y = vertices[i + 1]
    const z = vertices[i + 2]

    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  console.log('Terrain bounds:', { minX, maxX, minZ, maxZ, minY, maxY })

  // Créer une grille de hauteurs
  const stepX = (maxX - minX) / (resolution - 1)
  const stepZ = (maxZ - minZ) / (resolution - 1)
  const heights: number[] = []

  // Pour chaque point de la grille, trouver la hauteur correspondante
  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const worldX = minX + x * stepX
      const worldZ = minZ + z * stepZ

      // Trouver la hauteur à cette position
      const height = getHeightAtPosition(
        vertices,
        worldX,
        worldZ,
        geometry.index?.array,
      )
      heights.push(height)
    }
  }

  return {
    heights,
    width: resolution,
    height: resolution,
    minHeight: minY,
    maxHeight: maxY,
    bounds: { minX, maxX, minZ, maxZ },
  }
}

/**
 * Trouve la hauteur à une position (x, z) donnée en interpolant les triangles
 */
function getHeightAtPosition(
  vertices: ArrayLike<number>,
  x: number,
  z: number,
  indices?: ArrayLike<number>,
): number {
  // Méthode simple : trouver le vertex le plus proche
  let closestHeight = 0
  let closestDistance = Infinity

  if (indices) {
    // Avec indices - parcourir les triangles
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i] * 3
      const i2 = indices[i + 1] * 3
      const i3 = indices[i + 2] * 3

      // Les 3 vertices du triangle
      const v1 = { x: vertices[i1], y: vertices[i1 + 1], z: vertices[i1 + 2] }
      const v2 = { x: vertices[i2], y: vertices[i2 + 1], z: vertices[i2 + 2] }
      const v3 = { x: vertices[i3], y: vertices[i3 + 1], z: vertices[i3 + 2] }

      // Distance au centre du triangle
      const centerX = (v1.x + v2.x + v3.x) / 3
      const centerZ = (v1.z + v2.z + v3.z) / 3
      const distance = Math.sqrt((x - centerX) ** 2 + (z - centerZ) ** 2)

      if (distance < closestDistance) {
        closestDistance = distance
        closestHeight = (v1.y + v2.y + v3.y) / 3 // Hauteur moyenne du triangle
      }
    }
  } else {
    // Sans indices - parcourir les vertices directement
    for (let i = 0; i < vertices.length; i += 3) {
      const vx = vertices[i]
      const vy = vertices[i + 1]
      const vz = vertices[i + 2]

      const distance = Math.sqrt((x - vx) ** 2 + (z - vz) ** 2)
      if (distance < closestDistance) {
        closestDistance = distance
        closestHeight = vy
      }
    }
  }

  return closestHeight
}

/**
 * Convertit les hauteurs en image heightmap (0-255)
 */
export function heightsToImageData(
  heightmapData: HeightmapData,
): { canvas: HTMLCanvasElement; imageData: ImageData } {
  const { heights, width, height: h, minHeight, maxHeight } = heightmapData

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const imageData = ctx.createImageData(width, h)
  const data = imageData.data

  // Normaliser les hauteurs vers 0-255
  const heightRange = maxHeight - minHeight
  for (let i = 0; i < heights.length; i++) {
    const normalizedHeight = (heights[i] - minHeight) / heightRange
    const grayValue = Math.floor(normalizedHeight * 255)

    const pixelIndex = i * 4
    data[pixelIndex] = grayValue // R
    data[pixelIndex + 1] = grayValue // G
    data[pixelIndex + 2] = grayValue // B
    data[pixelIndex + 3] = 255 // A
  }

  ctx.putImageData(imageData, 0, 0)
  return { canvas, imageData }
}

/**
 * Exporte la heightmap en tant qu'image PNG
 */
export function exportHeightmapAsPNG(
  heightmapData: HeightmapData,
  filename: string = 'heightmap.png',
) {
  const { canvas } = heightsToImageData(heightmapData)

  // Créer un lien de téléchargement
  canvas.toBlob(blob => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  })
}