/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
    experimental: {
        typedRoutes: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.vercel-storage.com' },
            { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }
        ]
    },
    reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
