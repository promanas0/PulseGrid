import React from 'react';
import { RainbowWeb3Provider } from '../components/RainbowWeb3Provider';

export const metadata = {
  title: 'PulseGrid — Arc L1 Web3 Ecosystem (RainbowKit)',
  description: 'High-performance Web3 dApp with official RainbowKit integration on Circle Arc L1 Testnet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-950 min-h-screen antialiased">
        <RainbowWeb3Provider>
          {children}
        </RainbowWeb3Provider>
      </body>
    </html>
  );
}
