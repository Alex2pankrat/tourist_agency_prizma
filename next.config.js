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
  // Настраиваем алиасы для импортов
  webpack: (config) => {
    config.resolve.alias['@'] = config.resolve.alias || {}
    config.resolve.alias['@'] = require('path').resolve(__dirname, 'src')
    return config
  },
}

module.exports = nextConfig
