import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/social/ChatThreadScreen';
import MobilePage from '@/views/user/Mobile/social/ChatThreadScreen';

export default createResponsiveUserPage(DesktopPage, MobilePage);
