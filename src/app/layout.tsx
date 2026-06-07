import type { Metadata } from 'next';
import { Saira } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '@/components/Footer';
import NavBar from '@/components/Navbar';
import Providers from './providers';
import 'leaflet/dist/leaflet.css';

const saira = Saira({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shelf Awareness',
  description: 'Manage your pantry and be shelf aware.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const classString = `${saira.className} wrapper`;
  return (
    <html lang="en">
      <body className={classString}>
        <Providers>
          <NavBar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
