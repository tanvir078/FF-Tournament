import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop';
import MobilePage from '@/views/user/Mobile';

export default createResponsiveUserPage(DesktopPage, MobilePage);
