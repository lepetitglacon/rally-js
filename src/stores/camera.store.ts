import { create } from 'zustand'
import { PerspectiveCamera } from 'three'

export const cameraTypes = ['orbit', 'fly', 'car']

export type CameraType = (typeof cameraTypes)[number]

export interface CameraState {
  camera: PerspectiveCamera | null
  active: CameraType
  setCamera: (cam: CameraType) => void
  setCameraInstance: (camera: PerspectiveCamera) => void
  shifting: boolean
  setShifting: (cam: boolean) => void
  toggleCamera: () => void
}

export const useCameraStore = create<CameraState>(set => ({
  camera: null,
  active: 'orbit',
  shifting: false,
  setCamera: cam => set({ active: cam }),
  setCameraInstance: camera => set({ camera }),
  setShifting: shifting => set({ shifting: shifting }),
  toggleCamera: () =>
    set(state => ({
      active:
        cameraTypes[
          (cameraTypes.indexOf(state.active) + 1) % cameraTypes.length
        ],
    })),
}))
