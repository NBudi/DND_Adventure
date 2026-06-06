import random
import re


def parse_and_roll(notation: str) -> dict:
    """Parse dice notation like 1d20+4 or 2d6 and return roll result."""
    raw = notation.strip().lower().replace(" ", "")
    m = re.match(r'^(\d*)d(\d+)([+-]\d+)?$', raw)
    if not m:
        raise ValueError(f"Invalid notation '{notation}'. Use format like 1d20, 2d6+3, d4-1")

    count_str, sides_str, mod_str = m.groups()
    count = int(count_str) if count_str else 1
    sides = int(sides_str)
    modifier = int(mod_str) if mod_str else 0

    if not 1 <= count <= 100:
        raise ValueError("Dice count must be between 1 and 100")
    if sides < 2:
        raise ValueError("Dice must have at least 2 sides")

    rolls = [random.randint(1, sides) for _ in range(count)]
    total = sum(rolls) + modifier

    if count == 1:
        breakdown = str(rolls[0])
    else:
        breakdown = "[" + ", ".join(str(r) for r in rolls) + "]"

    if modifier > 0:
        breakdown += f" +{modifier}"
    elif modifier < 0:
        breakdown += f" {modifier}"

    return {
        "notation": raw,
        "rolls": rolls,
        "count": count,
        "sides": sides,
        "modifier": modifier,
        "total": total,
        "breakdown": breakdown,
    }
