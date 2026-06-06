from __future__ import annotations
from dataclasses import dataclass, field
from fastapi import WebSocket

MAX_LOG = 50


@dataclass
class Room:
    code: str
    players: dict[str, WebSocket] = field(default_factory=dict)
    log: list[dict] = field(default_factory=list)


_rooms: dict[str, Room] = {}


def get_or_create(code: str) -> Room:
    if code not in _rooms:
        _rooms[code] = Room(code=code)
    return _rooms[code]


def remove_player(room: Room, name: str) -> None:
    room.players.pop(name, None)
    if not room.players:
        _rooms.pop(room.code, None)
