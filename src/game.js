/*
 Minimal Subway Surfers–style endless runner using Three.js
 - Procedural ground tiles
 - Trains as obstacles
 - Barcode collectibles
 - Player lane switch (left/right) and jump
*/

/* global THREE */

const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const gameOverEl = document.getElementById('gameover');
const finalScoreEl = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f1a);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Camera
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 5.5, 10);

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.9);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(5, 10, 5);
scene.add(dir);

// Lanes: -1 (left), 0 (middle), 1 (right)
const laneX = (laneIndex) => laneIndex * 3.0;

// Player
const player = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.6, 1.2, 8, 16),
  new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.5, metalness: 0.1 })
);
player.position.set(0, 1.1, 0);
player.castShadow = true;
scene.add(player);

let currentLane = 0;
let targetLane = 0;
let verticalVelocity = 0;
let isOnGround = true;

// Movement/gameplay
let gameSpeed = 12; // units per second forward
let distanceRan = 0;
let score = 0;
let isGameOver = false;

// Ground tiles pool
const tileLength = 20;
const tileCount = 12;
const groundTiles = [];

const railMaterial = new THREE.MeshStandardMaterial({ color: 0x888c8f, roughness: 0.9 });
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x233044, roughness: 1.0 });
const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x2a3a54, roughness: 1.0 });

function createGroundTile(zIndex) {
  const group = new THREE.Group();

  // Base ground
  const ground = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, tileLength), groundMaterial);
  ground.position.set(0, -0.25, 0);
  ground.receiveShadow = true;
  group.add(ground);

  // Rails (three lanes)
  const railGeom = new THREE.BoxGeometry(0.1, 0.05, tileLength);
  for (let i = -1; i <= 1; i++) {
    const rail = new THREE.Mesh(railGeom, railMaterial);
    rail.position.set(laneX(i), 0, 0);
    group.add(rail);
  }

  // Side fences for visual depth
  const fenceGeom = new THREE.BoxGeometry(0.1, 1.2, tileLength);
  const leftFence = new THREE.Mesh(fenceGeom, fenceMaterial);
  leftFence.position.set(-5.2, 0.6, 0);
  const rightFence = leftFence.clone();
  rightFence.position.x = 5.2;
  group.add(leftFence, rightFence);

  group.position.z = -zIndex * tileLength;
  scene.add(group);
  return group;
}

for (let i = 0; i < tileCount; i++) {
  groundTiles.push(createGroundTile(i));
}

function recycleGroundTiles() {
  for (const tile of groundTiles) {
    if (tile.position.z - camera.position.z > tileLength) {
      tile.position.z -= tileCount * tileLength;
      clearChildrenWithTag(tile, 'obstacle');
      clearChildrenWithTag(tile, 'collectible');
      spawnEntitiesOnTile(tile);
    }
  }
}

function clearChildrenWithTag(group, tag) {
  const toRemove = [];
  group.traverse((obj) => {
    if (obj.userData && obj.userData.tag === tag) {
      toRemove.push(obj);
    }
  });
  toRemove.forEach((obj) => {
    obj.parent && obj.parent.remove(obj);
    obj.geometry && obj.geometry.dispose && obj.geometry.dispose();
    obj.material && obj.material.dispose && obj.material.dispose();
  });
}

// Trains & Barcodes
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xd7263d, metalness: 0.2, roughness: 0.6 });
const obstacleTopMaterial = new THREE.MeshStandardMaterial({ color: 0xb21e35, metalness: 0.2, roughness: 0.6 });

function createTrain(length = 6, laneIndex = 0) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, length), obstacleMaterial);
  body.position.y = 1.2;
  body.castShadow = true;
  body.receiveShadow = true;
  body.userData.tag = 'obstacle';
  group.add(body);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.4, length * 0.9), obstacleTopMaterial);
  roof.position.set(0, 2.6, 0);
  roof.userData.tag = 'obstacle';
  group.add(roof);

  group.position.x = laneX(laneIndex);
  return group;
}

