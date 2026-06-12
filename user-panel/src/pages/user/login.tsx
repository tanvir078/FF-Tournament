import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/login';
import MobilePage from '@/views/user/Mobile/login';

export default createResponsiveUserPage(DesktopPage, MobilePage);
