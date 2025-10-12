import { useEffect, useState } from 'react'
import type { Mesh } from 'three'
import * as THREE from 'three'

export type HeightmapData = {
  heights: number[][]
  elementSize: number
}

export type UseHeightmapDataProps = {
  imagePath: string
  width: number
  height: number
  resolution: number
  imageWidth: number
  imageHeight: number
}

export const useHeightmapData = ({
  imagePath = '/maps/france/besancon/bregille/heightmap.png',
  width = 2048,
  height = 2048,
  elementSize = 1,
  resolution = 32,
  imageWidth = 512,
  imageHeight = 512,
}): HeightmapData => {
  const [heightData, setHeightData] = useState<HeightmapData>({
    heights: [[0]],
    elementSize: 0,
  })

  useEffect(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()

    img.onload = () => {
      canvas.width = imageWidth
      canvas.height = imageHeight

      // Dessiner et redimensionner l'image
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight)

      // Extraire les données pixel
      const imageData = ctx.getImageData(0, 0, imageWidth, imageHeight)
      const heights = extractHeightData(imageData, imageWidth, imageHeight)

      setHeightData({
        heights,
        elementSize: elementSize, // Taille d'un élément en unités world
      })
    }

    img.src = imagePath
  }, [imagePath, resolution, elementSize, imageWidth, imageHeight])

  return heightData
}

// Fonction utilitaire pour extraire les hauteurs de l'image
const extractHeightData = (
  imageData: ImageData,
  width: number,
  height: number,
) => {
  const heights = []

  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4 // RGBA
      // Utiliser le canal rouge (ou moyenne RGB si couleur)
      const gray = imageData.data[index] // 0-255
      const heightValue = (gray / 255) * 50
      row.push(heightValue)
    }
    heights.push(row)
  }

  return heights
}

export const meshToHeightmap = (mesh: Mesh, nx = 128, nz = 64) => {
  mesh.updateMatrixWorld()
  const geom = mesh.geometry
  const posAttr = geom.attributes.position

  const bbox = new THREE.Box3().setFromObject(mesh)
  const size = new THREE.Vector3()
  bbox.getSize(size)

  const dx = size.x / (nx - 1)
  const dz = size.z / (nz - 1)

  const grid = Array.from({ length: nx }, () => Array(nz).fill(bbox.min.y))

  const v = new THREE.Vector3()
  for (let i = 0; i < posAttr.count; i++) {
    v.fromBufferAttribute(posAttr, i)
    v.applyMatrix4(mesh.matrixWorld)

    const gx = Math.floor((v.x - bbox.min.x) / dx)
    const gz = Math.floor((v.z - bbox.min.z) / dz)

    if (gx >= 0 && gx < nx && gz >= 0 && gz < nz) {
      grid[gx][gz] = Math.max(grid[gx][gz], v.y)
    }
  }

  return { heights: grid, elementSize: dx }
}
