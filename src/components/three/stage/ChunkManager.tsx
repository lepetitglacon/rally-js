import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import TerrainChunk from './TerrainChunk';
import {HeightfieldCollider, RigidBody} from "@react-three/rapier";

const NUMBER_OF_CHUNKS = 16; // Size of each chunk in world units
const CHUNK_SIZE = 16; // Size of each chunk in world units
const SCALE = {x: CHUNK_SIZE * 2, y: 1, z: CHUNK_SIZE * 2}; // Size of each chunk in world units
const RENDER_DISTANCE = 1; // Render 3x3 chunks (1 chunk in each direction + center)

interface ChunkCoord {
  x: number;
  z: number;
}

interface Chunk {
  coord: ChunkCoord;
  position: THREE.Vector3;
  key: string;
  heights: number[];
}

export default function ChunkManager() {
  const chunks = [] as Chunk[];

  function createChunkHeightField() {
    const heights = [];
    for (let i = 0; i < CHUNK_SIZE + 1; i++) {
      for (let j = 0; j < CHUNK_SIZE + 1; j++) {
        heights.push(Math.random())
      }
    }
    return heights
  }

  for (let i = 0; i < NUMBER_OF_CHUNKS; i++) {
    for (let j = 0; j < NUMBER_OF_CHUNKS; j++) {
      const position = new THREE.Vector3(
          i + i * CHUNK_SIZE,
          0,
          j + j * CHUNK_SIZE
      );
      const chunk = {
        coord: { x: i, z: j },
        position,
        key: `chunk-${i}-${j}`,
        heights: createChunkHeightField()
      } as Chunk
      chunks.push(chunk);
    }
  }

  console.log(chunks)

  return (
    <>
      {chunks.map((chunk) => (
          <RigidBody key={chunk.key} type="fixed" position={chunk.position}>
            <HeightfieldCollider
                args={[CHUNK_SIZE, CHUNK_SIZE, chunk.heights, SCALE]}
            />
          </RigidBody>!
      ))}

    </>
  );
}