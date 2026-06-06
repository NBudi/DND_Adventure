# DND Adventure

A text-based Dungeons & Dragons adventure game built in Python, playable in the terminal.

## Features

- Classic D&D dice rolling (d4, d6, d8, d10, d12, d20, d100)
- Character creation with race, class, and stats
- Turn-based combat with monsters
- Inventory and item management
- Save/load game progress
- Dungeon exploration with branching story paths

## Requirements

- Python 3.10+

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/NBudi/DND_Adventure.git
   cd DND_Adventure
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv .venv

   # Windows
   .venv\Scripts\activate

   # macOS / Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the game**
   ```bash
   python src/main.py
   ```

## Project Structure

```
DND_Adventure/
├── src/
│   ├── __init__.py
│   ├── main.py          # Entry point
│   ├── character.py     # Character creation & stats
│   ├── combat.py        # Combat system
│   ├── dice.py          # Dice rolling utilities
│   ├── inventory.py     # Item & inventory management
│   └── world.py         # Dungeon & story logic
├── saves/               # Player save files (gitignored)
├── .gitignore
├── requirements.txt
└── README.md
```

## Gameplay

After launching, you will:
1. Create your character (name, race, class)
2. Roll for starting stats (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma)
3. Explore dungeons, fight monsters, and collect loot
4. Level up and grow more powerful

## Contributing

Pull requests are welcome. Please open an issue first to discuss any major changes.

## License

[MIT](https://choosealicense.com/licenses/mit/)
