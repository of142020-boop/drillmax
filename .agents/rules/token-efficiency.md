# Token Efficiency

Save tokens without reducing quality:

- Keep responses short and direct; no repeated summaries of completed work.
- Read only the files/line ranges needed; avoid viewing whole large files.
- Prefer targeted `grep_search` over browsing directories.
- Batch independent tool calls in parallel and group edits per file in one call.
- Don't re-read files already in context or just edited.
- Don't create artifacts for simple answers.
- Ask a brief clarifying question instead of guessing when intent is unclear.
