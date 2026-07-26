## Referrals as Cards

Replace the current `ReferralTable` list view with a responsive grid of cards. Cards emphasize **name** and **company**, expose a quick **LinkedIn** link, and open the existing detail modal on tap for full info.

### New component: `ReferralCard`
Location: `src/components/referrals/ReferralCard.tsx`

Layout per card (top → bottom):
- **Company name** — most prominent. Rendered with our primary blue accent (`text-primary`, `font-semibold`, `text-base`) so it visually pops as the anchor of the card. Matches the existing brand blue (`hsl(221 83% 53%)`) already used elsewhere.
- **Contact name** — `text-foreground`, `font-medium`, `text-sm`. Sits directly under the company.
- **Role/title** (if present) — `text-xs text-muted-foreground`.
- **Footer row** — small LinkedIn icon button (opens `linkedinUrl` in a new tab, `stopPropagation` so it doesn't open the detail modal), plus a subtle "N linked application(s)" count on the right when available.
- **Overflow menu** (three-dot) — Edit / Delete, mirroring current `ReferralTable` row actions. `stopPropagation` on trigger.

Card container:
- `rounded-lg border border-border bg-card p-4 cursor-pointer transition-all`
- Hover: `hover:border-primary/40 hover:shadow-sm`
- Whole card is clickable → `onSelect(referral)` opens `ReferralDetailModal` (unchanged behavior).

### Grid wrapper
In `ReferralBaseHub.tsx`, swap `<ReferralTable … />` for:
```
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {filtered.map(r => <ReferralCard key={r.id} referral={r} … />)}
</div>
```
`ReferralTable.tsx` stays in the repo for now (unused) so we can revert quickly; no other imports change.

### Ranking-ready
Leaves a clean surface for the ranking sort you'll add next: sorting will happen in `ReferralBaseHub` before the `.map`, and the card already has room in the footer for a small rank chip when needed. No ranking UI in this pass.

### Answer on the color
Yes — our primary is a bright blue (`hsl(221 83% 53%)` with a cyan-blue gradient partner). Applying `text-primary` to the company gives that "blueish-white/highlight" pop against both light and dark themes without hardcoding a hex. If you'd rather have the company appear white-bold in dark mode and blue only on hover, say the word and I'll switch it to `text-foreground` + `group-hover:text-primary`.

### Files touched
- Add: `src/components/referrals/ReferralCard.tsx`
- Edit: `src/components/referrals/ReferralBaseHub.tsx` (replace table with card grid)

No API, type, or data changes.
