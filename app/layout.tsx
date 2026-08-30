export const metadata = {
  title: 'PulseGrid — Arc L1 Web3 Ecosystem',
  description: 'High-performance Web3 dApp with Reown AppKit & Multi-Wallet support on Circle Arc L1 Testnet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300..800&family=Fira+Code:wght@400;500;700&family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: #FAFAFA;
            color: #0F172A;
          }
          .font-mono {
            font-family: 'Fira Code', monospace;
          }
          .font-pixel {
            font-family: 'Silkscreen', cursive;
          }
        `}} />
      </head>
      <body className="bg-slate-50 text-slate-950 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
