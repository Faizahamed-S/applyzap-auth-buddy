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
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">About Me (in 2–3 sentences)</CardTitle>
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
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-h-[100px] resize-none"
          />
        ) : (
          <p className="text-white/80 whitespace-pre-wrap">{aboutMe || <span className="text-white/40">No description set</span>}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AboutMeSection;
