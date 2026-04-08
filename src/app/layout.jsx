import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
    title: 'Vionara – Luxury Jewellery',
    description: 'Discover exquisite luxury jewellery at Vionara. Shop rings, earrings, necklaces, bracelets and more.',
    icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
            </head>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
