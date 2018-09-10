/* This is free and unencumbered software released into the public domain. */
"use strict";
const CHACHA_ROUNDS  = 20;
const CHACHA_KEYSIZE = 32;
const CHACHA_IVSIZE  = 8;

/**
 * Create a new ChaCha generator seeded from the given KEY and IV.
 * Both KEY and IV must be ArrayBuffer objects of at least the
 * appropriate byte lengths (CHACHA_KEYSIZE, CHACHA_IVSIZE). Bytes
 * beyond the specified length are ignored.
 *
 * Returns a closure that takes no arguments. This closure, when
 * invoked, returns a 64-byte ArrayBuffer of the next 64 bytes of
 * output. Note: This buffer object is "owned" by the closure, and
 * the same buffer object is always returned, each time filled with
 * fresh output.
 */
function ChaCha(key, iv) {
    if (key.byteLength < CHACHA_KEYSIZE)
        throw new Error('key too short');
    if (iv.byteLength < CHACHA_IVSIZE)
        throw new Error('IV too short');
    const state = new Uint32Array(16);
    let view = new DataView(key);
    state[ 0] = 0x61707865; // "expand 32-byte k"
    state[ 1] = 0x3320646e; //
    state[ 2] = 0x79622d32; //
    state[ 3] = 0x6b206574; //
    state[ 4] = view.getUint32( 0, true);
    state[ 5] = view.getUint32( 4, true);
    state[ 6] = view.getUint32( 8, true);
    state[ 7] = view.getUint32(12, true);
    state[ 8] = view.getUint32(16, true);
    state[ 9] = view.getUint32(20, true);
    state[10] = view.getUint32(24, true);
    state[11] = view.getUint32(28, true);
    view = new DataView(iv);
    state[14] = view.getUint32( 0, true);
    state[15] = view.getUint32( 4, true);

    /* Generator */
    const output  = new Uint32Array(16);
    const outview = new DataView(output.buffer);
    return function() {
        function quarterround(x, a, b, c, d) {
            function rotate(v, n) { return (v << n) | (v >>> (32 - n)); }
            x[a] += x[b]; x[d] = rotate(x[d] ^ x[a], 16);
            x[c] += x[d]; x[b] = rotate(x[b] ^ x[c], 12);
            x[a] += x[b]; x[d] = rotate(x[d] ^ x[a],  8);
            x[c] += x[d]; x[b] = rotate(x[b] ^ x[c],  7);
        }
        output.set(state);
        for (let i = 0; i < CHACHA_ROUNDS; i += 2) {
            quarterround(output,  0,  4,  8, 12);
            quarterround(output,  1,  5,  9, 13);
            quarterround(output,  2,  6, 10, 14);
            quarterround(output,  3,  7, 11, 15);
            quarterround(output,  0,  5, 10, 15);
            quarterround(output,  1,  6, 11, 12);
            quarterround(output,  2,  7,  8, 13);
            quarterround(output,  3,  4,  9, 14);
        }
        for (let i = 0; i < 16; i++)
            outview.setUint32(i * 4, output[i] + state[i], true);
        state[12]++;
        if (state[12] == 0) {
            state[13]++;
            if (state[13] == 0) {
                /* One zebibyte of output reached! */
                throw new Error('output exhausted');
            }
        }
        return output.buffer;
    }
}
