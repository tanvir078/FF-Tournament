import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/game-profiles';
import MobilePage from '@/views/user/Mobile/game-profiles';

export default createResponsiveUserPage(DesktopPage, MobilePage);
