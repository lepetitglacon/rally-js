import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
const root = null

self.onmessage = async e => {
  self.postMessage(e.data)
  // const { url, chunkId } = e.data
  //
  // // charge une seule fois le GLB
  // if (!root) {
  //   root = await new Promise((resolve, reject) => {
  //     loader.load(url, gltf => resolve(gltf.scene), undefined, reject)
  //   })
  // }
  //
  // // suppose que chaque mesh est nommée "chunk_x_z"
  // const mesh = root.getObjectByName(`chunk_${chunkId.x}_${chunkId.z}`)
  // if (!mesh) {
  //   self.postMessage({ error: 'not found', chunkId })
  //   return
  // }
  //
  // const json = mesh.toJSON()
  // self.postMessage({ json, chunkId })
}

export default {}
