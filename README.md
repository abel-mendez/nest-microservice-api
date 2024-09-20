# Prueba en Ambiente Productivo

URL: [https://nest-microservice-api-production.up.railway.app](https://nest-microservice-api-production.up.railway.app)

## Rutas

### `/register` - POST
**Body:**

```json
{
    "email": "example@evaluexamplear.com",
    "password": "example"
}
```
### `/login` - POST
**Body:**

```json
{
    "email": "example@evaluexamplear.com",
    "password": "example"
}
```

### `/list` - GET

**Requiere:** Bearer Token entregado por `/login`

**Recibe:** 3 query params opcionales:
- `from`
- `size`
- `email`
### Ejemplos

- `list?email=a&from=0&size=10`
- `list?email=a&from=0`
- `list?size=15`

### Ruta 4: `@MessagePattern({ cmd: 'list_users' })`
La ruta contiene la lógica de negocio implementada con el módulo microservicio de Nest. Por lo tanto, no es accesible mediante HTTP, sino a través del protocolo TCP proporcionado por Nest. Esta ruta es usada de forma interna por el endpoint `/list`

# Prueba en Local

Para probar en local necesitas tener instalado Docker y tenerlo activo.

Debes posicionarte dentro del proyecto en la raíz y ejecutar el siguiente comando:

```bash
docker-compose up --build
```

Esto levantará todo el proyecto, incluida la base de datos y microservicios en [http://localhost:3000](http://localhost:3000). Todas las demás rutas se mantienen sin cambios.

## Consideraciones del Proyecto

- Se aplicó una arquitectura basada en módulos y, dentro de ella, una arquitectura basada en capas para asegurar la escalabilidad.
- Dentro de capas importantes (especialmente servicios) se encuentra la carpeta `test`, para probar funcionalidades críticas y capacidades de interacción entre clases.
- Se utilizó Nest Microservices, que permite el despliegue de microservicios dentro de una misma aplicación, limitando el tipo de conexión que acepta.
- El proyecto se encuentra totalmente dockerizado para facilitar su uso entre desarrolladores y evitar inconsistencias por ambientes.
- El proyecto está integrado con GitHub Actions para seguir prácticas de CI/CD.
- El proyecto cuenta con linter y Prettier para mantener un código legible, ordenado, sin imports ni variables no usadas, y evitar el uso de `any` para mantener un tipado estricto.
- Se implementó el uso de `.env` para evitar hardcodear información que pudiera ser sensible.
- Las contraseñas se guardan hasheadas en la base de datos.
- A pesar de tener las contraseñas hasheadas, no son devueltas por el endpoint de listar, ya que sería una brecha de seguridad.
- **Consideración de seguridad:** Si bien se implementa el uso de microservicios en Nest para limitar el uso de la capa de negocios y de JWT, podría ser una brecha utilizar el mismo token del usuario. Por lo tanto, yo implementaría un usuario consumidor interno que sea el único que tenga acceso a este tipo de servicios “críticos”.

