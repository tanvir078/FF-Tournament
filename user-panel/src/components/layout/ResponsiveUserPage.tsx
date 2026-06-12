import { useEffect, useState, type ComponentType } from 'react';

const desktopMediaQuery = '(min-width: 1024px)';

export default function ResponsiveUserPage<Props extends object>({
  DesktopPage,
  MobilePage,
  pageProps,
}: {
  DesktopPage: ComponentType<Props>;
  MobilePage: ComponentType<Props>;
  pageProps: Props;
}) {
  const [layout, setLayout] = useState<'desktop' | 'mobile' | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const updateLayout = () => setLayout(mediaQuery.matches ? 'desktop' : 'mobile');

    updateLayout();
    mediaQuery.addEventListener('change', updateLayout);

    return () => mediaQuery.removeEventListener('change', updateLayout);
  }, []);

  if (!layout) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return layout === 'desktop'
    ? <DesktopPage {...pageProps} />
    : <MobilePage {...pageProps} />;
}
