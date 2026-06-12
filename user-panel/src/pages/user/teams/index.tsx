import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/teams';
import MobilePage from '@/views/user/Mobile/teams';

export default createResponsiveUserPage(DesktopPage, MobilePage);
