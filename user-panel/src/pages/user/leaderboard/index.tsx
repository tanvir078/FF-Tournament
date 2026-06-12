import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/leaderboard';
import MobilePage from '@/views/user/Mobile/leaderboard';

export default createResponsiveUserPage(DesktopPage, MobilePage);
