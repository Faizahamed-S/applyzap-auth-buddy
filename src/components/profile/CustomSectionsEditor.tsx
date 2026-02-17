import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X, Plus, Trash2 } from 'lucide-react';
import { CustomSection, CustomSubsection } from '@/types/user';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface CustomSectionsEditorProps {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

const genId = () => crypto.randomUUID();

const CustomSectionsEditor = ({ sections, onChange }: CustomSectionsEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomSection | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const startEdit = (section: CustomSection) => {
    setDraft(JSON.parse(JSON.stringify(section)));
    setEditingId(section.id);
  };

  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const confirmEdit = () => {
    if (!draft) return;
    onChange(sections.map(s => s.id === draft.id ? draft : s));
    setEditingId(null);
    setDraft(null);
  };

  const addSection = () => {
    const newSection: CustomSection = { id: genId(), sectionTitle: 'New Section', fields: [], subsections: [] };
    onChange([...sections, newSection]);
    startEdit(newSection);
  };

  const removeSection = (id: string) => {
    onChange(sections.filter(s => s.id !== id));
    if (editingId === id) cancelEdit();
  };

  const updateSectionTitle = (title: string) => {
    if (!draft) return;
    setDraft({ ...draft, sectionTitle: title });
  };

  const addSubsection = () => {
    if (!draft) return;
    setDraft({ ...draft, subsections: [...draft.subsections, { id: genId(), subsectionTitle: '', fields: [] }] });
  };

  const addSectionField = () => {
    if (!draft) return;
    setDraft({ ...draft, fields: [...(draft.fields || []), { label: '', value: '' }] });
  };

  const updateSectionField = (fieldIdx: number, key: 'label' | 'value', val: string) => {
    if (!draft) return;
    setDraft({ ...draft, fields: (draft.fields || []).map((f, i) => i === fieldIdx ? { ...f, [key]: val } : f) });
  };

  const removeSectionField = (fieldIdx: number) => {
    if (!draft) return;
    setDraft({ ...draft, fields: (draft.fields || []).filter((_, i) => i !== fieldIdx) });
  };

  const removeSubsection = (subId: string) => {
    if (!draft) return;
    setDraft({ ...draft, subsections: draft.subsections.filter(s => s.id !== subId) });
  };

  const updateSubsectionTitle = (subId: string, title: string) => {
    if (!draft) return;
    setDraft({ ...draft, subsections: draft.subsections.map(s => s.id === subId ? { ...s, subsectionTitle: title } : s) });
  };

  const addField = (subId: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      subsections: draft.subsections.map(s =>
        s.id === subId ? { ...s, fields: [...s.fields, { label: '', value: '' }] } : s
      ),
    });
  };

  const updateField = (subId: string, fieldIdx: number, key: 'label' | 'value', val: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      subsections: draft.subsections.map(s =>
        s.id === subId
          ? { ...s, fields: s.fields.map((f, i) => i === fieldIdx ? { ...f, [key]: val } : f) }
          : s
      ),
    });
  };

  const removeField = (subId: string, fieldIdx: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      subsections: draft.subsections.map(s =>
        s.id === subId ? { ...s, fields: s.fields.filter((_, i) => i !== fieldIdx) } : s
      ),
    });
  };

  // Drag handlers
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      onChange(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleSectionFieldDragEnd = (event: DragEndEvent) => {
    if (!draft?.fields) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = draft.fields.findIndex((_, i) => `sf-${i}` === active.id);
      const newIndex = draft.fields.findIndex((_, i) => `sf-${i}` === over.id);
      setDraft({ ...draft, fields: arrayMove(draft.fields, oldIndex, newIndex) });
    }
  };

  const handleSubsectionDragEnd = (event: DragEndEvent) => {
    if (!draft) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = draft.subsections.findIndex(s => s.id === active.id);
      const newIndex = draft.subsections.findIndex(s => s.id === over.id);
      setDraft({ ...draft, subsections: arrayMove(draft.subsections, oldIndex, newIndex) });
    }
  };

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map(section => {
            const isEditing = editingId === section.id;
            const display = isEditing && draft ? draft : section;

            return (
              <SortableItem key={section.id} id={section.id}>
                <Card className="bg-white/5 border-white/10 w-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    {isEditing ? (
                      <Input
                        value={draft?.sectionTitle || ''}
                        onChange={(e) => updateSectionTitle(e.target.value)}
                        className="bg-white/10 border-white/20 text-white font-semibold text-lg max-w-[280px]"
                        placeholder="Section title"
                      />
                    ) : (
                      <CardTitle className="text-white">{section.sectionTitle}</CardTitle>
                    )}
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => startEdit(section)} className="text-white/60 hover:text-white hover:bg-white/10">
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-white/60 hover:text-white hover:bg-white/10">
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" onClick={confirmEdit} className="bg-electric-blue hover:bg-blue-700 text-white">
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Section-level fields */}
                    {isEditing && (draft?.fields || []).length > 0 && (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionFieldDragEnd}>
                        <SortableContext items={(draft?.fields || []).map((_, i) => `sf-${i}`)} strategy={verticalListSortingStrategy}>
                          {(draft?.fields || []).map((field, fi) => (
                            <SortableItem key={`sf-${fi}`} id={`sf-${fi}`}>
                              <div className="flex gap-2 items-start">
                                <Input value={field.label} onChange={(e) => updateSectionField(fi, 'label', e.target.value)} placeholder="Label" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 w-1/3" />
                                <Input value={field.value} onChange={(e) => updateSectionField(fi, 'value', e.target.value)} placeholder="Value" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 flex-1" />
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0" onClick={() => removeSectionField(fi)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </SortableItem>
                          ))}
                        </SortableContext>
                      </DndContext>
                    )}

                    {!isEditing && (display.fields || []).length > 0 && (
                      <div className="space-y-1">
                        {(display.fields || []).map((f, fi) => (
                          <div key={fi}>
                            <span className="text-white/50 text-xs">{f.label}</span>
                            <p className="text-white text-sm">{f.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isEditing && (display.fields || []).length === 0 && display.subsections.length === 0 && (
                      <p className="text-white/40 text-sm">No content yet</p>
                    )}

                    {/* Subsections */}
                    {isEditing && draft ? (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubsectionDragEnd}>
                        <SortableContext items={draft.subsections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                          {draft.subsections.map((sub) => (
                            <SortableItem key={sub.id} id={sub.id}>
                              <div className="rounded-lg border border-white/10 p-3 space-y-3 w-full">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={sub.subsectionTitle}
                                    onChange={(e) => updateSubsectionTitle(sub.id, e.target.value)}
                                    placeholder="Subsection title"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 font-medium"
                                  />
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0" onClick={() => removeSubsection(sub.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                {sub.fields.map((field, fi) => (
                                  <div key={fi} className="flex gap-2 items-start pl-2">
                                    <Input value={field.label} onChange={(e) => updateField(sub.id, fi, 'label', e.target.value)} placeholder="Label" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 w-1/3" />
                                    <Input value={field.value} onChange={(e) => updateField(sub.id, fi, 'value', e.target.value)} placeholder="Value" className="bg-white/10 border-white/20 text-white placeholder:text-white/30 flex-1" />
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0" onClick={() => removeField(sub.id, fi)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addField(sub.id)} className="bg-transparent text-white border-white/30 hover:text-white/60 hover:border-white/15 transition-all ml-2">
                                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Field
                                </Button>
                              </div>
                            </SortableItem>
                          ))}
                        </SortableContext>
                      </DndContext>
                    ) : (
                      display.subsections.map((sub) => (
                        <div key={sub.id} className="rounded-lg border border-white/10 p-3 space-y-3">
                          {sub.subsectionTitle && <h4 className="text-white font-medium">{sub.subsectionTitle}</h4>}
                          {sub.fields.length === 0 ? (
                            <p className="text-white/40 text-sm">No fields</p>
                          ) : (
                            <div className="space-y-1">
                              {sub.fields.map((f, fi) => (
                                <div key={fi}>
                                  <span className="text-white/50 text-xs">{f.label}</span>
                                  <p className="text-white text-sm">{f.value || '—'}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}

                    {isEditing && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={addSectionField} className="bg-transparent text-white border-white/30 hover:text-white/60 hover:border-white/15 transition-all">
                          <Plus className="mr-1 h-4 w-4" /> Add Field
                        </Button>
                        <Button variant="outline" size="sm" onClick={addSubsection} className="bg-transparent text-white border-white/30 hover:text-white/60 hover:border-white/15 transition-all">
                          <Plus className="mr-1 h-4 w-4" /> Add Subsection
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </SortableItem>
            );
          })}
        </SortableContext>
      </DndContext>

      <Button variant="outline" onClick={addSection} className="w-full bg-transparent text-white border-white/20 border-dashed hover:text-white/60 hover:border-white/15 transition-all py-6">
        <Plus className="mr-2 h-5 w-5" /> Add Custom Section
      </Button>
    </div>
  );
};

export default CustomSectionsEditor;
