import { usePlane } from '@react-three/cannon'

export function Ground({
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
}) {
  const [ref] = usePlane(() => ({
    mass: 0, // immobile
    position,
    rotation,
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="green" transparent opacity={0.5} />
    </mesh>
  )
}
