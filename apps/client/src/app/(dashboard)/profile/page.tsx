import type { Metadata } from 'next';
import { ProfileCard } from '@/features/settings/components/profile-card';
import { BusinessProfileTabs } from '@/features/settings/components/business-profile-tabs';

export const metadata: Metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Your profile</h2>
        <p className="text-muted-foreground">Manage your account, business, and billing details.</p>
      </div>
      <ProfileCard />
      <BusinessProfileTabs />
    </div>
  );
}
