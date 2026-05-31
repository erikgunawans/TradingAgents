from langchain_core.messages import HumanMessage, RemoveMessage

# Import tools from separate utility files
from tradingagents.agents.utils.core_stock_tools import (
    get_stock_data
)
from tradingagents.agents.utils.technical_indicators_tools import (
    get_indicators
)
from tradingagents.agents.utils.fundamental_data_tools import (
    get_fundamentals,
    get_balance_sheet,
    get_cashflow,
    get_income_statement
)
from tradingagents.agents.utils.news_data_tools import (
    get_news,
    get_insider_transactions,
    get_global_news
)


def get_language_instruction() -> str:
    """Return a prompt instruction for the configured output language.

    Returns empty string when English (default), so no extra tokens are used.
    Applied to every agent whose output reaches the saved report —
    analysts, researchers, debaters, research manager, trader, and
    portfolio manager — so a non-English run produces a fully localized
    report rather than a mix of languages.
    """
    from tradingagents.dataflows.config import get_config
    lang = get_config().get("output_language", "English")
    if lang.strip().lower() == "english":
        return ""
    return f" Write your entire response in {lang}."


def get_rating_language_instruction() -> str:
    """Language instruction for agents that emit a 5-tier rating token.

    Same prose-language override as ``get_language_instruction``, plus a
    HARD requirement that the literal "Rating: X" token stay in English with
    X ∈ {Buy, Overweight, Hold, Underweight, Sell}. The downstream
    ``parse_rating`` heuristic (tradingagents/agents/utils/rating.py) greps
    for those exact tokens — translating the token would break final_rating
    extraction and silently degrade every non-English run to "Hold".
    Display-side translation already exists via the web `rating.*` i18n
    catalog (RatingBadge), so the user still sees a localized label.
    """
    from tradingagents.dataflows.config import get_config
    lang = get_config().get("output_language", "English")
    if lang.strip().lower() == "english":
        return ""
    return (
        f" Write your entire response in {lang}. CRITICAL: keep the literal token "
        "'Rating: X' in English, where X is exactly one of Buy, Overweight, Hold, "
        "Underweight, Sell. All surrounding prose stays in "
        f"{lang}; only the rating word itself stays English."
    )


def build_instrument_context(ticker: str, asset_type: str = "stock") -> str:
    """Describe the exact instrument so agents preserve exchange-qualified tickers.

    For tickers with a canonical-name mapping (currently IDX blue chips via
    indonesia_news.lookup_company_name), the full company name is injected
    so the LLM doesn't confuse e.g. BMRI (Bank Mandiri) with BBRI (Bank BRI).
    Non-IDX tickers stay ticker-only — the LLM's prior is reliable for
    unambiguous global symbols (NVDA, AAPL, etc.).
    """
    # Lazy import to keep build_instrument_context callable in test
    # environments where the full dataflows graph isn't loaded.
    from tradingagents.dataflows.indonesia_news import lookup_company_name

    instrument_label = "asset" if asset_type == "crypto" else "instrument"
    extra_hint = (
        " Treat it as a crypto asset rather than a company, and do not assume company fundamentals are available."
        if asset_type == "crypto"
        else ""
    )
    company_name = lookup_company_name(ticker) if asset_type != "crypto" else None
    company_hint = (
        f" This ticker refers to the company **{company_name}** — do not confuse it with similarly-named tickers."
        if company_name
        else ""
    )
    return (
        f"The {instrument_label} to analyze is `{ticker}`.{company_hint} "
        "Use this exact ticker in every tool call, report, and recommendation, "
        "preserving any exchange suffix (e.g. `.TO`, `.L`, `.HK`, `.T`, `-USD`)."
        + extra_hint
    )

def create_msg_delete():
    def delete_messages(state):
        """Clear messages and add placeholder for Anthropic compatibility"""
        messages = state["messages"]

        # Remove all messages
        removal_operations = [RemoveMessage(id=m.id) for m in messages]

        # Add a minimal placeholder message
        placeholder = HumanMessage(content="Continue")

        return {"messages": removal_operations + [placeholder]}

    return delete_messages


        
