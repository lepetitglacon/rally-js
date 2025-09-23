import { useBox } from '@react-three/cannon'

export function Box({ position = [0, 0, 0], args = [1, 1, 1], children }) {
  const [ref] = useBox(() => ({ mass: 1, position, args }))
  return <mesh ref={ref}>{children}</mesh>
}
