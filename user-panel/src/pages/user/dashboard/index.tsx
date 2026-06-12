import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/dashboard';
import MobilePage from '@/views/user/Mobile/dashboard';

export default createResponsiveUserPage(DesktopPage, MobilePage);
