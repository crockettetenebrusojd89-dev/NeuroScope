"""Server-side playground sessions (in-memory, per process)."""

import itertools
import threading

_lock = threading.Lock()
_sessions = {}
_counter = itertools.count(1)


def create_session(obj):
    with _lock:
        sid = f"s{next(_counter)}"
        _sessions[sid] = obj
    return sid


def get_session(sid):
    return _sessions.get(sid)


def drop_session(sid):
    with _lock:
        _sessions.pop(sid, None)
