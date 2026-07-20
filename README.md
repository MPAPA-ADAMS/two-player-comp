## Competition persistence

Competition data is stored in normalized relational tables.

The application reads and writes:

- tournaments
- tournament groups
- group entries
- matches
- mentor drafts
- mentor draft turns
- mentor draft picks

The legacy `TournamentState` JSON compatibility table has been removed.

Historical Prisma migration files may still reference `TournamentState`. Those files are retained as part of the database migration history and should not be modified.