import { useBox } from '@react-three/cannon';

function Stumps({ x }: { x: number }) {
  const [ref] = useBox(() => ({ args: [0.036, 0.71, 0.036], position: [x, 0.355, -1.525], type: 'Static' }));
  const [ref2] = useBox(() => ({ args: [0.036, 0.71, 0.036], position: [x, 0.355, 1.525], type: 'Static' }));
  return (
    <>
      <mesh ref={ref as any} castShadow>
        <boxGeometry args={[0.036, 0.71, 0.036]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh ref={ref2 as any} castShadow>
        <boxGeometry args={[0.036, 0.71, 0.036]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
    </>
  );
}

export function Wickets() {
  return (
    <>
      <Stumps x={-10.06} />
      <Stumps x={10.06} />
    </>
  );
}
