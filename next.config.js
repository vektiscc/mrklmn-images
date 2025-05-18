module.exports = {
  api: {
    bodyParser: false, // Отключаем встроенный парсер для API routes
  },
  images: {
    domains: ['res.cloudinary.com'], // Разрешаем оптимизацию изображений из Cloudinary
  },
};
