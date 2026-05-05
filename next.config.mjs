import withPWAInit from "next-pwa";
import createNextIntlPlugin from 'next-intl/plugin';
import withBundleAnalyzerInit from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin();

const withBundleAnalyzer = withBundleAnalyzerInit({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    buildExcludes: [/middleware-manifest\.json$/],
    publicExcludes: ['!**/*.mp4', '!**/*.webm'],
    runtimeCaching: [
        {
            urlPattern: /\/api\/admin\/.*/i,
            handler: 'NetworkOnly',
        },
        {
            urlPattern: /\/api\/stream.*/i,
            handler: 'NetworkOnly',
        },
        {
            urlPattern: /\.(?:mp4|webm)$/i,
            handler: 'NetworkOnly',
        },
        {
            urlPattern: /\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 24 * 60 * 60, // 1 day
                },
            },
        },
        {
            urlPattern: /^\/(?:en|sn|nd)\/.*$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'patient-pages',
                expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
            },
        },
        {
            urlPattern: /\/_next\/static\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-assets',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
            },
        },
        {
            urlPattern: /\.(?:js|css|woff2?|eot|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'static-resources',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts',
                expiration: {
                    maxEntries: 20,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
            },
        },
        {
            urlPattern: /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*\.webp$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'blob-thumbnails',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
            },
        },
        {
            urlPattern: /^https:\/\/.*\.public\.blob\.vercel-storage\.com\/.*\.(?:mp4|webm)$/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'blob-videos-fallback',
                plugins: [{
                    cacheWillUpdate: async () => null // Never cache video files
                }]
            }
        }
    ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
           bodySizeLimit: '20mb'
        }
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.vercel-storage.com' },
            { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }
        ]
    }
};

export default withBundleAnalyzer(withPWA(withNextIntl(nextConfig)));
