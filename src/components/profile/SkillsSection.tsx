import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Plus, X } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

const SkillsSection = ({ skills, onChange }: SkillsSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(skills);
  const [newSkill, setNewSkill] = useState('');

  const startEdit = () => {
    setDraft([...skills]);
    setEditing(true);
  };

  const cancelEdit = () => {
    setNewSkill('');
    setEditing(false);
  };

  const confirmEdit = () => {
    onChange(draft);
    setNewSkill('');
    setEditing(false);
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !draft.includes(trimmed)) {
      setDraft(prev => [...prev, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setDraft(prev => prev.filter(s => s !== skill));
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Skills</CardTitle>
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
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(editing ? draft : skills).map((skill) => (
            <Badge key={skill} className="bg-electric-blue/20 text-white border-electric-blue/30 pr-1">
              {skill}
              {editing && (
                <button type="button" onClick={() => removeSkill(skill)} className="ml-1.5 p-0.5 rounded-full hover:bg-white/20">
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {(editing ? draft : skills).length === 0 && (
            <span className="text-white/40 text-sm">No skills added yet</span>
          )}
        </div>
        {editing && (
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Add a skill..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
            <Button type="button" variant="outline" onClick={addSkill} className="bg-transparent text-white border-white/30 hover:text-white/60 hover:border-white/15 transition-all">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsSection;
