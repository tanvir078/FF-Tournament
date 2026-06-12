import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/tournaments/TournamentDetailsScreen';
import MobilePage from '@/views/user/Mobile/tournaments/TournamentDetailsScreen';

export default createResponsiveUserPage(DesktopPage, MobilePage);
