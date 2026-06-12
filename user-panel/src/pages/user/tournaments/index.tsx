import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/tournaments/TournamentListScreen';
import MobilePage from '@/views/user/Mobile/tournaments/TournamentListScreen';

export default createResponsiveUserPage(DesktopPage, MobilePage);
