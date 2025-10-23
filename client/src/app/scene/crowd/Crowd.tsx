import { useMemo } from 'react';
import * as THREE from 'three';

export function Crowd() {
  const instanced = useMemo(() => {
    const geometry = new THREE.BoxGeometry(0.3, 0.6, 0.3);
    const material = new THREE.MeshStandardMaterial({ color: '#888' });
    const mesh = new THREE.InstancedMesh(geometry, material, 2000);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 2000; i++) {
      dummy.position.set((Math.random() - 0.5) * 150, 2 + Math.random() * 5, (Math.random() - 0.5) * 150);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, []);

  return <primitive object={instanced} />;
}
