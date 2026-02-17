import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X, Github, Linkedin, Globe } from 'lucide-react';
import { ProfileLinks } from '@/types/user';

interface LinksSectionProps {
  links: ProfileLinks;
  onChange: (links: ProfileLinks) => void;
}

const LinksSection = ({ links, onChange }: LinksSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileLinks>(links);

  const startEdit = () => {
    setDraft({ ...links });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    // Strip empty strings
    const cleaned: ProfileLinks = {};
    if (draft.github?.trim()) cleaned.github = draft.github.trim();
    if (draft.linkedin?.trim()) cleaned.linkedin = draft.linkedin.trim();
    if (draft.portfolio?.trim()) cleaned.portfolio = draft.portfolio.trim();
    onChange(cleaned);
    setEditing(false);
  };

  const hasAnyLink = links.github || links.linkedin || links.portfolio;

  const linkItems = [
    { key: 'github' as const, label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
    { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    { key: 'portfolio' as const, label: 'Portfolio', icon: Globe, placeholder: 'https://yoursite.com' },
  ];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Links</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-white/60 hover:text-white hover:bg-white/10">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-white/60 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={confirmEdit} className="bg-electric-blue hover:bg-blue-700 text-white">
              Done
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          linkItems.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-1">
              <Label className="text-white/70 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" /> {label}
              </Label>
              <Input
                value={draft[key] || ''}
                onChange={(e) => setDraft(d => ({ ...d, [key]: e.target.value }))}
                placeholder={placeholder}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
          ))
        ) : !hasAnyLink ? (
          <p className="text-white/40 text-sm">No links added yet</p>
        ) : (
          <div className="space-y-2">
            {linkItems.map(({ key, label, icon: Icon }) => {
              const val = links[key];
              if (!val) return null;
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-white/50" />
                  <a href={val} target="_blank" rel="noopener noreferrer" className="text-electric-blue hover:underline text-sm truncate">
                    {val}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinksSection;
