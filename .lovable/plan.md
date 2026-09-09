# Field Template for the Application Form

Add a "Template" button in Board Settings that lets you define the extra fields on your application form, and make those fields appear as normal fields (not a separate "Custom Fields" block) when adding or editing an application.

## What you'll be able to do

1. Open Board Settings → click **Template**.
2. See the full form: the built-in fields (Company, Role, Job Link, Status, Date, Tailored, Referral, Job Description) listed read-only with their input type, since they are locked.
3. Below them, add/edit/remove your own fields. Each field has:
   - Field name (label)
   - Type, chosen from five options:
     - Yes / No (boolean)
     - Dropdown (you add the allowed options; only those can be picked)
     - Number (integer)
     - Short text (max 255 characters)
     - Long text (max ~9,000 characters, about 3 pages)
   - Required on/off
   - Reorder up/down
4. Save → sends the template to the backend. Changes appear immediately in the Add and Edit application forms.
5. In **Add Application** and **Edit Application**, your template fields render inline with the normal fields, with the right control for each type (switch, dropdown, number box, text box, textarea) and validation (required, number-only, length caps, dropdown restricted to its options).
6. The ad-hoc "Custom Fields" adder stays at the bottom as a fallback for one-off extras.
7. The Application Detail view shows template fields with their proper labels and Yes/No wording instead of raw keys.

## Rules and safeguards

- Field names convert to a stable key (lowercase, underscores). Duplicate keys are blocked; renaming the label of an existing field keeps its key so saved data isn't orphaned.
- Dropdown fields require at least one option before saving.
- Built-in / locked fields can't be renamed, retyped, or deleted.
- Deleting a custom field only removes it from the form; values already saved on applications are left untouched but hidden.

## Technical notes

- New `src/lib/fieldTemplateApi.ts`: `getTemplate()` → `GET {API_BASE}/board/field-template`, `updateTemplate()` → `POST {API_BASE}/board/field-template`, using `apiFetch` + Supabase bearer token like `jobApi`.
- New `src/types/fieldTemplate.ts`: `FieldTemplateEntry { key, label, type, order, required, locked, options }` and `FieldTemplate { builtIn: [], custom: [] }`. Zod-validate the response; tolerate missing/unknown keys and unknown types (unknown type falls back to short text).
- Type strings sent to the backend match the existing vocabulary: `boolean`, `select`, `number`, `text`, `textarea` (existing `url`/`date` are recognised for built-ins, read-only).
- New `src/hooks/useFieldTemplate.ts`: React Query `['fieldTemplate']` query + mutation invalidating on success.
- New `src/components/kanban/FieldTemplateModal.tsx`: the editor described above; opened from a new "Template" button in `BoardSettingsModal.tsx`.
- New `src/components/kanban/TemplateFieldsFields.tsx`: renders `custom` template entries as form controls; used by `AddJobModal.tsx` and `EditJobModal.tsx`.
- Values read from / written to `applicationMetadata` (per-key), so no application API change. Add/Edit build metadata by merging template values with the leftover ad-hoc `CustomFieldsEditor` entries.
- Long text capped client-side at 9,000 chars; short text at 255; numbers validated as integers.
- `ApplicationDetailModal.tsx` uses the template to label metadata entries when a matching key exists.
