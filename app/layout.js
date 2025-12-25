import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata = {
  title: 'Rota Portal',
  description: 'Staff scheduling and management portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
