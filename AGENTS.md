# Architecture rules

- Group contribution analytics use the shared authenticated analytics API and a group/date-keyed React Query hook; keep leaderboard derivation separate from rendering so ranking and date selection are testable.