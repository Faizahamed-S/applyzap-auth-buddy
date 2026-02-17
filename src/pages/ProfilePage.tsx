import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { userApi } from '@/lib/userApi';
import { ProfileData, ProfileExperience, ProfileLink, BasicInfoExtraField, CustomSection } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import BasicInfoSection from '@/components/profile/BasicInfoSection';
import AboutMeSection from '@/components/profile/AboutMeSection';
import LinksSection from '@/components/profile/LinksSection';
import ExperienceSection from '@/components/profile/ExperienceSection';
import CustomSectionsEditor from '@/components/profile/CustomSectionsEditor';

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useUserProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [experiences, setExperiences] = useState<ProfileExperience[]>([]);
  const [basicInfoExtra, setBasicInfoExtra] = useState<BasicInfoExtraField[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

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
      const pd = user.profileData;
      setAboutMe(pd?.aboutMe || pd?.headline || '');
      // Handle links migration: old format was object, new is array
      if (Array.isArray(pd?.links)) {
        setLinks(pd.links as ProfileLink[]);
      } else if (pd?.links && typeof pd.links === 'object') {
        const oldLinks = pd.links as Record<string, string>;
        const migrated: ProfileLink[] = [];
        if (oldLinks.github) migrated.push({ label: 'GitHub', url: oldLinks.github });
        if (oldLinks.linkedin) migrated.push({ label: 'LinkedIn', url: oldLinks.linkedin });
        if (oldLinks.portfolio) migrated.push({ label: 'Portfolio', url: oldLinks.portfolio });
        setLinks(migrated);
      } else {
        setLinks([]);
      }
      setExperiences((pd?.experiences as ProfileExperience[]) || []);
      setBasicInfoExtra((pd?.basicInfoExtra as BasicInfoExtraField[]) || []);
      setCustomSections((pd?.customSections as CustomSection[]) || []);
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const profileData: ProfileData = {
        aboutMe,
        links,
        experiences,
        basicInfoExtra,
        customSections,
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
          <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10" onClick={() => navigate('/dashboard')}>
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

        <BasicInfoSection
          firstName={firstName}
          lastName={lastName}
          email={user?.email || ''}
          timezone={timezone}
          extraFields={basicInfoExtra}
          onChange={({ firstName: fn, lastName: ln, timezone: tz }) => {
            if (fn !== undefined) setFirstName(fn);
            if (ln !== undefined) setLastName(ln);
            if (tz !== undefined) setTimezone(tz);
          }}
          onExtraFieldsChange={setBasicInfoExtra}
        />

        <AboutMeSection aboutMe={aboutMe} onChange={setAboutMe} />
        <LinksSection links={links} onChange={setLinks} />
        <ExperienceSection experiences={experiences} onChange={setExperiences} />
        <CustomSectionsEditor sections={customSections} onChange={setCustomSections} />

        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="bg-electric-blue hover:bg-blue-700 text-white">
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
