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

# Генерация типов Prisma
RUN pnpm prisma generate

# Компилируем TypeScript код
RUN pnpm run build

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["pnpm", "start"]