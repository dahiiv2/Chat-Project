/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    turbopack: {},
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'uploadthing.com' },
            { protocol: 'https', hostname: 'utfs.io' },
        ]
    }
}

module.exports = nextConfig
