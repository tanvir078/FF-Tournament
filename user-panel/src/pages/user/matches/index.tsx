import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/matches';
import MobilePage from '@/views/user/Mobile/matches';

export default createResponsiveUserPage(DesktopPage, MobilePage);
