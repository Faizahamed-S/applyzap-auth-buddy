import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { userApi } from '@/lib/userApi';
import { ProfileData } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Plus, X, Save, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUserProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [headline, setHeadline] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [experiences, setExperiences] = useState<Array<{ title: string; company: string; description: string }>>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/login');
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setTimezone(user.timezone || '');
      setHeadline(user.profileData?.headline || '');
      setSkills(user.profileData?.skills || []);
      setExperiences(
        (user.profileData?.experience as Array<{ title: string; company: string; description: string }>) || []
      );
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const profileData: ProfileData = {
        headline,
        skills,
        experience: experiences,
      };
      return userApi.updateProfile({ firstName, lastName, timezone, profileData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile saved successfully!');
    },
    onError: () => {
      toast.error('Failed to save profile');
    },
  });

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, { title: '', company: '', description: '' }]);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setExperiences(prev =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    );
  };

  const removeExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050A30] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A30]">
      <header className="sticky top-0 z-40 bg-[#050A30] border-b border-white/10">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <Logo variant="light" />
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-white/70 mt-1">Manage your personal information and career profile.</p>
        </div>

        {/* Basic Info */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70">First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-white/5 border-white/10 text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/New_York"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Headline */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Professional Headline</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Full Stack Developer | React & Spring Boot"
              maxLength={120}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-electric-blue/20 text-white border-electric-blue/30 pr-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1.5 p-0.5 rounded-full hover:bg-white/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {skills.length === 0 && (
                <span className="text-white/40 text-sm">No skills added yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Add a skill..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="bg-electric-blue/20 text-white border-electric-blue/30 hover:bg-electric-blue/40 hover:brightness-125 transition-all"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Experience</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={addExperience}
              className="bg-electric-blue/20 text-white border-electric-blue/30 hover:bg-electric-blue/40 hover:brightness-125 transition-all"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {experiences.length === 0 && (
              <div className="text-center py-6 text-white/40">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No experience entries yet</p>
              </div>
            )}
            {experiences.map((exp, index) => (
              <div key={index} className="rounded-lg border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs font-medium">Entry {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => removeExperience(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                      placeholder="Software Engineer"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/60 text-xs">Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Google"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-white/60 text-xs">Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                    placeholder="Describe your role..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-h-[80px] resize-none"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-electric-blue hover:bg-blue-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
