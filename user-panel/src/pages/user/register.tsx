import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/register';
import MobilePage from '@/views/user/Mobile/register';

export default createResponsiveUserPage(DesktopPage, MobilePage);
