import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/players/PublicPlayerProfileScreen';
import MobilePage from '@/views/user/Mobile/players/PublicPlayerProfileScreen';

export default createResponsiveUserPage(DesktopPage, MobilePage);
