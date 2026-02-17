import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, X } from 'lucide-react';

interface HeadlineSectionProps {
  headline: string;
  onChange: (headline: string) => void;
}

const HeadlineSection = ({ headline, onChange }: HeadlineSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(headline);

  const startEdit = () => {
    setDraft(headline);
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
        <CardTitle className="text-white">Professional Headline</CardTitle>
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
      <CardContent>
        {editing ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Full Stack Developer | React & Spring Boot"
            maxLength={120}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
          />
        ) : (
          <p className="text-white/80">{headline || <span className="text-white/40">No headline set</span>}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HeadlineSection;
