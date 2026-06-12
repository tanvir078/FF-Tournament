import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/profile';
import MobilePage from '@/views/user/Mobile/profile';

export default createResponsiveUserPage(DesktopPage, MobilePage);
