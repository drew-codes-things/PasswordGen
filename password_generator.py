import secrets
import string

UPPER   = ''.join(c for c in string.ascii_uppercase if c not in 'IO')
LOWER   = ''.join(c for c in string.ascii_lowercase if c not in 'ilo')
DIGITS  = ''.join(c for c in string.digits if c not in '01')
SPECIAL = '!@#$%^&*()_+[]{}|;:,.<>?'
POOL    = UPPER + LOWER + DIGITS + SPECIAL


def generate(length=16, use_upper=True, use_lower=True, use_digits=True, use_special=True):
    """Generate a cryptographically secure password.

    Args:
        length (int): Password length (8-32). Default 16.
        use_upper  (bool): Include uppercase letters.
        use_lower  (bool): Include lowercase letters.
        use_digits (bool): Include digits.
        use_special(bool): Include special characters.
    """
    active_sets = []
    if use_upper:   active_sets.append(UPPER)
    if use_lower:   active_sets.append(LOWER)
    if use_digits:  active_sets.append(DIGITS)
    if use_special: active_sets.append(SPECIAL)

    if not active_sets:
        raise ValueError('At least one character set must be enabled.')

    pool = ''.join(active_sets)

    guaranteed = [secrets.choice(s) for s in active_sets]
    rest = [secrets.choice(pool) for _ in range(length - len(guaranteed))]
    pw = guaranteed + rest
    secrets.SystemRandom().shuffle(pw)
    return ''.join(pw)


def prompt_length():
    while True:
        raw = input('  Length (8-32, default 16): ').strip()
        if not raw:
            return 16
        try:
            n = int(raw)
            if 8 <= n <= 32:
                return n
            print('  Please enter a number between 8 and 32.')
        except ValueError:
            print('  Invalid input.')


def main():
    length = 16
    use_upper = use_lower = use_digits = use_special = True

    while True:
        try:
            pw = generate(length, use_upper, use_lower, use_digits, use_special)
        except ValueError as e:
            print(f'  Error: {e}')
            use_upper = use_lower = use_digits = use_special = True
            continue

        print(f'\n  {pw}\n')
        print(f'  Length: {length}  |  A-Z: {"on" if use_upper else "off"}  a-z: {"on" if use_lower else "off"}  0-9: {"on" if use_digits else "off"}  !@#: {"on" if use_special else "off"}')
        print('  [G] Generate new   [L] Change length   [T] Toggle charset   [Q] Quit')

        try:
            choice = input('  > ').strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if choice == 'q':
            break
        elif choice == 'g':
            continue
        elif choice == 'l':
            length = prompt_length()
        elif choice == 't':
            print('  Toggle: [U] A-Z  [L] a-z  [D] 0-9  [S] !@#')
            try:
                t = input('  > ').strip().lower()
            except (EOFError, KeyboardInterrupt):
                break
            if t == 'u': use_upper   = not use_upper
            elif t == 'l': use_lower = not use_lower
            elif t == 'd': use_digits = not use_digits
            elif t == 's': use_special = not use_special
            else: print('  Unrecognised toggle.')
        else:
            print('  Unrecognised input.')


if __name__ == '__main__':
    main()
