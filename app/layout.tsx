import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Lagunartea - Reservas",
  description: "Sistema de gestión de reservas y consumos para la sociedad gastronómica Lagunartea.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: '#00798C',
                    accent: '#E76F51',
                    dark: '#2E615F',
                    light: '#f3f4f6'
                  },
                  fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                  },
                  keyframes: {
                    'fade-in': {
                      '0%': { opacity: '0' },
                      '100%': { opacity: '1' },
                    },
                    'slide-up': {
                      '0%': { transform: 'translateY(100%)' },
                      '100%': { transform: 'translateY(0)' },
                    },
                    'bounce-in': {
                      '0%': { transform: 'scale(0)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' },
                    }
                  },
                  animation: {
                    'fade-in': 'fade-in 0.3s ease-out',
                    'slide-up': 'slide-up 0.3s ease-out',
                    'bounce-in': 'bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }
                }
              }
            }
          `
        }} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
            body { font-family: 'Inter', sans-serif; background-color: #f3f4f6; }
            /* Hide scrollbar for chrome/safari/opera */
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            /* Hide scrollbar for IE, Edge and Firefox */
            .no-scrollbar {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
          `
        }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}