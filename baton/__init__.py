"""baton: keep an LLM agent on track over long, multi-step work.

The log is the only state. A step closes when its gates pass, never because
the model says so. Every session starts from a card the harness renders out
of the log, so a context reset, a crash and a handover are the same event.
"""

from .engine import Engine, BatonError  # noqa: F401
