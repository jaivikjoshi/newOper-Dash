import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from './utils/UserContext';
import { OrganizationProvider } from './utils/OrganizationContext';
import { MemberProvider } from './utils/MemberContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hospitality Hub',
  description: 'Onboarding for hospitality businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#e9e2fe]`}>
        <UserProvider>
          <OrganizationProvider>
            <MemberProvider>
              {children}
            </MemberProvider>
          </OrganizationProvider>
        </UserProvider>
      </body>
    </html>
  );
}
