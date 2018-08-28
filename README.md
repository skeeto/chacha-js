# ChaCha20 in JavaScript

This is an implementation of the [ChaCha stream cipher][chacha] in
JavaScript.

## API

The only function in the API is a constructor that accepts an
ArrayBuffer key and ArrayBuffer IV, returning a function that generates
the stream 64 bytes at a time. The stream itself is a 64-byte
ArrayBuffer. This ArrayBuffer is reused between generator calls.

```js
/* Initialization */
let key = new ArrayBuffer(CHACHA_KEYSIZE);
let iv = new ArrayBuffer(CHACHA_IVSIZE);
// ... set bytes of key and IV ...
let cipher = new ChaCha(key, iv);

/* Encryption / Decryption */
let block = new Uint8Array(cipher());
// ... consume the output ...
cipher();  // fill the buffer with more output
// ... consume the output ...
```

[chacha]: https://cr.yp.to/chacha.html
