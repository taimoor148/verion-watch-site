import assert from 'node:assert/strict'
import { createWatch } from '../src/js/three/watch-factory.js'
// Texture drawing is stubbed; this checks actual Three.js geometry transforms, not rendering.
const context = new Proxy({}, {get: (_, key) => key.startsWith('create') ? () => ({addColorStop(){}}) : () => {}, set: () => true})
globalThis.document = { createElement: () => ({getContext: () => context}) }
for (const tier of ['low', 'high']) {
 const watch = createWatch({tier, aniso:1})
 const initial = watch.group.children.map(o => o.position.toArray())
 watch.setExplode(1)
 const open = watch.group.children.map(o => o.position.toArray())
 assert(open.filter((p,i)=>p.some((v,k)=>v!==initial[i][k])).length>40)
 watch.setExplode(2)
 assert.deepEqual(watch.group.children.map(o=>o.position.toArray()),open)
 for (const progress of [.2,.8,.3,1,0]) watch.setExplode(progress)
 assert.deepEqual(watch.group.children.map(o=>o.position.toArray()),initial)
 watch.setExplode(-1)
 assert.deepEqual(watch.group.children.map(o=>o.position.toArray()),initial)
 watch.dispose()
 console.log(`${tier}: disassembly, clamping and exact reassembly passed`)
}
