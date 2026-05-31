from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from tradingagents.agents.utils.agent_utils import (
    build_instrument_context,
    get_global_news,
    get_language_instruction,
    get_news,
)
from tradingagents.dataflows.config import get_config


def create_news_analyst(llm):
    def news_analyst_node(state):
        current_date = state["trade_date"]
        asset_type = state.get("asset_type", "stock")
        asset_label = "company" if asset_type == "stock" else "asset"
        instrument_context = build_instrument_context(
            state["company_of_interest"], asset_type
        )

        tools = [
            get_news,
            get_global_news,
        ]

        system_message = (
            f"You are a news researcher tasked with analyzing recent news and trends over the past week"
            f" for THIS specific {asset_label}. Use the available tools: get_news(query, start_date, end_date)"
            f" for {asset_label}-specific or targeted news, and get_global_news(curr_date, look_back_days, limit)"
            f" for broader macroeconomic news."
            f"\n\nRELEVANCE FILTER (apply to EVERY item you include): include a story only if it"
            f" materially affects THIS {asset_label} or its sector / region / business model — e.g. for"
            f" a bank that means central-bank rates, banking-sector trends, regional financial regulation,"
            f" credit cycle, currency moves; for a manufacturer that means commodity inputs, end-market"
            f" demand, trade policy, factory-region disruptions. If a global-news item is about an"
            f" UNRELATED industry (e.g. shoe-industry pricing, fashion retail, coffee or tomato prices"
            f" for a bank analysis), EXCLUDE it from the report — do not pad. If little or no relevant"
            f" global news appears in the queried window, say so explicitly in one sentence rather than"
            f" including irrelevant items."
            f"\n\nProvide specific, actionable insights with supporting evidence to help traders make"
            f" informed decisions."
            + """ Make sure to append a Markdown table at the end of the report to organize key points in the report, organized and easy to read."""
            + get_language_instruction()
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful AI assistant, collaborating with other assistants."
                    " Use the provided tools to progress towards answering the question."
                    " If you are unable to fully answer, that's OK; another assistant with different tools"
                    " will help where you left off. Execute what you can to make progress."
                    " If you or any other assistant has the FINAL TRANSACTION PROPOSAL: **BUY/HOLD/SELL** or deliverable,"
                    " prefix your response with FINAL TRANSACTION PROPOSAL: **BUY/HOLD/SELL** so the team knows to stop."
                    " You have access to the following tools: {tool_names}.\n{system_message}"
                    "For your reference, the current date is {current_date}. {instrument_context}",
                ),
                MessagesPlaceholder(variable_name="messages"),
            ]
        )

        prompt = prompt.partial(system_message=system_message)
        prompt = prompt.partial(tool_names=", ".join([tool.name for tool in tools]))
        prompt = prompt.partial(current_date=current_date)
        prompt = prompt.partial(instrument_context=instrument_context)

        chain = prompt | llm.bind_tools(tools)
        result = chain.invoke(state["messages"])

        report = ""

        if len(result.tool_calls) == 0:
            report = result.content

        return {
            "messages": [result],
            "news_report": report,
        }

    return news_analyst_node
