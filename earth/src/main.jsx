import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import getStarfield from './getStarfield.js';
import { getFresnelMat } from "./getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Add AudioListener to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// Load the audio
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('./audio/backgroundmusic.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true); // Enable looping
    sound.setVolume(0.5); // Adjust volume

    // Wait for user interaction before playing
    const playAudio = () => {
        sound.play(); // Play the audio
        // Remove event listeners after playing to prevent multiple triggers
        window.removeEventListener('click', playAudio);
        window.removeEventListener('touchstart', playAudio);
    };

    // Add event listeners for click or touch to trigger audio
    window.addEventListener('click', playAudio);
    window.addEventListener('touchstart', playAudio);
});


const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({numStars: 20000});
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 4.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

const moonGroup = new THREE.Group();
scene.add(moonGroup);
const moonMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/moonmap1k.jpg"),
  // map: loader.load("./textures/sunmap.jpg"),
  bumpMap: loader.load("./textures/moonbump1k.jpg"),
  bumpScale: 2,
  color: 0xffffcc,
  emissive: 0xffffcc, // Adds an emissive glow effect
  emissiveIntensity: 1.5
});

const moonMesh = new THREE.Mesh(geometry, moonMat);
moonMesh.position.set(2, 0, 0);
moonMesh.scale.setScalar(0.27);
moonGroup.add(moonMesh);

const moonGlowMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffcc, // Light blue color for a subtle glow
  transparent: true,
  opacity: 0, // Adjust opacity for desired glow intensity
  blending: THREE.AdditiveBlending
});
const moonGlowGeometry = new THREE.SphereGeometry(0.32, detail, detail); // Slightly larger than moonMesh
const moonGlowMesh = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
moonGlowMesh.position.copy(moonMesh.position); // Position it correctly
moonGroup.add(moonGlowMesh);


// const neptuneGroup = new THREE.Group();
// scene.add(neptuneGroup);
// const neptuneMat = new THREE.MeshStandardMaterial({
//   map: loader.load("./textures/neptunemap.jpg"),
//   bumpScale: 2,
// });
// const neptuneMesh = new THREE.Mesh(geometry, neptuneMat);
// neptuneMesh.position.set(5,0,0);
// neptuneMesh.scale.setScalar(0.45);
// neptuneGroup.add(neptuneMesh);

function animate() {
  requestAnimationFrame(animate);

  earthMesh.rotation.y += 0.003;
  lightsMesh.rotation.y += 0.003;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.003;
  stars.rotation.y -= 0.0003;
  moonGroup.rotation.y += 0.005;
  // neptuneGroup.rotation.y += 0.008;

  renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);