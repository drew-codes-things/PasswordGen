import argparse
import base64
import secrets
import string
import sys
import zlib

UPPER = string.ascii_uppercase
LOWER = string.ascii_lowercase
DIGITS = string.digits
SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/|"
LOOK_ALIKES = set("IOilo01|")
MIN_LENGTH = 8
MAX_LENGTH = 64
MIN_WORDS = 3
MAX_WORDS = 10
SEPARATORS = {"dash": "-", "dot": ".", "underscore": "_", "space": " "}
WORDS_DATA = (
    "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"
    "3/8D/KSJiA=="
)
_WORDS = []


def word_list():
    if not _WORDS:
        _WORDS.extend(zlib.decompress(base64.b64decode("".join(WORDS_DATA))).decode().split("\n"))
    return _WORDS


def charset(chars, avoid_look_alikes):
    if not avoid_look_alikes:
        return chars
    return "".join(c for c in chars if c not in LOOK_ALIKES)


def generate(length=16, upper=True, lower=True, digits=True, symbols=True, avoid_look_alikes=True):
    if not MIN_LENGTH <= length <= MAX_LENGTH:
        raise ValueError(f"length must be between {MIN_LENGTH} and {MAX_LENGTH}")
    chosen = [(UPPER, upper), (LOWER, lower), (DIGITS, digits), (SYMBOLS, symbols)]
    sets = [charset(chars, avoid_look_alikes) for chars, on in chosen if on]
    sets = [s for s in sets if s]
    if not sets:
        raise ValueError("pick at least one character type")
    pool = "".join(sets)
    chars = [secrets.choice(s) for s in sets]
    chars += [secrets.choice(pool) for _ in range(length - len(chars))]
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


def generate_passphrase(words=6, separator="-", capitalise=False, number=True):
    if not MIN_WORDS <= words <= MAX_WORDS:
        raise ValueError(f"words must be between {MIN_WORDS} and {MAX_WORDS}")
    chosen = [secrets.choice(word_list()) for _ in range(words)]
    if capitalise:
        chosen = [w[:1].upper() + w[1:] for w in chosen]
    if number:
        at = secrets.randbelow(words)
        chosen[at] += str(secrets.randbelow(10))
    return separator.join(chosen)


def ask_number(label, low, high, current):
    while True:
        raw = input(f"  {label} ({low}-{high}, enter keeps {current}): ").strip()
        if not raw:
            return current
        if raw.isdigit() and low <= int(raw) <= high:
            return int(raw)
        print(f"  Enter a whole number from {low} to {high}.")


def interactive():
    opts = {"length": 16, "upper": True, "lower": True, "digits": True, "symbols": True, "avoid_look_alikes": True}
    names = {"u": "upper", "l": "lower", "d": "digits", "s": "symbols", "a": "avoid_look_alikes"}
    phrase = {"words": 6, "separator": "-", "capitalise": False, "number": True}
    mode = "password"
    while True:
        if mode == "passphrase":
            print(f"\n  {generate_passphrase(**phrase)}\n")
            print(f"  Passphrase, {phrase['words']} words  |  capitals {'on' if phrase['capitalise'] else 'off'}  number {'on' if phrase['number'] else 'off'}")
            print("  [enter] new passphrase   [w] change word count   [c] capitals   [n] number   [p] password mode   [q] quit")
            try:
                choice = input("  > ").strip().lower()
            except (EOFError, KeyboardInterrupt):
                print()
                return
            if choice == "q":
                return
            if choice == "p":
                mode = "password"
            elif choice == "w":
                phrase["words"] = ask_number("Words", MIN_WORDS, MAX_WORDS, phrase["words"])
            elif choice == "c":
                phrase["capitalise"] = not phrase["capitalise"]
            elif choice == "n":
                phrase["number"] = not phrase["number"]
            elif choice:
                print("  Not one of the options.")
            continue
        print(f"\n  {generate(**opts)}\n")
        flags = "  ".join(f"{label} {'on' if opts[key] else 'off'}" for label, key in
                          (("A-Z", "upper"), ("a-z", "lower"), ("0-9", "digits"), ("!@#", "symbols"), ("no look-alikes", "avoid_look_alikes")))
        print(f"  Length {opts['length']}  |  {flags}")
        print("  [enter] new password   [l] change length   [t] toggle a character type   [p] passphrase mode   [q] quit")
        try:
            choice = input("  > ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if choice == "q":
            return
        if choice == "p":
            mode = "passphrase"
        elif choice == "l":
            opts["length"] = ask_number("Length", MIN_LENGTH, MAX_LENGTH, opts["length"])
        elif choice == "t":
            print("  Toggle which? [u] A-Z  [l] a-z  [d] 0-9  [s] symbols  [a] avoid look-alikes")
            try:
                key = names.get(input("  > ").strip().lower())
            except (EOFError, KeyboardInterrupt):
                print()
                return
            if not key:
                print("  Not one of the options.")
                continue
            opts[key] = not opts[key]
            if not any(opts[k] for k in ("upper", "lower", "digits", "symbols")):
                opts[key] = True
                print("  At least one character type has to stay on.")
        elif choice:
            print("  Not one of the options.")


def main(argv=None):
    parser = argparse.ArgumentParser(description="Generate strong random passwords and passphrases.")
    parser.add_argument("-l", "--length", type=int, default=16, help=f"characters per password ({MIN_LENGTH}-{MAX_LENGTH}, default 16)")
    parser.add_argument("-n", "--count", type=int, default=0, help="print this many passwords and exit")
    parser.add_argument("--no-upper", action="store_true", help="leave out A-Z")
    parser.add_argument("--no-lower", action="store_true", help="leave out a-z")
    parser.add_argument("--no-digits", action="store_true", help="leave out 0-9")
    parser.add_argument("--no-symbols", action="store_true", help="leave out symbols")
    parser.add_argument("--allow-look-alikes", action="store_true", help="allow I O i l o 0 1 |")
    parser.add_argument("-p", "--passphrase", action="store_true", help="make passphrases from the EFF long word list instead")
    parser.add_argument("-w", "--words", type=int, default=6, help=f"words per passphrase ({MIN_WORDS}-{MAX_WORDS}, default 6)")
    parser.add_argument("--separator", choices=sorted(SEPARATORS), default="dash", help="what goes between words (default dash)")
    parser.add_argument("--capitalise", action="store_true", help="start each word with a capital")
    parser.add_argument("--no-number", action="store_true", help="leave out the digit added to one word")
    args = parser.parse_args(argv)

    if args.count <= 0 and sys.stdin.isatty():
        interactive()
        return 0
    try:
        for _ in range(max(1, args.count)):
            if args.passphrase:
                print(generate_passphrase(args.words, SEPARATORS[args.separator], args.capitalise, not args.no_number))
                continue
            print(generate(args.length, not args.no_upper, not args.no_lower, not args.no_digits,
                           not args.no_symbols, not args.allow_look_alikes))
    except ValueError as error:
        parser.error(str(error))
    return 0


if __name__ == "__main__":
    sys.exit(main())
