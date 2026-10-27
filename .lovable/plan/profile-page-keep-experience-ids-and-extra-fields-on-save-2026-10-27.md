# Profile page: keep experience IDs and extra fields on save

Small, targeted changes only. No redesign, no new sections.

## What already works (no change)
- Experience editing already copies whole objects (`{ ...e }`) and updates with `{ ...exp, [field]: value }`, so hidden fields survive.
- The page loads `profileData.experiences` as returned and sends the same objects back.
- Save already sends only aboutMe, links, experiences, basicInfoExtra, customSections, sectionOrder, and refreshes the profile afterwards (the page re-syncs from the refreshed profile, so new ids come back).
- New experiences are created without an id.

## Changes
1. **Experience type** (`src/types/user.ts`): add `id?`, `current?`, `location?`, `rawNotes?`, `highlights?` (`{ id?, text, skills?, metric?, include? }[]`) and `[key: string]: unknown`.
2. **List key** (`ExperienceSection.tsx`): use `exp.id ?? index` instead of the index.
3. **No accidental nulls** (`ProfilePage.tsx`): build the save payload with `[]` / `""` fallbacks for every owned key so `null` is never sent. No `schemaVersion`.
4. **Show validation errors**:
   - `userApi.updateProfile`: on a failed response, read the JSON body and throw an error carrying `status`, `message`, `field`.
   - Save `onError`: if status is 400 and a message exists, toast "Couldn't save: {message}"; otherwise keep "Failed to save profile".

## Checks
- Typecheck/build pass.
- Ask you to verify signed in (I can't sign in here): edit a title and save, then reload, and the id stays the same; a newly added experience gets an `exp_` id; highlights survive; "Jan 2023" still saves.
