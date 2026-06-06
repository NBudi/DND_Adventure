from __future__ import annotations
import json
import random
import string
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .dice import parse_and_roll
from .rooms import Room, MAX_LOG, get_or_create, remove_player

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def index():
    return FileResponse("static/index.html")


@app.get("/room/{code}")
async def room_page(code: str):
    return FileResponse("static/room.html")


@app.get("/api/new-code")
async def new_code():
    return {"code": "".join(random.choices(string.ascii_uppercase, k=4))}


@app.websocket("/ws/{room_code}/{player_name}")
async def websocket_endpoint(ws: WebSocket, room_code: str, player_name: str):
    room = get_or_create(room_code.upper())

    # Resolve name collision by appending a number
    base = player_name[:20].strip() or "Adventurer"
    name = base
    suffix = 2
    while name in room.players:
        name = f"{base}{suffix}"
        suffix += 1

    await ws.accept()
    room.players[name] = ws

    # Send init to newcomer — includes full log history
    await ws.send_text(json.dumps({
        "type": "init",
        "you": name,
        "players": list(room.players.keys()),
        "log": room.log,
    }))

    # Announce join to everyone else
    await _broadcast(room, {
        "type": "system",
        "msg": f"{name} joined the room",
        "players": list(room.players.keys()),
        "ts": _ts(),
    }, exclude=name)

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)

            if msg.get("type") == "roll":
                notation = str(msg.get("notation", "")).strip()[:50]
                try:
                    r = parse_and_roll(notation)
                    payload = {
                        "type": "roll",
                        "player": name,
                        "notation": r["notation"],
                        "rolls": r["rolls"],
                        "sides": r["sides"],
                        "total": r["total"],
                        "breakdown": r["breakdown"],
                        "ts": _ts(),
                    }
                    room.log.append(payload)
                    room.log = room.log[-MAX_LOG:]
                    await _broadcast(room, payload)
                except ValueError as e:
                    await ws.send_text(json.dumps({"type": "error", "msg": str(e)}))

    except (WebSocketDisconnect, Exception):
        remove_player(room, name)
        await _broadcast(room, {
            "type": "system",
            "msg": f"{name} left the room",
            "players": list(room.players.keys()),
            "ts": _ts(),
        })


def _ts() -> str:
    return datetime.now().strftime("%H:%M:%S")


async def _broadcast(room: Room, payload: dict, exclude: str | None = None) -> None:
    text = json.dumps(payload)
    dead: list[str] = []
    for pname, pws in list(room.players.items()):
        if pname == exclude:
            continue
        try:
            await pws.send_text(text)
        except Exception:
            dead.append(pname)
    for pname in dead:
        remove_player(room, pname)
