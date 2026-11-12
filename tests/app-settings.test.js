const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SETTINGS_KEY = 'passwordgen_settings';
const DEFAULT_LENGTH = 16;
const PAGE_SCRIPTS = ['ui.js', 'words.js', 'generator.js', 'app.js'];
const ASSETS = path.join(__dirname, '..', 'assets');

function fakeElement() {
    return {
        textContent: '',
        value: '',
        hidden: false,
        style: {},
        dataset: {},
        children: [],
        classList: { add() {}, remove() {}, toggle() {} },
        setAttribute() {},
        addEventListener() {},
        focus() {},
        appendChild(child) { this.children.push(child); }
    };
}

function fakeDocument(elements) {
    return {
        getElementById(id) {
            if (!elements[id]) elements[id] = fakeElement();
            return elements[id];
        },
        querySelectorAll() { return []; },
        addEventListener() {},
        createDocumentFragment: fakeElement,
        createElement: fakeElement,
        createTextNode(text) { return { textContent: text }; }
    };
}

function fakeLocalStorage(stored) {
    const values = stored === undefined ? {} : { [SETTINGS_KEY]: stored };
    return {
        getItem(key) { return key in values ? values[key] : null; },
        setItem(key, value) { values[key] = String(value); },
        removeItem(key) { delete values[key]; }
    };
}

function renderedPassword(output) {
    return output.children.map((fragment) => fragment.children.map((node) => node.textContent).join('')).join('');
}

function loadPage(stored) {
    const elements = {};
    const context = {
        document: fakeDocument(elements),
        localStorage: fakeLocalStorage(stored),
        crypto: globalThis.crypto,
        setTimeout,
        clearTimeout
    };
    context.window = context;
    vm.createContext(context);
    for (const script of PAGE_SCRIPTS) {
        vm.runInContext(fs.readFileSync(path.join(ASSETS, script), 'utf8'), context, { filename: script });
    }
    return renderedPassword(elements.pw);
}

assert.strictEqual(loadPage(undefined).length, DEFAULT_LENGTH, 'no saved settings gives the default length');
assert.strictEqual(loadPage('{"length": 24}').length, 24, 'saved settings are used');
for (const damaged of ['null', '42', '"abc"', '[1, 2, 3]', 'true']) {
    assert.strictEqual(loadPage(damaged).length, DEFAULT_LENGTH, 'saved settings of ' + damaged + ' fall back to defaults');
}

console.log('app-settings.test.js: all tests passed');
