import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/tournaments/TournamentJoinScreen';
import MobilePage from '@/views/user/Mobile/tournaments/TournamentJoinScreen';

export default createResponsiveUserPage(DesktopPage, MobilePage);
