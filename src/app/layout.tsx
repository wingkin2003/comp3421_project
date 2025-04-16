import '@radix-ui/themes/styles.css';
import '@/styles/reset.css';
import '@/styles/globals.css';
import '@/styles/custom.css';

import { Theme } from '@radix-ui/themes';
import Header from '@/app/components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Hong Kong Weather</title>
        <meta name="description" content="Interactive Hong Kong weather app with current conditions, forecasts, and historical data" />
      </head>
      <body>
        <Theme id="root" appearance="light">
          <Header />
          {children}
        </Theme>
      </body>
    </html>
  );
}