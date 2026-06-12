import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/wallet';
import MobilePage from '@/views/user/Mobile/wallet';

export default createResponsiveUserPage(DesktopPage, MobilePage);
