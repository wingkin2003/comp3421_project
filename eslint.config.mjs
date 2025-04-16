/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole:
      process.env.NEXT_PUBLIC_PRODUCTION_MODE === 'production' && process.env.NEXT_PUBLIC_DEVMODE === 'false'
        ? { exclude: ['error', 'info'] }
        : { exclude: ['log', 'warn', 'error', 'debug', 'table'] },
    styledComponents: true,
  },
};

export default nextConfig;
