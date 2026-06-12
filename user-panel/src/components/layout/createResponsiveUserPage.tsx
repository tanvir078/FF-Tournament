import type { ComponentType } from 'react';
import ResponsiveUserPage from '@/components/layout/ResponsiveUserPage';

export default function createResponsiveUserPage<Props extends object = Record<string, never>>(
  DesktopPage: ComponentType<Props>,
  MobilePage: ComponentType<Props>
) {
  return function UserPage(pageProps: Props) {
    return (
      <ResponsiveUserPage
        DesktopPage={DesktopPage}
        MobilePage={MobilePage}
        pageProps={pageProps}
      />
    );
  };
}
