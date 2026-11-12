(function () {
    'use strict';

    var gen = window.PasswordGen;
    var SETTINGS_KEY = 'passwordgen_settings';
    var SET_NAMES = ['upper', 'lower', 'digits', 'symbols'];

    var saved = ui.get(SETTINGS_KEY, {});
    var settings = {
        length: gen.clampLength(saved.length || 16),
        upper: saved.upper !== false,
        lower: saved.lower !== false,
        digits: saved.digits !== false,
        symbols: saved.symbols !== false,
        avoidLookAlikes: saved.avoidLookAlikes !== false,
        mode: saved.mode === 'passphrase' ? 'passphrase' : 'password',
        words: gen.clampWords(saved.words || 6),
        separator: gen.SEPARATORS.indexOf(saved.separator) !== -1 ? saved.separator : '-',
        capitalise: saved.capitalise === true,
        number: saved.number !== false
    };
    if (!SET_NAMES.some(function (name) { return settings[name]; })) {
        SET_NAMES.forEach(function (name) { settings[name] = true; });
    }

    var output = document.getElementById('pw');
    var meterBar = document.getElementById('meterBar');
    var strengthLabel = document.getElementById('strengthLabel');
    var bitsLabel = document.getElementById('bits');
    var lengthRange = document.getElementById('lengthRange');
    var lengthNumber = document.getElementById('lengthNumber');
    var lengthValue = document.getElementById('lengthValue');
    var avoidBtn = document.getElementById('avoid');
    var copyBtn = document.getElementById('copy');
    var wordsRange = document.getElementById('wordsRange');
    var wordsNumber = document.getElementById('wordsNumber');
    var wordsValue = document.getElementById('wordsValue');
    var capitaliseBtn = document.getElementById('capitalise');
    var numberBtn = document.getElementById('addNumber');
    var pwOpts = document.getElementById('pwOpts');
    var ppOpts = document.getElementById('ppOpts');
    var current = '';

    var LEVEL_COLOURS = ['', 'var(--accent-text)', 'var(--warn)', '#e8c547', 'var(--ok)', 'var(--ok)'];

    function save() { ui.set(SETTINGS_KEY, settings); }

    function kindOf(ch) {
        if (settings.mode === 'passphrase') {
            if (/[0-9]/.test(ch)) return 'd';
            return ch === settings.separator && ch !== ' ' ? 's' : '';
        }
        if (gen.SETS.digits.indexOf(ch) !== -1) return 'd';
        if (gen.SETS.symbols.indexOf(ch) !== -1) return 's';
        return '';
    }

    function render(password) {
        output.textContent = '';
        var frag = document.createDocumentFragment();
        password.split('').forEach(function (ch) {
            var kind = kindOf(ch);
            if (!kind) { frag.appendChild(document.createTextNode(ch)); return; }
            var span = document.createElement('span');
            span.className = 'ch-' + kind;
            span.textContent = ch;
            frag.appendChild(span);
        });
        output.appendChild(frag);
        var phrase = settings.mode === 'passphrase';
        output.setAttribute('aria-label', phrase ? 'Generated passphrase, ' + settings.words + ' words' : 'Generated password, ' + password.length + ' characters');
        output.classList.toggle('phrase', phrase);
        output.classList.remove('flash');
        void output.offsetWidth;
        output.classList.add('flash');

        var s = phrase ? gen.rate(gen.passphraseBits(settings)) : gen.strength(password.length, gen.poolSize(settings));
        meterBar.style.width = (s.level * 20) + '%';
        meterBar.style.background = LEVEL_COLOURS[s.level];
        strengthLabel.textContent = s.label;
        strengthLabel.style.color = LEVEL_COLOURS[s.level];
        bitsLabel.textContent = 'about ' + s.bits + ' bits of entropy';
    }

    function generate() {
        try {
            current = settings.mode === 'passphrase' ? gen.generatePassphrase(settings) : gen.generate(settings);
            render(current);
        } catch (error) {
            ui.toast(error.message);
        }
    }

    function copy() {
        if (!current) return;
        ui.copy(current).then(function () {
            copyBtn.textContent = 'Copied';
            setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600);
            ui.toast((settings.mode === 'passphrase' ? 'Passphrase' : 'Password') + ' copied to the clipboard.', 'ok');
        }).catch(function () {
            ui.toast('Copying is blocked here. Select it and copy it by hand.');
        });
    }

    function setLength(value) {
        settings.length = gen.clampLength(value);
        lengthRange.value = settings.length;
        lengthNumber.value = settings.length;
        lengthValue.textContent = settings.length;
        save();
        generate();
    }

    function setWords(value) {
        settings.words = gen.clampWords(value);
        wordsRange.value = settings.words;
        wordsNumber.value = settings.words;
        wordsValue.textContent = settings.words;
        save();
        generate();
    }

    function syncMode() {
        document.querySelectorAll('[data-mode]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(btn.dataset.mode === settings.mode));
        });
        pwOpts.hidden = settings.mode !== 'password';
        ppOpts.hidden = settings.mode !== 'passphrase';
        document.querySelectorAll('[data-sep]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(btn.dataset.sep === settings.separator));
        });
        capitaliseBtn.setAttribute('aria-pressed', String(settings.capitalise));
        numberBtn.setAttribute('aria-pressed', String(settings.number));
    }

    function setMode(mode) {
        settings.mode = mode;
        syncMode();
        save();
        generate();
    }

    document.querySelectorAll('[data-mode]').forEach(function (btn) {
        btn.addEventListener('click', function () { setMode(btn.dataset.mode); });
    });

    document.querySelectorAll('[data-sep]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            settings.separator = btn.dataset.sep;
            syncMode();
            save();
            generate();
        });
    });

    [[capitaliseBtn, 'capitalise'], [numberBtn, 'number']].forEach(function (pair) {
        pair[0].addEventListener('click', function () {
            settings[pair[1]] = !settings[pair[1]];
            syncMode();
            save();
            generate();
        });
    });

    wordsRange.addEventListener('input', function () { setWords(wordsRange.value); });
    wordsNumber.addEventListener('change', function () { setWords(wordsNumber.value); });

    function syncSetButtons() {
        document.querySelectorAll('[data-set]').forEach(function (btn) {
            btn.setAttribute('aria-pressed', String(!!settings[btn.dataset.set]));
        });
        avoidBtn.setAttribute('aria-pressed', String(settings.avoidLookAlikes));
    }

    document.querySelectorAll('[data-set]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var name = btn.dataset.set;
            var activeCount = SET_NAMES.filter(function (n) { return settings[n]; }).length;
            if (settings[name] && activeCount === 1) {
                ui.toast('Keep at least one character type switched on.');
                return;
            }
            settings[name] = !settings[name];
            syncSetButtons();
            save();
            generate();
        });
    });

    avoidBtn.addEventListener('click', function () {
        settings.avoidLookAlikes = !settings.avoidLookAlikes;
        syncSetButtons();
        save();
        generate();
    });

    lengthRange.addEventListener('input', function () { setLength(lengthRange.value); });
    lengthNumber.addEventListener('change', function () { setLength(lengthNumber.value); });
    document.getElementById('generate').addEventListener('click', generate);
    copyBtn.addEventListener('click', copy);

    document.addEventListener('keydown', function (event) {
        if (event.ctrlKey || event.metaKey || event.altKey || ui.isTyping(event)) return;
        var key = event.key.toLowerCase();
        if (key === 'g') { event.preventDefault(); generate(); }
        if (key === 'c') { event.preventDefault(); copy(); }
        if (key === 'p') { event.preventDefault(); setMode(settings.mode === 'password' ? 'passphrase' : 'password'); }
    });

    lengthRange.min = lengthNumber.min = gen.MIN_LENGTH;
    lengthRange.max = lengthNumber.max = gen.MAX_LENGTH;
    lengthRange.value = lengthNumber.value = settings.length;
    lengthValue.textContent = settings.length;
    wordsRange.min = wordsNumber.min = gen.MIN_WORDS;
    wordsRange.max = wordsNumber.max = gen.MAX_WORDS;
    wordsRange.value = wordsNumber.value = settings.words;
    wordsValue.textContent = settings.words;
    syncSetButtons();
    syncMode();
    generate();
})();
