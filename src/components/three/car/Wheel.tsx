import { useCompoundBody, useCylinder } from '@react-three/cannon'

export default function Wheel({ ref, radius = 0.35, leftSide = true }) {
  useCompoundBody(
    () => ({
      collisionFilterGroup: 0,
      mass: 1,
      material: 'wheel',
      shapes: [
        {
          args: [radius, radius, 0.5, 16],
          rotation: [0, 0, -Math.PI / 2],
          type: 'Cylinder',
        },
      ],
      type: 'Kinematic',
    }),
    ref,
  )

  const [cylRef] = useCylinder(() => ({
    args: [radius, radius, 0.5, 16],
    rotation: [0, 0, -Math.PI / 2],
    mass: 1,
    material: 'wheel',
    position: [0, 100, 0],
  }))

  return (
    <>
      <group ref={ref}>
        <group rotation={[0, 0, ((leftSide ? 1 : -1) * Math.PI) / 2]}>
          <mesh ref={cylRef} />

          {/*<mesh material={Rubber} geometry={nodes.wheel_1.geometry} />*/}
          {/*<mesh material={Steel} geometry={nodes.wheel_2.geometry} />*/}
          {/*<mesh material={Chrom} geometry={nodes.wheel_3.geometry} />*/}
        </group>
      </group>
    </>
  )
}
