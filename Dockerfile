# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos de configuración primero
COPY package*.json ./
# Instala las dependencias
RUN npm install

# Instala Nest CLI globalmente
RUN npm install -g @nestjs/cli

# Copia el resto del proyecto
COPY . .

# Construye la aplicación
RUN npm run build

# Exponer el puerto que tu aplicación usa
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start:prod"]
