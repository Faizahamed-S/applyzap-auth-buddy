# Architecture rules

- Group contribution analytics use the shared authenticated analytics API and a group/date-keyed React Query hook; keep leaderboard derivation separate from rendering so ranking and date selection are testable.
- Application-derived Analytics cards share the tracker's existing first-page query key and request without altering tracker calls; keep company aggregation and referral outcome calculations in tested pure helpers.