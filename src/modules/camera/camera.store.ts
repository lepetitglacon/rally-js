import { create } from 'zustand'

export const cameraTypes = ['orbit', 'fly', 'car']

export type CameraType = typeof cameraTypes[number]

export interface CameraState {
    active: CameraType
    setCamera: (cam: CameraType) => void
    toggleCamera: () => void
}

export const useCameraStore = create<CameraState>(set => ({
    active: 'orbit',
    setCamera: cam => set({ active: cam }),
    toggleCamera: () => set(state => ({
        active: cameraTypes[(cameraTypes.indexOf(state.active) + 1) % cameraTypes.length]
    }))
}))