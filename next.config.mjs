
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.uploadthing.com',
            },
            {
                protocol: 'https',
                hostname: 'utfs.io',
            },
            {
                protocol: 'https',
                // allow any pub-*.r2.dev host and any path (covers both bucket-prefixed and non-prefixed URLs)
                hostname: 'pub-*.r2.dev',
                pathname: '/**',
            },
        ],
    },

}

export default nextConfig