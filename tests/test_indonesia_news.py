"""Tests for Indonesian RSS news source + .JK routing.

Source-of-truth contracts pinned here:
  - RSS parser handles RSS 2.0 + missing pub-date gracefully
  - Relevance match works against both ticker stem and company-name aliases
  - Cross-source dedup by lowercased title
  - get_news() in news_data_tools.py routes .JK tickers to get_news_indonesia
  - .JK benchmark resolves to ^JKSE (Jakarta Composite)

We do NOT hit the live RSS endpoints in tests — every fetch is monkey-
patched to return canned XML. Live integration is verified manually via
the dashboard worker (out of scope for unit tests, which must be hermetic).
"""

from __future__ import annotations

import pytest

from tradingagents.dataflows import indonesia_news


# A minimal RSS 2.0 sample. Two items, one matching BBCA, one not.
_RSS_SAMPLE = b"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Detik Finance</title>
    <item>
      <title>Bank Central Asia laporkan laba bersih Q1 naik 12%</title>
      <description>BCA mengumumkan laba bersih kuartal pertama meningkat dibanding tahun lalu.</description>
      <link>https://finance.detik.com/article/123</link>
      <pubDate>Mon, 19 May 2026 08:00:00 +0700</pubDate>
    </item>
    <item>
      <title>Harga emas Antam stabil di level Rp 1.2 juta</title>
      <description>Harga emas batangan tidak banyak berubah pekan ini.</description>
      <link>https://finance.detik.com/article/124</link>
      <pubDate>Mon, 19 May 2026 09:00:00 +0700</pubDate>
    </item>
  </channel>
