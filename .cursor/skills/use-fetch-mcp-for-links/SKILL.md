---
name: use-fetch-mcp-for-links
description: Use Fetch MCP to access web links and online pages. Apply when tasks require internet content retrieval, URL reading, webpage analysis, or documentation lookup from external sites.
---

# Use Fetch MCP For Links

## Purpose

Ensure the agent uses Fetch MCP as the default path for online link access.

## When To Apply

Apply this skill when any of the following is true:

- The task needs internet content retrieval.
- A URL is provided or implied.
- The user asks to read, summarize, compare, or extract content from webpages.
- The user asks for online documentation or references.

## Default Workflow

1. If a task needs online content, use Fetch MCP first.
2. If multiple URLs are needed, fetch each one and summarize key points.
3. If a page fails to load, report the failure reason and suggest fallback links or a narrower request.
4. Keep extracted content concise and focused on the user goal.

## Tool Preference Rules

- Prefer Fetch MCP over ad-hoc browser-like scraping steps.
- Avoid guessing page content without fetching.
- Keep citations as direct URLs when sharing sourced conclusions.

## Output Style

- Return a short answer first.
- Include source links used.
- Highlight uncertainty when page access fails or content is incomplete.
