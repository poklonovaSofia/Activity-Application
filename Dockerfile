#FROM node:23
#
## Робоча директорія у контейнері
#WORKDIR /app
#
## Копіюємо package.json та встановлюємо залежності
#COPY package*.json ./
#RUN npm install
#
## Копіюємо решту файлів
#COPY . .
#RUN npm install --prefix web-apka
#RUN npm run build --prefix web-apka
## Відкриваємо порт
#EXPOSE 8080
#
## Команда для запуску сервера
##CMD ["npm", "run", "start"]
#
#CMD ["node", "index.js"]
FROM node:23

# Робоча директорія для всього проєкту
WORKDIR /app

# Копіюємо package.json для бекенду і встановлюємо залежності
COPY backend/package*.json ./backend/
RUN npm install --prefix backend

# Копіюємо файли фронтенду з підкаталогу web-apka і встановлюємо залежності
COPY backend/web-apka/package*.json ./backend/web-apka/
RUN npm install --prefix backend/web-apka

# Копіюємо фронтенд файли
COPY backend/web-apka ./backend/web-apka

# Збираємо фронтенд (React)
RUN npm run build --prefix backend/web-apka

# Копіюємо бекенд файли
COPY backend ./backend

# Копіюємо зібрані статичні файли з фронтенду в папку бекенду (наприклад, в public)
RUN cp -r /app/backend/web-apka/build /app/backend/public

# Відкриваємо порт для бекенду
EXPOSE 8080

# Запускаємо сервер
CMD ["node", "backend/index.js"]
