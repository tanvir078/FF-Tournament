import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Navbar />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
