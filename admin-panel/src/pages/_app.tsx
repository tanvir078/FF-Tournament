import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import Navbar from '@/components/layout/Navbar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}
