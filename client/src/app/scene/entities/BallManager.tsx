import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { useRef } from 'react';
import * as THREE from 'three';

export function BallManager() {
  const [ref, api] = useSphere(() => ({
    args: [0.0366], // cricket ball radius ~7.3cm diameter
    mass: 0.163, // 163g
    position: [0, 1.2, 0],
    material: {
      friction: 0.6,
      restitution: 0.5,
    }
  }));

  const seamAxis = useRef(new THREE.Vector3(0, 0, 1));
  const temp = useRef({ lift: new THREE.Vector3(), wind: new THREE.Vector3() });

  useFrame((_, delta) => {
    // Simple aerodynamic model: quadratic drag + side force from seam/swing
    api.velocity.subscribe((v) => {
      const velocity = new THREE.Vector3(v[0], v[1], v[2]);
      const speed = velocity.length();
      if (speed < 0.01) return;

      const area = Math.PI * (0.0366 ** 2);
      const airDensity = 1.225; // kg/m^3
      const dragCoefficient = 0.3; // tuned value
      const dragMagnitude = 0.5 * airDensity * dragCoefficient * area * speed * speed;
      const drag = velocity.clone().normalize().multiplyScalar(-dragMagnitude);

      const sideForceCoeff = 0.05; // swing due to seam
      const side = seamAxis.current.clone().cross(velocity).normalize().multiplyScalar(sideForceCoeff * speed * speed);

      const force = temp.current.lift.set(0, 0, 0).add(drag).add(side);
      api.applyForce([force.x, force.y, force.z], [0, 0, 0]);
    });
  });

  return (
    <mesh ref={ref as any} castShadow>
      <sphereGeometry args={[0.0366, 32, 32]} />
      <meshStandardMaterial color="#7a1a1a" roughness={0.2} metalness={0.6} />
    </mesh>
  );
}
