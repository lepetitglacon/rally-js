import * as THREE from "three";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Physics, RigidBody, HeightfieldCollider } from "@react-three/rapier";
import {Suspense, useMemo} from "react";
import mapGltf from "@/assets/gltf/france-besancon-bregille.glb?url"
import heightmapPng from "@/assets/heightmap.png?url"

export default function Terrain() {
    const gltf = useLoader(GLTFLoader, mapGltf);
    const heightmapTexture = useLoader(THREE.TextureLoader, heightmapPng);

    const heights = useMemo(() => {
        if (!heightmapTexture.image) return null;

        const width = heightmapTexture.image.width;
        const height = heightmapTexture.image.height;

        const heightData = processHeightmapImage(heightmapTexture.image);

        const scale = 16
        return [width, height, heightData.heights, {x: width/scale, y: 1, z: height/scale}];
    }, [heightmapTexture]);

    return (
        <Suspense>
            {/* Visual mesh */}
            <primitive object={gltf.scene} />

            {/* Rapier heightfield collider */}
            {heights && (
                <RigidBody type="fixed" position={new THREE.Vector3(0, 0, 1)}>
                    <HeightfieldCollider args={heights} />
                </RigidBody>
            )}
        </Suspense>
    );
}

function processHeightmapImage(img: HTMLImageElement | HTMLCanvasElement) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    const heights = [];

    // Rapier expects (height + 1) × (width + 1) vertices
    for (let y = 0; y <= img.height; y++) {
        for (let x = 0; x <= img.width; x++) {
            if (y >= img.height || x >= img.width) {
                heights.push(0);
                continue;
            }

            const idx = (y * img.width + x) * 4;
            const heightValue = data[idx] / 255; // grayscale to height
            heights.push(heightValue);
        }
    }

    return { heights, width: img.width, depth: img.height };
}