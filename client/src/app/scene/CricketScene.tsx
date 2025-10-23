import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { OrbitControls, Environment, Sky, StatsGl } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { EffectComposer, SMAA, Bloom, Vignette, SSAO } from '@react-three/postprocessing';
import * as THREE from 'three';
import io from 'socket.io-client';
import { useEffect } from 'react';

function StadiumGround() {
  return (
    <mesh receiveShadow rotation-x={-Math.PI / 2}>
      <planeGeometry args={[180, 180, 1, 1]} />
      <meshStandardMaterial color="#2a7b2a" roughness={0.9} metalness={0} />
    </mesh>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight
        castShadow
        position={[50, 120, 50]}
        intensity={2.5}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}

// Scene entities
import { BallManager } from './entities/BallManager';
import { Pitch } from './entities/Pitch';
import { Wickets } from './entities/Wickets';
import { WeatherFX } from './weather/WeatherFX';
import { Crowd } from './crowd/Crowd';

export default function CricketScene() {
  useEffect(() => {
    const url = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:8080';
    const socket = io(url, { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('ping');
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Canvas shadows camera={{ position: [0, 8, 22], fov: 45 }}>
      <Suspense fallback={null}>
        <Sky sunPosition={[100, 20, 100]} turbidity={6} rayleigh={1.5} mieCoefficient={0.02} mieDirectionalG={0.9} />
        <Environment preset="sunset" background={false} />
        <Lighting />
        <Physics gravity={[0, -9.81, 0]} allowSleep broadphase="SAP">
          <StadiumGround />
          <Pitch />
          <Wickets />
          <BallManager />
        </Physics>
        <WeatherFX />
        <Crowd />
        <EffectComposer multisampling={0}>
          <SMAA />
          <SSAO intensity={15} radius={0.2} luminanceInfluence={0.6} />
          <Bloom intensity={0.25} luminanceThreshold={0.8} mipmapBlur />
          <Vignette eskil offset={0.15} darkness={0.5} />
        </EffectComposer>
        <StatsGl />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI * 0.495} />
      </Suspense>
    </Canvas>
  );
}
