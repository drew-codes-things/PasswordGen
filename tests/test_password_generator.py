import os
import re
import sys

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import password_generator as pg

ALL_TYPES = {"length": 16, "upper": True, "lower": True, "digits": True, "symbols": True, "avoid_look_alikes": True}
SAMPLES = 300


def test_passwords_have_one_of_each_type_and_no_look_alikes():
    for _ in range(SAMPLES):
        password = pg.generate(**ALL_TYPES)
        assert len(password) == 16
        assert re.search(r"[A-Z]", password) and re.search(r"[a-z]", password)
        assert re.search(r"[0-9]", password) and re.search(r"[^A-Za-z0-9]", password)
        assert not pg.LOOK_ALIKES & set(password)


def test_length_limits():
    assert len(pg.generate(**{**ALL_TYPES, "length": pg.MIN_LENGTH})) == pg.MIN_LENGTH
    assert len(pg.generate(**{**ALL_TYPES, "length": pg.MAX_LENGTH})) == pg.MAX_LENGTH
    for length in (pg.MIN_LENGTH - 1, pg.MAX_LENGTH + 1):
        with pytest.raises(ValueError, match="length must be between"):
            pg.generate(**{**ALL_TYPES, "length": length})


def test_a_single_type_and_no_type():
    assert re.fullmatch(r"[0-9]+", pg.generate(20, upper=False, lower=False, digits=True, symbols=False, avoid_look_alikes=False))
    with pytest.raises(ValueError, match="at least one"):
        pg.generate(12, upper=False, lower=False, digits=False, symbols=False)


def test_the_word_list_is_the_eff_long_list():
    assert len(pg.word_list()) == 7776
    assert len(set(pg.word_list())) == 7776


def test_passphrases_use_listed_words():
    words = set(pg.word_list())
    for _ in range(SAMPLES):
        parts = pg.generate_passphrase(6, ".", capitalise=False, number=False).split(".")
        assert len(parts) == 6 and all(part in words for part in parts)


def test_passphrases_can_be_capitalised_with_one_digit():
    for _ in range(SAMPLES):
        phrase = pg.generate_passphrase(4, " ", capitalise=True, number=True)
        parts = phrase.split(" ")
        assert len(parts) == 4
        assert len(re.findall(r"[0-9]", phrase)) == 1
        assert all(re.match(r"[A-Z]", part) for part in parts)


def test_word_count_limits():
    for words in (pg.MIN_WORDS - 1, pg.MAX_WORDS + 1):
        with pytest.raises(ValueError, match="words must be between"):
            pg.generate_passphrase(words)

