<div align="center">

# PasswordGenerator

**A browser-based password generator. Cryptographically secure, keyboard-driven, zero dependencies.**

[![HTML](https://img.shields.io/badge/html-drew?style=flat-square&logo=html5&logoColor=FFFFFF&color=E34C26)](https://html.spec.whatwg.org/)
[![CSS](https://img.shields.io/badge/css-drew?style=flat-square&logo=css&logoColor=FFFFFF&color=663399)](https://www.w3.org/TR/css/#css)
[![JavaScript](https://img.shields.io/badge/javascript-drew?style=flat-square&logo=javascript&logoColor=F7DF1E&color=000000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Overview

PasswordGenerator produces a password on every load and on demand. It has two modes:

- **Random** - an adjustable-length password (8-32) built from the character classes you enable (upper, lower, digits, special), guaranteeing at least one character from each active set. Characters are shuffled using a Fisher-Yates algorithm backed by `window.crypto.getRandomValues`, so no `Math.random()` is involved anywhere.
- **Passphrase** - a word-based password of 3-10 short, unambiguous words, capitalised, joined by a random separator, with a trailing 2-digit number.

The strength meter shows a label plus the **estimated entropy in bits** for the current output, so you can see exactly how strong it is.

Ambiguous characters (`I`, `O`, `l`, `i`, `o`, `0`, `1`) are excluded from all random character sets by design - this prevents copy-paste confusion and misreads when writing passwords down.

---

## How It Works

`script.js` defines four hardened character sets:

| Set | Characters excluded |
|---|---|
| Uppercase | `I`, `O` |
| Lowercase | `i`, `l`, `o` |
| Digits | `0`, `1` |
| Special | None (`!@#$%^&*()_+[]{}|;:,.<>?`) |

The generator seeds the output array with 2 uppercase, 1 digit, and 1 special character, fills the remaining 8 slots from the full combined pool, then applies a Fisher-Yates shuffle using `window.crypto.getRandomValues` before displaying the result.

`password_generator.py` mirrors this logic exactly in Python using the `secrets` module - same charset, same exclusions, same guaranteed composition, for offline / CLI generation.

---

## Features

| Feature | Detail |
|---|---|
| Cryptographically secure | `window.crypto.getRandomValues` (JS) / `secrets` (Python) - no `Math.random()` |
| Guaranteed composition | At least 2 uppercase + 1 digit + 1 special character per password |
| No ambiguous characters | `I O l i o 0 1` excluded - prevents misread passwords |
| Keyboard shortcuts | `G` -> generate, `C` -> copy, then `Y` -> new / `N` -> keep, `Esc` -> dismiss |
| Copy confirmation overlay | Prompts after copying whether to generate a new password |
| Flash animation | Password display flashes on every new generation |
| Toast notifications | Non-blocking status messages for copy success and errors |
| Python CLI | `password_generator.py` generates passwords offline via `secrets` |
| Installable (PWA) | Web manifest + service worker - install it and generate passwords fully offline |
| No install or server | Runs entirely from `index.html` in any modern browser |

---

## Usage

Open `index.html` directly in a browser, or visit the live site:

**[https://password-gen.drew-gnr.xyz](https://password-gen.drew-gnr.xyz/)**

```
1. A password is generated automatically on page load
2. Press C (or click the copy button) to copy to clipboard
3. A confirmation overlay appears -- press Y to generate a new one, N to keep it
4. Press G at any time to generate a new password without copying
```

---

## Run Locally

```bash
git clone https://github.com/drew-codes-things/PasswordGen
cd PasswordGen
python -m http.server 8000
```

Then open `http://127.0.0.1:8000` in your browser.

To generate passwords from the command line instead:

```bash
python password_generator.py
```

---

## Keyboard Reference

| Key | Action |
|---|---|
| `G` | Generate a new password |
| `C` | Copy current password to clipboard |
| `Y` | Confirm overlay: generate a new password |
| `N` / `Esc` | Confirm overlay: dismiss and keep current password |
| `Enter` | Confirm overlay: same as `Y` |

---

## Notes

- The passphrase wordlist lives in `script.js`; entropy is reported honestly as `words × log2(listLength)` plus the separator and trailing-number contributions.
- `password_generator.py` mirrors the **random** mode for offline / CLI use.

---

## Get the Code

Clone with git:

```bash
git clone https://github.com/drew-codes-things/PasswordGen.git
```

Or with the [GitHub CLI](https://cli.github.com/):

```bash
gh repo clone drew-codes-things/PasswordGen
```

## License

MIT - made by [Drew](https://github.com/drew-codes-things)
