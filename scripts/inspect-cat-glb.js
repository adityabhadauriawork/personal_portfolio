import fs from 'fs';

const buf = fs.readFileSync('public/assets/portfolio/character/white-cat.glb');
// The GLB header: magic (4 bytes), version (4 bytes), length (4 bytes)
// JSON chunk: length (4 bytes), type (4 bytes: 0x4E4F534A)
const jsonLength = buf.readUInt32LE(12);
const jsonChunk = buf.toString('utf8', 20, 20 + jsonLength);
const gltf = JSON.parse(jsonChunk);

console.log('GLTF Animations:', gltf.animations ? gltf.animations.map(a => a.name) : 'none');
console.log('GLTF Meshes:', gltf.meshes ? gltf.meshes.length : 0);
console.log('GLTF Nodes:', gltf.nodes ? gltf.nodes.map(n => n.name).filter(Boolean) : []);
console.log('GLTF Materials:', gltf.materials ? gltf.materials.map(m => m.name) : []);
