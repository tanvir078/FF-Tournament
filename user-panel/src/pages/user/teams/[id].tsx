import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/teams/[id]';
import MobilePage from '@/views/user/Mobile/teams/[id]';

export default createResponsiveUserPage(DesktopPage, MobilePage);
