import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/notifications';
import MobilePage from '@/views/user/Mobile/notifications';

export default createResponsiveUserPage(DesktopPage, MobilePage);
