import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X, Plus, Trash2 } from 'lucide-react';
import { CustomSection, CustomSubsection } from '@/types/user';

interface CustomSectionsEditorProps {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

const genId = () => crypto.randomUUID();

const CustomSectionsEditor = ({ sections, onChange }: CustomSectionsEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomSection | null>(null);

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

  return (
    <div className="space-y-4">
      {sections.map(section => {
        const isEditing = editingId === section.id;
        const display = isEditing && draft ? draft : section;

        return (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              {isEditing ? (
                <Input
                  value={draft?.sectionTitle || ''}
                  onChange={(e) => updateSectionTitle(e.target.value)}
                  className="font-semibold text-lg max-w-[280px]"
                  placeholder="Section title"
                />
              ) : (
                <CardTitle>{section.sectionTitle}</CardTitle>
              )}
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(section)} className="text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={confirmEdit}>
                      Save
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Section-level fields */}
              {isEditing && (draft?.fields || []).map((field, fi) => (
                <div key={`sf-${fi}`} className="flex gap-2 items-start">
                  <Input value={field.label} onChange={(e) => updateSectionField(fi, 'label', e.target.value)} placeholder="Label" className="w-1/3" />
                  <Input value={field.value} onChange={(e) => updateSectionField(fi, 'value', e.target.value)} placeholder="Value" className="flex-1" />
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0" onClick={() => removeSectionField(fi)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              {!isEditing && (display.fields || []).length > 0 && (
                <div className="space-y-1">
                  {(display.fields || []).map((f, fi) => (
                    <div key={fi}>
                      <span className="text-muted-foreground text-xs">{f.label}</span>
                      <p className="text-foreground text-sm">{f.value || '—'}</p>
                    </div>
                  ))}
                </div>
              )}

              {!isEditing && (display.fields || []).length === 0 && display.subsections.length === 0 && (
                <p className="text-muted-foreground text-sm">No content yet</p>
              )}

              {display.subsections.map((sub) => (
                <div key={sub.id} className="rounded-lg border border-border p-3 space-y-3">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Input
                          value={sub.subsectionTitle}
                          onChange={(e) => updateSubsectionTitle(sub.id, e.target.value)}
                          placeholder="Subsection title"
                          className="font-medium"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0" onClick={() => removeSubsection(sub.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {sub.fields.map((field, fi) => (
                        <div key={fi} className="flex gap-2 items-start pl-2">
                          <Input value={field.label} onChange={(e) => updateField(sub.id, fi, 'label', e.target.value)} placeholder="Label" className="w-1/3" />
                          <Input value={field.value} onChange={(e) => updateField(sub.id, fi, 'value', e.target.value)} placeholder="Value" className="flex-1" />
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0" onClick={() => removeField(sub.id, fi)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => addField(sub.id)} className="ml-2">
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Field
                      </Button>
                    </>
                  ) : (
                    <>
                      {sub.subsectionTitle && <h4 className="text-foreground font-medium">{sub.subsectionTitle}</h4>}
                      {sub.fields.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No fields</p>
                      ) : (
                        <div className="space-y-1">
                          {sub.fields.map((f, fi) => (
                            <div key={fi}>
                              <span className="text-muted-foreground text-xs">{f.label}</span>
                              <p className="text-foreground text-sm">{f.value || '—'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addSectionField}>
                    <Plus className="mr-1 h-4 w-4" /> Add Field
                  </Button>
                  <Button variant="outline" size="sm" onClick={addSubsection}>
                    <Plus className="mr-1 h-4 w-4" /> Add Subsection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outline" onClick={addSection} className="w-full border-dashed py-6">
        <Plus className="mr-2 h-5 w-5" /> Add Custom Section
      </Button>
    </div>
  );
};

export default CustomSectionsEditor;