</rss>
"""


def test_parse_rss_extracts_title_description_link_pubdate():
    items = indonesia_news._parse_rss(_RSS_SAMPLE)
    assert len(items) == 2
    first = items[0]
    assert "Bank Central Asia" in first["title"]
    assert "kuartal pertama" in first["description"]
    assert first["link"] == "https://finance.detik.com/article/123"
    assert first["pub_date"] is not None


def test_parse_rss_handles_malformed_body():
    # Garbage in → empty list out, no exception.
    assert indonesia_news._parse_rss(b"not xml at all") == []


def test_aliases_includes_company_names_for_known_ticker():
    aliases = indonesia_news._aliases_for("BBCA.JK")
    # Stem + curated names (Bank Central Asia, BCA)
    assert "BBCA" in aliases
    assert "Bank Central Asia" in aliases
    assert "BCA" in aliases


def test_aliases_for_unknown_ticker_falls_back_to_stem_only():
    aliases = indonesia_news._aliases_for("XXXX.JK")
    assert aliases == ["XXXX"]


def test_matches_finds_company_name_in_description():
    item = {
        "title": "Saham unggulan menguat",
        "description": "Bank Central Asia mencatat kenaikan harga saham hari ini.",
    }
    assert indonesia_news._matches(item, ["BBCA", "Bank Central Asia", "BCA"])


def test_matches_case_insensitive():
    item = {"title": "BcA mencatat laba", "description": ""}
    assert indonesia_news._matches(item, ["BBCA", "BCA"])


def test_matches_returns_false_when_no_alias_in_text():
    item = {"title": "Harga emas naik", "description": "Antam stabil"}
    assert not indonesia_news._matches(item, ["BBCA", "Bank Central Asia"])


def test_get_news_indonesia_filters_relevant_and_formats(monkeypatch):
    monkeypatch.setattr(indonesia_news, "_fetch_rss", lambda url: _RSS_SAMPLE)
    out = indonesia_news.get_news_indonesia("BBCA.JK", "2026-05-19", "2026-05-19")
    # Header present, ticker name reflected
    assert "BBCA.JK News (Indonesia)" in out
    # Matching item present; irrelevant item filtered out
    assert "Bank Central Asia" in out
    assert "Harga emas Antam" not in out
    # Source label present
    assert "(source: Detik Finance)" in out


def test_get_news_indonesia_empty_result_returns_helpful_string(monkeypatch):
    monkeypatch.setattr(indonesia_news, "_fetch_rss", lambda url: _RSS_SAMPLE)
    # XXXX has no aliases AND no RSS item matches — empty result
    out = indonesia_news.get_news_indonesia("XXXX.JK", "2026-05-19", "2026-05-19")
    assert "No Indonesian news found" in out
    assert "XXXX.JK" in out


def test_get_news_indonesia_survives_all_sources_failing(monkeypatch):
    # Network down — every _fetch_rss returns None. Function must not raise.
    monkeypatch.setattr(indonesia_news, "_fetch_rss", lambda url: None)
    out = indonesia_news.get_news_indonesia("BBCA.JK", "2026-05-19", "2026-05-19")
    assert "No Indonesian news found" in out


def test_get_news_indonesia_invalid_date_returns_error_string():
    out = indonesia_news.get_news_indonesia("BBCA.JK", "not-a-date", "2026-05-19")
    assert out.startswith("Error: invalid date range")


def test_get_news_indonesia_dedups_across_sources(monkeypatch):
    # Same title returned by both feeds → only one copy in output.
    def both_sources_return_same(_url):
        return _RSS_SAMPLE
    monkeypatch.setattr(indonesia_news, "_fetch_rss", both_sources_return_same)
    out = indonesia_news.get_news_indonesia("BBCA.JK", "2026-05-19", "2026-05-19")
    assert out.count("Bank Central Asia laporkan laba bersih Q1 naik 12%") == 1


def test_news_data_tools_get_news_routes_jk_to_indonesia():
    """The @tool wrapper in news_data_tools must dispatch .JK tickers to
    get_news_indonesia and everything else to route_to_vendor. Critical
    contract — without it the News Analyst falls back to global vendors
    with poor IDX coverage.

    Source-string inspection rather than behavioral test because importing
    news_data_tools pulls in tradingagents.agents → langchain_core, which
    isn't installed in the root test environment (same dep gap that blocks
    the 11 pre-existing library-test collection errors documented in
    PROGRESS.md). PR #15 used this same pattern to pin its worker-module
    import contract — see server/tests/test_worker_module_imports.py.
    """
    from pathlib import Path

    src_path = (
        Path(__file__).resolve().parent.parent
        / "tradingagents"
        / "agents"
        / "utils"
        / "news_data_tools.py"
    )
    src = src_path.read_text(encoding="utf-8")

    # The suffix tuple must include .JK.
    assert (
        '".JK"' in src or "'.JK'" in src
    ), "_REGIONAL_NEWS_SUFFIXES must include '.JK'"

    # get_news must check ticker.endswith(...) before calling route_to_vendor.
    assert "_REGIONAL_NEWS_SUFFIXES" in src
    assert "endswith(_REGIONAL_NEWS_SUFFIXES)" in src

    # And it must import + call get_news_indonesia in the .JK branch.
    # Whitespace-tolerant: the call may be single-line or split across
    # multiple lines once max_articles=... is added (see config-honor
    # commit). We just check that the function is invoked at all.
    assert "from tradingagents.dataflows.indonesia_news import get_news_indonesia" in src
    assert "get_news_indonesia(" in src
    assert "ticker, start_date, end_date" in src

    # And the non-regional branch must still go through route_to_vendor.
    assert 'route_to_vendor("get_news", ticker, start_date, end_date)' in src


def test_bmri_alias_does_not_match_independence_word_articles():
    """Smoking-gun regression: 'mandiri' is Indonesian for 'independent /
    self-sufficient' and appears in countless unrelated articles
    (independent shoe producers, independent farmers, independent schools).
    BMRI's alias list must NOT include the bare word 'Mandiri' or the news
    analyst will get a pile of shoe-industry / agriculture / education news
    when the user asks about Bank Mandiri. The full company name 'Bank
    Mandiri' is the only safe short-form alias."""
    aliases = indonesia_news._aliases_for("BMRI.JK")
    assert "BMRI" in aliases
    assert "Bank Mandiri" in aliases
    assert "Mandiri" not in aliases, (
        "Bare 'Mandiri' is a common Indonesian word — see the alias-ambiguity "
        "rule in indonesia_news._TICKER_ALIASES docstring."
    )

    # Real-shape false-positive articles that must NOT match BMRI.
    shoe_article = {
        "title": "UMKM sepatu mandiri tembus pasar ekspor",
        "description": "Pengrajin sepatu mandiri di Bandung berhasil mengekspor "
        "ke Malaysia tahun ini.",
    }
    farmer_article = {
        "title": "Petani mandiri di Jawa Barat raih panen melimpah",
        "description": "Kelompok tani mandiri mengembangkan budidaya organik.",
    }
    assert not indonesia_news._matches(shoe_article, aliases), (
        "Independent-shoe article must NOT match BMRI after the alias fix."
    )
    assert not indonesia_news._matches(farmer_article, aliases), (
        "Independent-farmer article must NOT match BMRI after the alias fix."
    )

    # Positive: real Bank Mandiri article still matches.
    real_bmri_article = {
        "title": "Bank Mandiri umumkan laba bersih Q1 naik 18%",
        "description": "Bank Mandiri mencatat pertumbuhan kredit yang solid "
        "didukung segmen ritel.",
    }
    assert indonesia_news._matches(real_bmri_article, aliases)


def test_asii_alias_does_not_match_generic_astra_word():
    """Same rule for ASII: bare 'Astra' is a common name/word (Astra school,
    Astra astronomy society, etc.). Only 'Astra International' (full name)
    and the ticker stem stay as aliases."""
    aliases = indonesia_news._aliases_for("ASII.JK")
    assert "ASII" in aliases
    assert "Astra International" in aliases
    assert "Astra" not in aliases

    unrelated = {
        "title": "Astra school of design buka pendaftaran",
        "description": "Sekolah desain Astra di Jakarta menerima siswa baru.",
    }
    assert not indonesia_news._matches(unrelated, aliases)

    real_asii = {
        "title": "Astra International catat penjualan mobil Q1 turun 8%",
        "description": "Astra International mencatat penurunan penjualan.",
    }
    assert indonesia_news._matches(real_asii, aliases)


