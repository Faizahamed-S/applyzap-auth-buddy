import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X, Plus, Trash2, ExternalLink } from 'lucide-react';
import { ProfileLink } from '@/types/user';

interface LinksSectionProps {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
}

const LinksSection = ({ links, onChange }: LinksSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileLink[]>(links);

  const startEdit = () => {
    setDraft(links.map(l => ({ ...l })));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    onChange(draft.filter(l => l.label.trim() && l.url.trim()));
    setEditing(false);
  };

  const addLink = () => {
    setDraft(prev => [...prev, { label: '', url: '' }]);
  };

  const updateLink = (index: number, key: 'label' | 'url', value: string) => {
    setDraft(prev => prev.map((l, i) => i === index ? { ...l, [key]: value } : l));
  };

  const removeLink = (index: number) => {
    setDraft(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Links</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addLink}>
              <Plus className="mr-1 h-4 w-4" /> Add Link
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={confirmEdit}>
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {editing ? (
          draft.length === 0 ? (
            <p className="text-muted-foreground text-sm">No links yet. Click "Add Link" to add one.</p>
          ) : (
            draft.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <Input value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Label (e.g. GitHub)" className="w-1/3" />
                <Input value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://..." className="flex-1" />
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0" onClick={() => removeLink(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )
        ) : links.length === 0 ? (
          <p className="text-muted-foreground text-sm">No links added yet</p>
        ) : (
          <div className="space-y-2">
            {links.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground text-sm">{link.label}:</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate">
                  {link.url}
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinksSection;
