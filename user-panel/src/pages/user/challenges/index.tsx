import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/challenges';
import MobilePage from '@/views/user/Mobile/challenges';

export default createResponsiveUserPage(DesktopPage, MobilePage);
