import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/support';
import MobilePage from '@/views/user/Mobile/support';

export default createResponsiveUserPage(DesktopPage, MobilePage);
