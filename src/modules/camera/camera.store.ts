import { create } from 'zustand'

export const cameraTypes = ['orbit', 'fly', 'car']

export type CameraType = (typeof cameraTypes)[number]

export interface CameraState {
  active: CameraType
  setCamera: (cam: CameraType) => void
  shifting: boolean
  setShifting: (cam: boolean) => void
  toggleCamera: () => void
}

export const useCameraStore = create<CameraState>(set => ({
  active: 'orbit',
  shifting: false,
  setCamera: cam => set({ active: cam }),
  setShifting: shifting => set({ shifting: shifting }),
  toggleCamera: () =>
    set(state => ({
      active:
        cameraTypes[
          (cameraTypes.indexOf(state.active) + 1) % cameraTypes.length
        ],
    })),
}))
