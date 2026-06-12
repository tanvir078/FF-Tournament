import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/teams/manage';
import MobilePage from '@/views/user/Mobile/teams/manage';

export default createResponsiveUserPage(DesktopPage, MobilePage);
