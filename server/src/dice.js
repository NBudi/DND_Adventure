function parseAndRoll(notation) {
  const raw = notation.trim().toLowerCase().replace(/\s/g, '');
  const m = raw.match(/^(\d*)d(\d+)([+-]\d+)?$/);

  if (!m) {
    throw new Error(`Invalid notation '${notation}'. Use format like 1d20, 2d6+3`);
  }

  const count = parseInt(m[1]) || 1;
  const sides = parseInt(m[2]);
  const modifier = m[3] ? parseInt(m[3]) : 0;

  if (count < 1 || count > 100) throw new Error('Dice count must be 1–100');
  if (sides < 2) throw new Error('Dice must have at least 2 sides');

  const rolls = Array.from({ length: count }, () =>
    Math.floor(Math.random() * sides) + 1
  );
  const total = rolls.reduce((a, b) => a + b, 0) + modifier;

  let breakdown = count === 1 ? String(rolls[0]) : `[${rolls.join(', ')}]`;
  if (modifier > 0) breakdown += ` +${modifier}`;
  else if (modifier < 0) breakdown += ` ${modifier}`;

  return { notation: raw, rolls, count, sides, modifier, total, breakdown };
}

module.exports = { parseAndRoll };
