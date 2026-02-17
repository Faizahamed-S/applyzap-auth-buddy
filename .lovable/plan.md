
# Drag-and-Drop Reordering for Profile

## What changes

Add drag-and-drop reordering to the profile page so users can rearrange items when in edit mode. This uses the same drag-and-drop library (`@dnd-kit`) already used in the Kanban board.

## What can be reordered

1. **Links** -- reorder link items within the Links section
2. **Experiences** -- reorder experience entries within the Experience section
3. **Custom Sections** -- reorder entire custom sections on the profile page
4. **Fields and Subsections within a Custom Section** -- reorder fields and subsections while editing a custom section

## How it works for the user

- A **drag handle icon** (grip/dots icon) appears on the left side of each item when in edit mode
- Users grab the handle and drag items up or down to reorder
- The order is saved when the user clicks "Save" (or the section-level save button)
- In view mode, no drag handles are shown -- the profile looks clean as it does today

## Technical approach

1. **Create a reusable `SortableItem` wrapper component** that uses `@dnd-kit/sortable` to wrap any draggable item with a grip handle
2. **Update `LinksSection`** -- wrap link rows in a `SortableContext` during edit mode so links can be reordered by dragging
3. **Update `ExperienceSection`** -- same pattern for experience entries
4. **Update `CustomSectionsEditor`** -- add drag-and-drop at three levels:
   - Reorder top-level custom sections
   - Reorder section-level fields within a section (while editing)
   - Reorder subsections within a section (while editing)
5. Each list gets a `DndContext` + `SortableContext` from `@dnd-kit`, using the `verticalListSortingStrategy` and `arrayMove` utility to update order on drag end

## Files to create
- `src/components/profile/SortableItem.tsx` -- reusable drag handle + sortable wrapper

## Files to modify
- `src/components/profile/LinksSection.tsx` -- add DndContext for link reordering in edit mode
- `src/components/profile/ExperienceSection.tsx` -- add DndContext for experience reordering in edit mode
- `src/components/profile/CustomSectionsEditor.tsx` -- add DndContext for section, field, and subsection reordering