def test_matches_word_boundary_excludes_substring_false_positives():
    """PR #17 reviewer flagged that 3-char aliases (BCA, BRI, BNI, PGN)
    would substring-match unrelated text. Word-boundary regex match fixes
    this — e.g. 'ABCA Mining' must NOT pull into BBCA results."""
    # Clear positive: BCA as a standalone word
    assert indonesia_news._matches(
        {"title": "BCA mengumumkan laba", "description": ""},
        ["BBCA", "BCA"],
    )
    # Clear positive: surrounded by punctuation (\b still fires)
    assert indonesia_news._matches(
        {"title": "(BCA) catat rekor", "description": ""},
        ["BBCA", "BCA"],
    )
    # Negative: BCA embedded in a longer word — false positive before
    # the boundary fix, correctly excluded now.
    assert not indonesia_news._matches(
        {"title": "ABCA Mining Group", "description": ""},
        ["BBCA", "BCA"],
    )
    # Negative: BNI inside another word
    assert not indonesia_news._matches(
        {"title": "REBNIumumkan", "description": ""},
        ["BBNI", "BNI"],
    )


def test_news_data_tools_honors_news_article_limit_config():
    """PR #17 reviewer flagged that get_news_indonesia was hard-coded to
    max_articles=20 instead of reading news_article_limit from config the
    way get_news_yfinance does. This source-string test pins the wiring
    so a future refactor that drops the config read fails loudly.

    Behavioral test (importing news_data_tools) is blocked by the same
    langchain_core gap as the routing test above — see PR #15 precedent.
    """
    from pathlib import Path

    src_path = (
        Path(__file__).resolve().parent.parent
        / "tradingagents"
        / "agents"
        / "utils"
        / "news_data_tools.py"
    )
    src = src_path.read_text(encoding="utf-8")

    assert "from tradingagents.dataflows.config import get_config" in src, (
        "news_data_tools.get_news must import get_config in the .JK branch"
    )
    assert 'get_config()["news_article_limit"]' in src, (
        "news_data_tools.get_news must read news_article_limit from config"
    )
    assert "max_articles=" in src, (
        "news_data_tools.get_news must pass max_articles= so the config "
        "value reaches get_news_indonesia"
    )


def test_news_analyst_prompt_carries_relevance_filter():
    """The news_analyst system_message must instruct the LLM to filter
    get_global_news output for relevance to the specific ticker — otherwise
    Yahoo/Alpha-Vantage trending news (which is dominated by shoe-industry,
    fashion-retail, and unrelated commodity stories at any given moment)
    pads the 'global news' section of every report with content that has
    nothing to do with the company.

    Source-string inspection rather than behavioral test for the same
    langchain_core dep-gap reason as the routing tests above (see PR #15
    precedent in server/tests/test_worker_module_imports.py)."""
    from pathlib import Path

    src_path = (
        Path(__file__).resolve().parent.parent
        / "tradingagents"
        / "agents"
        / "analysts"
        / "news_analyst.py"
    )
    src = src_path.read_text(encoding="utf-8")

    # The instruction must use a recognizable filter marker. We pin
    # 'RELEVANCE FILTER' as the canonical phrase a future contributor
    # would search for; renaming it requires updating this test on
    # purpose.
    assert "RELEVANCE FILTER" in src, (
        "news_analyst system_message must contain the 'RELEVANCE FILTER' "
        "instruction so global_news output is ticker-filtered."
    )

    # Concrete by-example anti-pattern: a bank analysis must NOT include
    # shoe-industry stories. Calling this out by name in the prompt teaches
    # the LLM what 'irrelevant' means with a real failure mode we hit on
    # 2026-05-31 (BMRI.JK report stuffed with Footwear News).
    assert "shoe-industry" in src.lower(), (
        "news_analyst prompt must call out shoe-industry as a concrete "
        "anti-pattern — the real failure mode the relevance filter prevents."
    )

    # The 'no relevant news' permission keeps the LLM honest — without it,
    # the model pads to look thorough.
    assert "say so explicitly" in src.lower() or "rather than pad" in src.lower(), (
        "news_analyst prompt must give the LLM permission to say 'no "
        "relevant news' instead of padding the report with noise."
    )


def test_jk_benchmark_resolves_to_jkse():
    """Pin the .JK → ^JKSE mapping. Future config edits that drop or
    rename this entry will break alpha calculation for Indonesian
    decisions silently — this test fails loudly instead."""
    from tradingagents.default_config import DEFAULT_CONFIG

    assert DEFAULT_CONFIG["benchmark_map"][".JK"] == "^JKSE"
