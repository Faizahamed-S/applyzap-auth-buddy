import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { userApi } from '@/lib/userApi';
import { ProfileData, ProfileExperience, ProfileLink, BasicInfoExtraField, CustomSection } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import BasicInfoSection from '@/components/profile/BasicInfoSection';
import AboutMeSection from '@/components/profile/AboutMeSection';
import LinksSection from '@/components/profile/LinksSection';
import ExperienceSection from '@/components/profile/ExperienceSection';
import CustomSectionsEditor from '@/components/profile/CustomSectionsEditor';
import SectionReorderModal, { SectionOrderItem } from '@/components/profile/SectionReorderModal';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

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
  const [reorderOpen, setReorderOpen] = useState(false);

  const DEFAULT_SECTION_ORDER: SectionOrderItem[] = [
    { id: 'basic-info', label: 'Basic Information' },
    { id: 'professional-summary', label: 'Professional Summary' },
    { id: 'links', label: 'Links' },
    { id: 'experience', label: 'Experience' },
    { id: 'custom-sections', label: 'Custom Sections' },
  ];

  const [sectionOrder, setSectionOrder] = useState<SectionOrderItem[]>(DEFAULT_SECTION_ORDER);

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
      if (pd?.sectionOrder && Array.isArray(pd.sectionOrder)) {
        setSectionOrder(pd.sectionOrder as SectionOrderItem[]);
      }
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
        sectionOrder,
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

  const buildFullSectionList = (): SectionOrderItem[] => {
    return sectionOrder;
  };

  const handleReorderSave = (newOrder: SectionOrderItem[]) => {
    setSectionOrder(newOrder);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal information and career profile.</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-10 w-10"
            onClick={() => setReorderOpen(true)}
            title="Reorder sections"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {sectionOrder.map(section => {
          switch (section.id) {
            case 'basic-info':
              return (
                <BasicInfoSection
                  key="basic-info"
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
              );
            case 'professional-summary':
              return <AboutMeSection key="professional-summary" aboutMe={aboutMe} onChange={setAboutMe} />;
            case 'links':
              return <LinksSection key="links" links={links} onChange={setLinks} />;
            case 'experience':
              return <ExperienceSection key="experience" experiences={experiences} onChange={setExperiences} />;
            case 'custom-sections':
              return <CustomSectionsEditor key="custom-sections" sections={customSections} onChange={setCustomSections} />;
            default:
              return null;
          }
        })}

        <SectionReorderModal
          open={reorderOpen}
          onOpenChange={setReorderOpen}
          sections={buildFullSectionList()}
          onSave={handleReorderSave}
        />

        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
