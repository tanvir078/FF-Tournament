import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopFollowListScreen from '@/views/user/Desktop/social/FollowListScreen';
import MobileFollowListScreen from '@/views/user/Mobile/social/FollowListScreen';

function DesktopPage() {
  return <DesktopFollowListScreen mode="following" />;
}

function MobilePage() {
  return <MobileFollowListScreen mode="following" />;
}

export default createResponsiveUserPage(DesktopPage, MobilePage);
