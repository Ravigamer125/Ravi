import { useBox } from '@react-three/cannon';

export function Pitch() {
  const [ref] = useBox(() => ({
    args: [20.12, 0.1, 3.05], // length, height, width (20.12m, 3.05m)
    position: [0, 0.05, 0],
    type: 'Static',
    material: { friction: 0.5, restitution: 0.35 }
  }));

  return (
    <mesh ref={ref as any} receiveShadow>
      <boxGeometry args={[20.12, 0.1, 3.05]} />
      <meshStandardMaterial color="#caa472" roughness={0.9} />
    </mesh>
  );
}
