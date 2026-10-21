import * as THREE from 'three';

const canvas = document.getElementById('scene');
const healthText = document.getElementById('health');
const scoreText = document.getElementById('score');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const clock = new THREE.Clock();

const world = {
  width: 30,
  height: 30
};

const player = {
  mesh: new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ff88 })
  ),
  velocity: new THREE.Vector3(),
  speed: 10,
  health: 100,
  score: 0
};

player.mesh.position.set(0, 0.5, 0);
scene.add(player.mesh);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x2d5a27 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

camera.position.set(0, 6, 10);

const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

function updatePlayer(delta) {
  const moveX = (keys['d'] ? 1 : 0) - (keys['a'] ? 1 : 0);
  const moveZ = (keys['s'] ? 1 : 0) - (keys['w'] ? 1 : 0);

  player.velocity.x = moveX * player.speed;
  player.velocity.z = moveZ * player.speed;

  player.mesh.position.x += player.velocity.x * delta;
  player.mesh.position.z += player.velocity.z * delta;

  player.mesh.position.x = THREE.MathUtils.clamp(player.mesh.position.x, -world.width / 2, world.width / 2);
  player.mesh.position.z = THREE.MathUtils.clamp(player.mesh.position.z, -world.height / 2, world.height / 2);

  camera.position.x = player.mesh.position.x;
  camera.position.z = player.mesh.position.z + 8;
  camera.position.y = 6;

  camera.lookAt(player.mesh.position.x, 0.5, player.mesh.position.z);
}

const enemies = [];
function createEnemy(x, z) {
  const enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff4444 })
  );
  enemy.position.set(x, 0.5, z);
  scene.add(enemy);
  enemies.push(enemy);
}

for (let i = 0; i < 5; i++) {
  createEnemy(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20
  );
}

function updateEnemies(delta) {
  for (const enemy of enemies) {
    const dx = player.mesh.position.x - enemy.position.x;
    const dz = player.mesh.position.z - enemy.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 0.1) {
      enemy.position.x += (dx / dist) * delta * 2;
      enemy.position.z += (dz / dist) * delta * 2;
    }

    if (dist < 1.3) {
      player.health -= 20 * delta;
      healthText.textContent = Math.max(0, Math.round(player.health));
    }
  }
}

function animate() {
  const delta = clock.getDelta();

  updatePlayer(delta);
  updateEnemies(delta);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

healthText.textContent = player.health;
scoreText.textContent = player.score;

animate();
