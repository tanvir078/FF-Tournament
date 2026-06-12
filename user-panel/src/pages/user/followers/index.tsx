import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopFollowListScreen from '@/views/user/Desktop/social/FollowListScreen';
import MobileFollowListScreen from '@/views/user/Mobile/social/FollowListScreen';

function DesktopPage() {
  return <DesktopFollowListScreen mode="followers" />;
}

function MobilePage() {
  return <MobileFollowListScreen mode="followers" />;
}

export default createResponsiveUserPage(DesktopPage, MobilePage);
