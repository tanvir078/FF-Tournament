import createResponsiveUserPage from '@/components/layout/createResponsiveUserPage';
import DesktopPage from '@/views/user/Desktop/matches/[id]/claim';
import MobilePage from '@/views/user/Mobile/matches/[id]/claim';

export default createResponsiveUserPage(DesktopPage, MobilePage);
