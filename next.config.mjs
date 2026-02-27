/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { domains: ['hicqidahzeslzkbikvez.supabase.co', 'lh3.googleusercontent.com'] },
};
export default nextConfig;
