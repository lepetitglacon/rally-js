import {Suspense} from "react";

import Terrain from "@/components/three/stage/Terrain.tsx";
import {Physics} from "@react-three/rapier";
import ChunkManager from "@/components/three/stage/ChunkManager.tsx";
import {useLoader} from "@react-three/fiber";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import mapGltf from '@/assets/gltf/france-besancon-bregille.glb?url';

export default function Stage() {
    const gltf = useLoader(GLTFLoader, mapGltf);



    return <>
        <primitive object={gltf.scene} />
        <ChunkManager />
    </>
}