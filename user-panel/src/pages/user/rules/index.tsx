import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/rules';
import MobilePage from '@/views/user/Mobile/rules';

export default createResponsiveUserPage(DesktopPage, MobilePage);
