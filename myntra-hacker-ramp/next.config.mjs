/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.myntra.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.myntassets.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '**.zmtcdn.com' },
      { protocol: 'https', hostname: '**.staticflickr.com' },
      { protocol: 'https', hostname: '**.pexels.com' },
      { protocol: 'https', hostname: '**.pixabay.com' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 't3.ftcdn.net' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'www.freepik.com' }
    ]
  }
};

export default nextConfig;
