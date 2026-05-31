"""Locale plumbing: launch → DB row → worker config → parser robustness.

Covers the feature end-to-end at the seams that matter:
  - RunCreate accepts an optional locale (default "en") and refuses anything else.
  - dispatch_run writes the locale onto the Run row.
  - _build_config maps Run.locale → output_language ("en"→English, "id"→
    "Bahasa Indonesia") so the agents' get_language_instruction() picks it up.
  - parse_rating still extracts a 5-tier rating from Indonesian prose that
    embeds a literal English "Rating: Buy" token — this is the guarantee the
    rating-token mandate in get_rating_language_instruction() relies on.
"""
import uuid

import pytest
from pydantic import ValidationError
from sqlalchemy import select

from app.models.run import Run
from app.models.user import User
from app.schemas.run import RunCreate
from app.services.run_dispatcher import dispatch_run
from app.workers.tasks import _LOCALE_TO_LANGUAGE, _build_config

# NOTE: do NOT add `from tradingagents...` imports at module scope. The
# tradingagents package __init__ calls load_dotenv(), which leaks the dev
# .env into process env at collection time and breaks test_config's
# default-provider assertion. Import parse_rating inside the test bodies.


class _FakePool:
    async def enqueue_job(self, name, *args, **kwargs):
        return object()


def test_run_create_locale_defaults_to_en():
    body = RunCreate(ticker="NVDA", trade_date="2024-05-10")
    assert body.locale == "en"


def test_run_create_accepts_id_locale():
    body = RunCreate(ticker="NVDA", trade_date="2024-05-10", locale="id")
    assert body.locale == "id"


def test_run_create_rejects_unknown_locale():
    with pytest.raises(ValidationError):
        RunCreate(ticker="NVDA", trade_date="2024-05-10", locale="jp")


@pytest.mark.asyncio
async def test_dispatch_run_persists_locale(db_session, tmp_path):
    uid = uuid.uuid4()
    db_session.add(User(id=uid, github_id="gh-loc"))
    await db_session.flush()

    body = RunCreate(ticker="BBCA.JK", trade_date="2024-05-10", locale="id")
    run = await dispatch_run(
        session=db_session,
        pool=_FakePool(),
        user_id=uid,
        dashboard_dir=tmp_path,
        body=body,
    )
    assert run.locale == "id"

    # Reload from DB to confirm the server_default + column write are both honored.
    refetched = (
        await db_session.execute(select(Run).where(Run.id == run.id))
    ).scalar_one()
    assert refetched.locale == "id"


@pytest.mark.asyncio
async def test_dispatch_run_default_locale_is_en(db_session, tmp_path):
    uid = uuid.uuid4()
    db_session.add(User(id=uid, github_id="gh-loc-default"))
    await db_session.flush()

    body = RunCreate(ticker="NVDA", trade_date="2024-05-10")  # no locale arg
    run = await dispatch_run(
        session=db_session,
        pool=_FakePool(),
        user_id=uid,
        dashboard_dir=tmp_path,
        body=body,
    )
    assert run.locale == "en"


def test_build_config_maps_id_locale_to_indonesian():
    run = Run(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        ticker="NVDA",
        trade_date="2024-05-10",
        results_path="/tmp/x",
        locale="id",
    )
    cfg = _build_config(run)
    assert cfg["output_language"] == "Bahasa Indonesia"


def test_build_config_maps_en_locale_to_english():
    run = Run(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        ticker="NVDA",
        trade_date="2024-05-10",
        results_path="/tmp/x",
        locale="en",
    )
    cfg = _build_config(run)
    assert cfg["output_language"] == "English"


def test_locale_to_language_map_covers_all_pydantic_locales():
    """The wire-level Locale enum must have a language mapping for every value.

    If someone adds a third locale to schemas/run.py without updating the
    worker map, _build_config silently falls back to English — that's the
    bug this test catches.
    """
    from typing import get_args
    from app.schemas.run import Locale

    for locale in get_args(Locale):
        assert locale in _LOCALE_TO_LANGUAGE, (
            f"Locale '{locale}' is in schemas.run.Locale but missing from "
            f"_LOCALE_TO_LANGUAGE in workers/tasks.py"
        )


def test_parse_rating_finds_english_token_in_indonesian_prose():
    """The whole point of the rating-token mandate in
    get_rating_language_instruction() — the LLM writes prose in ID but keeps
    the literal 'Rating: X' token in English so parse_rating still works.
    """
    from tradingagents.agents.utils.rating import parse_rating

    indonesian_decision = """
    Berdasarkan analisis menyeluruh dari tim analis, momentum harga NVDA
    menunjukkan tren positif yang berkelanjutan. Fundamentalnya kuat dengan
    pertumbuhan pendapatan dua digit setiap kuartal.

    **Rating: Buy**

    Rekomendasi: tambah posisi pada level harga saat ini.
    """
    assert parse_rating(indonesian_decision) == "Buy"


def test_parse_rating_falls_back_to_default_when_only_indonesian_words():
    """If the LLM ignores the mandate and translates the rating word too,
    parse_rating should return its default rather than silently picking up
    a random Indonesian word as the rating. This is the failure mode we're
    protecting against by requiring the English token in the prompt."""
    from tradingagents.agents.utils.rating import parse_rating

    indonesian_only = "Saya merekomendasikan untuk Beli NVDA pada level ini."
    assert parse_rating(indonesian_only) == "Hold"  # default — no English token found
