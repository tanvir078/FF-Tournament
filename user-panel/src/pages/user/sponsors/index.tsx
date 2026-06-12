import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/sponsors';
import MobilePage from '@/views/user/Mobile/sponsors';

export default createResponsiveUserPage(DesktopPage, MobilePage);
