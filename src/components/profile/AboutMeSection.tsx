import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X } from 'lucide-react';

interface AboutMeSectionProps {
  aboutMe: string;
  onChange: (aboutMe: string) => void;
}

const AboutMeSection = ({ aboutMe, onChange }: AboutMeSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(aboutMe);

  const startEdit = () => {
    setDraft(aboutMe);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const confirmEdit = () => {
    onChange(draft);
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Professional Summary</CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="text-muted-foreground hover:text-foreground">
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={confirmEdit}>
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tell us about yourself in 2–3 sentences..."
            maxLength={500}
            className="min-h-[100px] resize-none"
          />
        ) : (
          <p className="text-foreground/80 whitespace-pre-wrap">{aboutMe || <span className="text-muted-foreground">No description set</span>}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AboutMeSection;
