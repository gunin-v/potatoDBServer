FROM node:20

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Устанавливаем зависимости
RUN pnpm install

# Копируем остальные файлы проекта
COPY . .

RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libxkbcommon0 \
    libxcomposite1 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    libjpeg-dev \
    libwoff1 \
    libharfbuzz0b \
    libxslt1.1 \
    libgdk-pixbuf2.0-0 \
    libegl1 \
    libgudev-1.0-0 \
    libxdamage1 \
    libxfixes3 \
    libxtst6 \
    libxshmfence1 \
    libxrender1 \
    libx11-xcb1 \
    libxcb1 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libfreetype6 \
    libglib2.0-0 \
    libpng16-16 \
    libxext6 \
    libx11-6 \
    ca-certificates \
    fonts-liberation \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


# Генерация типов Prisma
RUN pnpm prisma generate

# Устанавливаем ts-node
RUN pnpm add ts-node typescript -D

# Компилируем TypeScript код
RUN pnpm run build

# Открываем порт
EXPOSE 4000

# Запускаем приложение
CMD ["pnpm", "start"]