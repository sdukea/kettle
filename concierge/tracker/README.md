# Tracker templates

Import each CSV as a tab in one **private** Google Sheet. Don't commit filled-in
copies: this repo is public.

| Tab | One row per | Notes |
|---|---|---|
| `students` | student | `status`: booked · fixed · active · lapsed · ready · done · dropped |
| `checks_log` | check taken | `session`: fix · daily · weekly · mock. Every score goes here |
| `positions` | student per update | Topic cells hold Solid · Solid* · Shaky · Gap · Unknown (see [rubric](../rubric.md#topic-status)) |
| `daily` | task sent | `done`: yes · partial · no · no reply |
| `topics` | topic | Reference list with tiers |

Tip: add conditional formatting to `positions` (Solid green, Shaky yellow,
Gap red, Unknown grey). That colour grid is your view of everyone at once.
