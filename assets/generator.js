(function (global) {
    'use strict';

    var SETS = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        digits: '0123456789',
        symbols: '!@#$%^&*()-_=+[]{};:,.<>?/|'
    };
    var LOOK_ALIKES = 'IOilo01|';
    var ORDER = ['upper', 'lower', 'digits', 'symbols'];
    var MIN_LENGTH = 8;
    var MAX_LENGTH = 64;
    var MIN_WORDS = 3;
    var MAX_WORDS = 10;
    var SEPARATORS = ['-', '.', '_', ' '];

    function defaultFill(array) {
        var source = global.crypto || (typeof globalThis !== 'undefined' ? globalThis.crypto : null);
        if (!source || typeof source.getRandomValues !== 'function') {
            throw new Error('This browser has no secure random number generator.');
        }
        return source.getRandomValues(array);
    }

    function randomInt(max, fill) {
        if (!(max > 0) || max > 0x100000000) throw new RangeError('max must be between 1 and 2^32');
        var limit = Math.floor(0x100000000 / max) * max;
        var buffer = new Uint32Array(1);
        var value;
        do {
            (fill || defaultFill)(buffer);
            value = buffer[0];
        } while (value >= limit);
        return value % max;
    }

    function charset(name, avoidLookAlikes) {
        var chars = SETS[name] || '';
        if (!avoidLookAlikes) return chars;
        return chars.split('').filter(function (c) { return LOOK_ALIKES.indexOf(c) === -1; }).join('');
    }

    function clampLength(value) {
        var n = parseInt(value, 10);
        if (isNaN(n)) n = 16;
        return Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, n));
    }

    function activeSets(options) {
        return ORDER.filter(function (name) { return options[name]; })
            .map(function (name) { return charset(name, options.avoidLookAlikes); })
            .filter(function (chars) { return chars.length > 0; });
    }

    function generate(options, fill) {
        var length = clampLength(options.length);
        var sets = activeSets(options);
        if (!sets.length) throw new Error('Pick at least one character type.');
        var pool = sets.join('');
        var chars = sets.map(function (set) { return set[randomInt(set.length, fill)]; });
        while (chars.length < length) chars.push(pool[randomInt(pool.length, fill)]);
        for (var i = chars.length - 1; i > 0; i--) {
            var j = randomInt(i + 1, fill);
            var swap = chars[i];
            chars[i] = chars[j];
            chars[j] = swap;
        }
        return chars.join('');
    }

    function poolSize(options) {
        return activeSets(options).join('').length;
    }

    function clampWords(value) {
        var n = parseInt(value, 10);
        if (isNaN(n)) n = 5;
        return Math.max(MIN_WORDS, Math.min(MAX_WORDS, n));
    }

    function wordList() {
        var list = global.PasswordGenWords;
        if (!list && typeof require === 'function') list = require('./words.js');
        if (!list || !list.length) throw new Error('The word list did not load. Refresh the page and try again.');
        return list;
    }

    function generatePassphrase(options, fill) {
        var list = wordList();
        var count = clampWords(options.words);
        var separator = SEPARATORS.indexOf(options.separator) !== -1 ? options.separator : '-';
        var words = [];
        for (var i = 0; i < count; i++) {
            var word = list[randomInt(list.length, fill)];
            if (options.capitalise) word = word.charAt(0).toUpperCase() + word.slice(1);
            words.push(word);
        }
        if (options.number) {
            var at = randomInt(count, fill);
            words[at] += String(randomInt(10, fill));
        }
        return words.join(separator);
    }

    function passphraseBits(options) {
        var count = clampWords(options.words);
        var bits = count * Math.log2(wordList().length);
        if (options.number) bits += Math.log2(10 * count);
        return bits;
    }

    function rate(rawBits) {
        var bits = Math.round(rawBits);
        var level;
        var label;
        if (bits < 45) { level = 1; label = 'Weak'; }
        else if (bits < 64) { level = 2; label = 'Fair'; }
        else if (bits < 80) { level = 3; label = 'Good'; }
        else if (bits < 110) { level = 4; label = 'Strong'; }
        else { level = 5; label = 'Very strong'; }
        return { bits: bits, level: level, label: label };
    }

    function strength(length, size) {
        return rate(size > 1 ? length * Math.log2(size) : 0);
    }

    var api = {
        SETS: SETS,
        LOOK_ALIKES: LOOK_ALIKES,
        MIN_LENGTH: MIN_LENGTH,
        MAX_LENGTH: MAX_LENGTH,
        MIN_WORDS: MIN_WORDS,
        MAX_WORDS: MAX_WORDS,
        SEPARATORS: SEPARATORS,
        randomInt: randomInt,
        charset: charset,
        clampLength: clampLength,
        generate: generate,
        poolSize: poolSize,
        strength: strength,
        rate: rate,
        clampWords: clampWords,
        generatePassphrase: generatePassphrase,
        passphraseBits: passphraseBits
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    global.PasswordGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
