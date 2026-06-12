import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/social/ChatListScreen';
import MobilePage from '@/views/user/Mobile/social/ChatListScreen';

export default createResponsiveUserPage(DesktopPage, MobilePage);
