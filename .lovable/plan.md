## Goal
Update the company name display in the referral card so it appears as a blue pill/badge with white text, matching the primary button pattern used across the app (e.g., the "Wishlist" button in the attached screenshot).

## Changes

### 1. Update `src/components/referrals/ReferralCard.tsx`
- Wrap the company name in a pill-shaped container using the primary background color (`bg-primary`) and white text (`text-primary-foreground`).
- Keep the name right-aligned in the card top row, next to the contact name.
- Add `truncate` and a reasonable max-width (e.g., `max-w-[50%]`) so long company names don't overflow or crowd the contact name.
- Keep the same font size and weight as currently used, or slightly reduce to `text-xs`/`font-medium` if the pill feels too heavy.
- Maintain existing spacing, hover, and dropdown behavior for the whole card.

### 2. Verify responsive behavior
- Ensure the pill truncates correctly on small screens (1-column grid).
- Ensure the contact name also truncates when space is tight.

## Out of scope
- No changes to the contact name, email, LinkedIn link, or card actions.
- No changes to the referral grid layout, detail modal, or API logic.