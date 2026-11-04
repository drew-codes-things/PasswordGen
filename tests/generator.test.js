const assert = require('assert');
const gen = require('../assets/generator.js');

const all = { length: 16, upper: true, lower: true, digits: true, symbols: true, avoidLookAlikes: true };

for (let i = 0; i < 500; i++) {
    const pw = gen.generate(all);
    assert.strictEqual(pw.length, 16);
    assert.ok(/[A-Z]/.test(pw), 'has an uppercase letter');
    assert.ok(/[a-z]/.test(pw), 'has a lowercase letter');
    assert.ok(/[0-9]/.test(pw), 'has a digit');
    assert.ok(/[^A-Za-z0-9]/.test(pw), 'has a symbol');
    for (const ch of gen.LOOK_ALIKES) assert.ok(!pw.includes(ch), 'no look-alike ' + ch);
}

assert.strictEqual(gen.generate({ ...all, length: 3 }).length, gen.MIN_LENGTH);
assert.strictEqual(gen.generate({ ...all, length: 999 }).length, gen.MAX_LENGTH);
assert.ok(/^[0-9]+$/.test(gen.generate({ length: 20, digits: true, avoidLookAlikes: false })));
assert.throws(() => gen.generate({ length: 12 }), /at least one/);

const counts = new Array(7).fill(0);
for (let i = 0; i < 70000; i++) counts[gen.randomInt(7)]++;
for (const c of counts) assert.ok(Math.abs(c - 10000) < 600, 'randomInt is even: ' + counts.join(','));

let calls = 0;
const fakeFill = (arr) => { arr[0] = calls++ === 0 ? 0xFFFFFFFF : 5; return arr; };
assert.strictEqual(gen.randomInt(6, fakeFill), 5);
assert.strictEqual(calls, 2, 'values past the last full block are rejected and redrawn');

assert.strictEqual(gen.strength(8, 10).label, 'Weak');
assert.strictEqual(gen.strength(16, gen.poolSize(all)).label, 'Strong');
assert.strictEqual(gen.strength(32, gen.poolSize(all)).label, 'Very strong');

console.log('generator.test.js: all tests passed');

const words = require('../assets/words.js');
assert.strictEqual(words.length, 7776);
assert.strictEqual(new Set(words).size, 7776);
for (let i = 0; i < 300; i++) {
    const phrase = gen.generatePassphrase({ words: 6, separator: '.', capitalise: false, number: false });
    const parts = phrase.split('.');
    assert.strictEqual(parts.length, 6);
    for (const w of parts) assert.ok(words.includes(w), 'word from the list: ' + w);
}
for (let i = 0; i < 300; i++) {
    const phrase = gen.generatePassphrase({ words: 4, separator: ' ', capitalise: true, number: true });
    const parts = phrase.split(' ');
    assert.strictEqual(parts.length, 4);
    assert.strictEqual((phrase.match(/[0-9]/g) || []).length, 1, 'exactly one digit');
    for (const w of parts) assert.ok(/^[A-Z]/.test(w), 'capitalised: ' + w);
}
assert.strictEqual(gen.generatePassphrase({ words: 1 }).split('-').length >= gen.MIN_WORDS, true);
assert.strictEqual(gen.generatePassphrase({ words: 99, separator: '_' }).split('_').length, gen.MAX_WORDS);
assert.strictEqual(gen.generatePassphrase({ words: 5, separator: 'x' }).split('-').length >= 5, true);
assert.strictEqual(Math.round(gen.passphraseBits({ words: 6 })), 78);
assert.strictEqual(gen.rate(gen.passphraseBits({ words: 7 })).label, 'Strong');
