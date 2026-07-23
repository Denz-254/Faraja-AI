import json
from pathlib import Path


def load_json_file(relative_path: str) -> dict:
    path = Path(__file__).resolve().parent.parent / relative_path
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)
