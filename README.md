# Janoo Front App

Aplicación frontend para la gestión de recursos humanos, desarrollada con Angular.

## Estructura del Proyecto

```
src/
├── app/
│   ├── auth/                    # Módulo de autenticación
│   │   ├── login/              # Componente de inicio de sesión
│   │   └── register/           # Componente de registro
│   │
│   ├── core/                   # Servicios y utilidades core
│   │   ├── guards/            # Guards de autenticación
│   │   ├── interceptors/      # Interceptores HTTP
│   │   ├── models/            # Interfaces y tipos
│   │   └── services/          # Servicios principales
│   │
│   ├── features/              # Módulos de funcionalidad
│   │   ├── checkins/         # Gestión de fichajes
│   │   ├── incidents/        # Gestión de incidencias
│   │   ├── users/            # Gestión de usuarios
│   │   └── vacations/        # Gestión de vacaciones
│   │
│   ├── shared/               # Componentes y utilidades compartidas
│   │   └── components/       # Componentes reutilizables
│   │
│   ├── app.component.*       # Componente raíz
│   ├── app.module.ts         # Módulo principal
│   ├── app-routing.module.ts # Configuración de rutas
│   └── app.config.ts         # Configuración de la aplicación
│
├── assets/                   # Recursos estáticos
├── environments/             # Configuraciones por entorno
└── styles/                   # Estilos globales
```

## Características Principales

- **Autenticación**: Sistema de login y registro
- **Gestión de Usuarios**: Perfiles, roles y permisos
- **Fichajes**: Control de entrada/salida
- **Incidencias**: Reporte y seguimiento de incidencias
- **Vacaciones**: Solicitud y gestión de vacaciones

## Tecnologías

- Angular
- Angular Material
- RxJS
- NgRx (para gestión de estado)
- SCSS
- TypeScript

## Requisitos

- Node.js 22.x
- npm 10.x

## Instalación

1. Clonar el repositorio:

```bash
git clone [https://github.com/lenvigo/janoo-front-app]
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:
   - Copiar `src/environments/environment.example.ts` a `src/environments/environment.ts`
   - Ajustar las variables según el entorno

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

4. Iniciar el servidor de desarrollo:

```bash
npm start
```

## Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm test`: Ejecuta los tests unitarios
- `npm run lint`: Ejecuta el linter
- `npm run e2e`: Ejecuta los tests end-to-end

## CI/CD

El proyecto utiliza GitHub Actions para la integración continua. El workflow incluye:

- Linting
- Testing
- Build
- Cache para optimización

## Contribución

1. Crear una rama desde `develop`
2. Realizar cambios
3. Crear un Pull Request a `develop`

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
