import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { type GamepadRef, useGamepads } from 'react-ts-gamepads'
import Car from './Car'
import { useInputManager } from '@/hooks/useInputManager'
import { useInputStore } from '@/stores/input.store.ts'

export default function CarWithInputs() {
  const [gamepads, setGamepads] = useState<GamepadRef>({})
  useGamepads(gamepads => setGamepads(gamepads))

  // Utiliser le gestionnaire d'inputs
  const {
    getSteeringValue,
    getAccelerationValue,
    getBrakeValue,
    getHandbrakeValue,
    currentInputs,
  } = useInputManager({ gamepads, enabled: true })

  // Accès au store pour les configurations
  const { getActiveProfile, profiles, setActiveProfile } = useInputStore()

  // Exemple d'application des inputs à la physique de la voiture
  useFrame(() => {
    const steering = getSteeringValue()
    const acceleration = getAccelerationValue()
    const brake = getBrakeValue()
    const handbrake = getHandbrakeValue()

    // Ici vous pourriez appliquer ces valeurs à votre vehicleApi
    // vehicleApi.setSteeringValue(steering * maxSteer, 0)
    // vehicleApi.setSteeringValue(steering * maxSteer, 1)
    // vehicleApi.applyEngineForce(acceleration * maxForce, 2)
    // vehicleApi.applyEngineForce(acceleration * maxForce, 3)
    // vehicleApi.setBrake(brake * maxBrake, 2)
    // vehicleApi.setBrake(brake * maxBrake, 3)
  })

  return (
    <>
      <Car position={[0, 50, 0]} />

      {/* Interface de debug pour les inputs */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        <h3>Input Debug</h3>

        <div>
          <strong>Profil actif:</strong> {getActiveProfile()?.name || 'Aucun'}
        </div>

        <div style={{ marginTop: '10px' }}>
          <strong>Valeurs inputs:</strong>
          <div>Direction: {getSteeringValue().toFixed(2)}</div>
          <div>Accélération: {getAccelerationValue().toFixed(2)}</div>
          <div>Frein: {getBrakeValue().toFixed(2)}</div>
          <div>Frein à main: {getHandbrakeValue().toFixed(2)}</div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <strong>Sélecteur de profil:</strong>
          <select
            value={getActiveProfile()?.id || ''}
            onChange={e => setActiveProfile(e.target.value)}
            style={{ marginLeft: '5px', padding: '2px' }}
          >
            {profiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '10px' }}>
          <strong>État des inputs bruts:</strong>
          {Object.entries(currentInputs).map(([action, value]) => (
            <div key={action}>
              {action}: {value.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
