import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function WeatherFX() {
  const group = useRef<THREE.Group>(null);
  const rainGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const rainMat = useMemo(() => new THREE.PointsMaterial({ color: 0xaaaaee, size: 0.02, transparent: true }), []);
  const count = 2000;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = Math.random() * 40 + 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, [count]);

  rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  useFrame((_, delta) => {
    const pos = rainGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] -= 20 * delta;
      if (pos.array[i * 3 + 1] < 0) pos.array[i * 3 + 1] = Math.random() * 40 + 10;
    }
    pos.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <points args={[rainGeo, rainMat]} />
    </group>
  );
}
