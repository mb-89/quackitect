"""Where the log lives and who is calling, read from the environment."""

import json
import os

from .engine import Engine
from .store import Store


def db_path():
    return os.environ.get("BATON_DB", os.path.abspath("baton.db"))


def actor():
    return os.environ.get("BATON_ACTOR", "agent:local")


def open_engine(path=None):
    settings = json.loads(os.environ.get("BATON_SETTINGS", "{}"))
    return Engine(Store(path or db_path()), settings)
