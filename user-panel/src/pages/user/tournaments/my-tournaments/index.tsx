import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/tournaments/MyTournamentsScreen';
import MobilePage from '@/views/user/Mobile/tournaments/MyTournamentsScreen';

export default createResponsiveUserPage(DesktopPage, MobilePage);
