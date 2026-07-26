Update the referral card layout so the referrer's name is the prominent top element, the email sits below it, and the company name is highlighted on the right side of the same row.

Changes
- Modify `src/components/referrals/ReferralCard.tsx`:
  - Top row: contact name (left, `text-base font-bold text-foreground`) and company name (right, highlighted using `text-primary font-semibold` / or a subtle badge style so it stands out for scanning).
  - Second row: email as `text-sm text-muted-foreground`.
  - Keep the existing three-dot menu, LinkedIn link, and linked-applications footer.
- No changes to `ReferralBaseHub.tsx`, data fetching, or modal interactions.

Verification
- Cards render in the responsive grid without truncation or overflow at common viewport widths.
- Name, company, and email remain readable; the company stays visually distinct.