function makeBarcodeTexture(width = 64, height = 64) {
  const cvs = document.createElement('canvas');
  cvs.width = width;
  cvs.height = height;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw random bars
  let x = 6;
  while (x < width - 6) {
    const barWidth = Math.floor(1 + Math.random() * 4);
    const gapWidth = Math.floor(1 + Math.random() * 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, 8, barWidth, height - 16);
    x += barWidth + gapWidth;
  }

  // Guard bars
  ctx.fillStyle = '#000000';
  ctx.fillRect(2, 8, 2, height - 16);
  ctx.fillRect(width - 4, 8, 2, height - 16);

  const tex = new THREE.CanvasTexture(cvs);
  tex.anisotropy = 4;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const barcodeTexture = makeBarcodeTexture(128, 128);
const barcodeMat = new THREE.MeshStandardMaterial({ map: barcodeTexture, metalness: 0.0, roughness: 0.8 });

function createBarcodeCollectible(laneIndex = 0) {
  const geom = new THREE.BoxGeometry(0.8, 1.2, 0.1);
  const mesh = new THREE.Mesh(geom, barcodeMat);
  mesh.position.set(laneX(laneIndex), 1.2, 0);
  mesh.userData.tag = 'collectible';
  mesh.castShadow = true;
  return mesh;
}

function spawnEntitiesOnTile(tile) {
  // 0..1 for each lane whether occupied by train
  const occupied = { '-1': false, '0': false, '1': false };

  // Maybe spawn a train
  if (Math.random() < 0.7) {
    const lane = [-1, 0, 1][Math.floor(Math.random() * 3)];
    const trainLen = 4 + Math.floor(Math.random() * 8);
    const train = createTrain(trainLen, lane);
    train.position.z = (Math.random() * 0.6 - 0.3) * tileLength;
    train.traverse((o) => (o.userData.tag = 'obstacle'));
    tile.add(train);
    occupied[String(lane)] = true;
  }

  // Maybe spawn a barcode in a free lane
  if (Math.random() < 0.65) {
    const freeLanes = [-1, 0, 1].filter((l) => !occupied[String(l)]);
    if (freeLanes.length > 0) {
      const lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      const barcode = createBarcodeCollectible(lane);
      barcode.position.z = (Math.random() * 0.6 - 0.3) * tileLength;
      tile.add(barcode);
    }
  }
}

// Populate initial entities
for (const tile of groundTiles) {
  if (Math.random() < 0.9) spawnEntitiesOnTile(tile);
}

// Controls
window.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') targetLane = Math.max(-1, targetLane - 1);
  if (e.code === 'ArrowRight' || e.code === 'KeyD') targetLane = Math.min(1, targetLane + 1);
  if ((e.code === 'Space' || e.code === 'ArrowUp') && isOnGround) {
    verticalVelocity = 8.5;
    isOnGround = false;
  }
});

restartBtn.addEventListener('click', () => restart());

// Collision helpers
const playerBox = new THREE.Box3();
const tempBox = new THREE.Box3();

function checkCollisions() {
  playerBox.setFromObject(player);
  let hitObstacle = false;
  let collected = 0;

  for (const tile of groundTiles) {
    tile.traverse((obj) => {
      if (!obj.userData || (!obj.userData.tag)) return;
      if (obj.userData.tag === 'obstacle') {
        tempBox.setFromObject(obj);
        if (playerBox.intersectsBox(tempBox)) hitObstacle = true;
      } else if (obj.userData.tag === 'collectible') {
        tempBox.setFromObject(obj);
        if (playerBox.intersectsBox(tempBox)) {
          collected += 1;
          obj.parent && obj.parent.remove(obj);
        }
      }
    });
  }

  if (collected > 0) {
    score += collected * 10;
  }
  if (hitObstacle) {
    endGame();
  }
}

function endGame() {
  isGameOver = true;
  finalScoreEl.textContent = `Final Score: ${Math.floor(score)}`;
  gameOverEl.classList.remove('hidden');
}

function restart() {
  // Reset player
  player.position.set(0, 1.1, 0);
  currentLane = 0;
  targetLane = 0;
  verticalVelocity = 0;
  isOnGround = true;

  // Reset world
  distanceRan = 0;
  score = 0;
  gameSpeed = 12;
  isGameOver = false;
  gameOverEl.classList.add('hidden');

  // Clear and respawn tile contents, reposition in front
  for (let i = 0; i < groundTiles.length; i++) {
    const tile = groundTiles[i];
    clearChildrenWithTag(tile, 'obstacle');
    clearChildrenWithTag(tile, 'collectible');
    tile.position.z = -i * tileLength;
    if (Math.random() < 0.9) spawnEntitiesOnTile(tile);
  }
}

// Resize
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// Animation loop
let lastTime = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!isGameOver) update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function update(dt) {
  // Increase speed over time
  gameSpeed += 0.06 * dt; // slow acceleration
  distanceRan += gameSpeed * dt;
  score += gameSpeed * dt * 0.5;

  // Move camera and tiles backward to simulate forward motion
  const dz = gameSpeed * dt;
  for (const tile of groundTiles) {
    tile.position.z += dz;
  }
  recycleGroundTiles();

  // Smooth lane switching
  currentLane += (targetLane - currentLane) * Math.min(1, dt * 10);
  player.position.x = laneX(currentLane);

  // Gravity/jump
  verticalVelocity -= 20 * dt;
  player.position.y += verticalVelocity * dt;
  if (player.position.y <= 1.1) {
    player.position.y = 1.1;
    verticalVelocity = 0;
    isOnGround = true;
  }

  // Camera follow
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, player.position.x * 0.4, 0.08);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10 + player.position.z, 0.08);
  camera.lookAt(player.position.x, 1.2, player.position.z - 6);

  // Collisions
  checkCollisions();

  // UI
  scoreEl.textContent = `Score: ${Math.floor(score)}`;
  speedEl.textContent = `Speed: ${gameSpeed.toFixed(1)}`;
}

