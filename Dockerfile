# Usa una imagen base de Node.js
FROM node:18

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de tu proyecto a la imagen
COPY package*.json ./
RUN npm install

# Copia el resto del proyecto
COPY . .

# Exponer el puerto que tu aplicación usa
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start:prod"]
