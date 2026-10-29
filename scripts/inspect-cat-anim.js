import fs from 'fs';

const buf = fs.readFileSync('public/assets/portfolio/character/white-cat.glb');
const jsonLength = buf.readUInt32LE(12);
const jsonChunk = buf.toString('utf8', 20, 20 + jsonLength);
const gltf = JSON.parse(jsonChunk);

const anim = gltf.animations[0];
console.log('Animation name:', anim.name);
console.log('Channels count:', anim.channels.length);
console.log('Samplers count:', anim.samplers.length);
const timeAccessorIdx = anim.samplers[0].input;
const acc = gltf.accessors[timeAccessorIdx];
console.log('Time range (seconds):', acc.min, 'to', acc.max);
