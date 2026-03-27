/** @type {import('next').NextConfig} */
const nextConfig = {
  // Разрешаем загрузку изображений с Unsplash для демонстрации
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
