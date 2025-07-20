# 🏨 Sistema de Gestión Hotelera Luxor

<div align="center">

![Luxor Hotel Management](https://img.shields.io/badge/Luxor-Hotel%20Management-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)

**Sistema integral de gestión hotelera desarrollado con tecnologías modernas**

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [API](#-api) • [Contribuir](#-contribuir)

</div>

---

## 📋 Descripción

El **Sistema de Gestión Hotelera Luxor** es una aplicación web completa diseñada para automatizar y optimizar las operaciones de establecimientos hoteleros. Desarrollado con Django REST Framework y React, ofrece una solución robusta, escalable y fácil de usar.

### 🎯 Objetivo

Proporcionar una herramienta integral que permita a los hoteles gestionar eficientemente sus operaciones diarias, desde el registro de huéspedes hasta la generación de reportes financieros, mejorando la experiencia del cliente y optimizando los recursos del establecimiento.

## ✨ Características

### 🏠 Gestión de Habitaciones
- ✅ Catálogo completo de habitaciones
- ✅ Estados en tiempo real (Disponible, Ocupado, Sucio, Mantenimiento)
- ✅ Tipos de habitación (Simple, Doble, Triple, Familiar)
- ✅ Gestión de precios y descripciones
- ✅ Control de disponibilidad automático

### 👥 Gestión de Clientes
- ✅ Registro de huéspedes con validación de documentos
- ✅ Check-in y check-out automatizado
- ✅ Historial de hospedajes
- ✅ Asignación múltiple de habitaciones
- ✅ Soporte para diferentes tipos de pago

### 🔐 Sistema de Autenticación
- ✅ Autenticación JWT segura
- ✅ Gestión de roles y permisos
- ✅ Sesiones con renovación automática
- ✅ Registro de actividades de usuario

### 📊 Reportes y Análisis
- ✅ Reportes de ocupación hotelera
- ✅ Análisis de ingresos por período
- ✅ Estadísticas de clientes
- ✅ Exportación a Excel y PDF
- ✅ Gráficos interactivos

### 🛡️ Seguridad
- ✅ Protección CSRF y XSS
- ✅ Validación de datos robusta
- ✅ Encriptación de contraseñas
- ✅ Auditoría de accesos

## 🛠️ Tecnologías

### Backend
- **Django 5.0.1** - Framework web principal
- **Django REST Framework 3.14.0** - API REST
- **PostgreSQL 16** - Base de datos
- **JWT** - Autenticación
- **Pandas** - Análisis de datos
- **Docker** - Containerización

### Frontend
- **React 19.1.0** - Biblioteca de UI
- **Tailwind CSS 4.1.7** - Framework CSS
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento SPA
- **Recharts** - Visualización de datos

### DevOps
- **Docker Compose** - Orquestación
- **PostgreSQL** - Base de datos
- **pgAdmin** - Administración de BD

## 🚀 Instalación

### Prerrequisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git** 2.30+
- **Navegador web moderno**

### Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/gaguilarf/SistemaGestionHotelLuxor.git
cd SistemaGestionHotelLuxor
```

2. **Configurar variables de entorno**
```bash
# El archivo docker-compose.yml ya incluye las variables necesarias
# No se requiere configuración adicional para desarrollo
```

3. **Levantar los servicios**
```bash
docker-compose up -d
```

4. **Crear superusuario**
```bash
docker exec -it luxor_backend python manage.py createsuperuser
```

5. **Acceder a la aplicación**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin
- **pgAdmin**: http://localhost:5050

### Credenciales por Defecto

**Base de Datos:**
- Usuario: `postgres`
- Contraseña: `postgres123`
- Base de datos: `BD_LUXOR`

**pgAdmin:**
- Email: `admin@luxor.com`
- Contraseña: `admin123`

## 📖 Uso

### Acceso al Sistema

1. Abra su navegador y vaya a `http://localhost:5173`
2. Inicie sesión con las credenciales del superusuario creado
3. Explore los diferentes módulos desde el menú principal

### Módulos Principales

#### 🏠 Habitaciones
- Crear, editar y eliminar habitaciones
- Cambiar estados de habitación
- Buscar y filtrar habitaciones
- Ver historial de ocupación

#### 👥 Clientes
- Registrar nuevos huéspedes
- Realizar check-in y check-out
- Asignar habitaciones
- Ver historial de clientes

#### 📊 Reportes
- Generar reportes de ocupación
- Analizar ingresos por período
- Exportar datos a Excel
- Visualizar estadísticas

## 🔌 API

### Endpoints Principales

#### Autenticación
```http
POST /api/login/          # Iniciar sesión
POST /api/logout/         # Cerrar sesión
GET  /api/users/me/       # Usuario actual
```

#### Habitaciones
```http
GET    /api/rooms/        # Listar habitaciones
POST   /api/rooms/        # Crear habitación
GET    /api/rooms/{id}/   # Obtener habitación
PUT    /api/rooms/{id}/   # Actualizar habitación
DELETE /api/rooms/{id}/   # Eliminar habitación
```

#### Clientes
```http
GET    /api/clients/      # Listar clientes
POST   /api/clients/      # Crear cliente
GET    /api/clients/{id}/ # Obtener cliente
PUT    /api/clients/{id}/ # Actualizar cliente
```

### Autenticación API

Todas las peticiones requieren token JWT:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Django API     │    │  PostgreSQL     │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│   Port: 5173    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    pgAdmin      │
                    │  (DB Manager)   │
                    │   Port: 5050    │
                    └─────────────────┘
```

## 📁 Estructura del Proyecto

```
SistemaGestionHotelLuxor/
├── backend/                 # Aplicación Django
│   ├── authentication/      # Módulo de autenticación
│   ├── clients/            # Gestión de clientes
│   ├── rooms/              # Gestión de habitaciones
│   ├── users/              # Gestión de usuarios
│   ├── reports/            # Reportes y análisis
│   ├── said/               # Configuración principal
│   └── requirements.txt    # Dependencias Python
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios API
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilidades
│   └── package.json        # Dependencias Node.js
├── docker-compose.yml      # Configuración Docker
├── README.md              # Este archivo
├── INFORME_SISTEMA_GESTION_HOTELERA.txt
└── MANUAL_USUARIO_SISTEMA_HOTELERO.txt
```

## 🧪 Testing

### Ejecutar Tests del Backend
```bash
docker exec -it luxor_backend python manage.py test
```

### Ejecutar Tests del Frontend
```bash
docker exec -it luxor_frontend npm test
```

## 📊 Monitoreo

### Logs de la Aplicación
```bash
# Ver logs del backend
docker logs luxor_backend

# Ver logs del frontend
docker logs luxor_frontend

# Ver logs de la base de datos
docker logs luxor_postgres
```

### Métricas de Rendimiento
- Tiempo de respuesta API: < 200ms
- Tiempo de carga frontend: < 3s
- Disponibilidad: 99.9%

## 🔧 Desarrollo

### Configuración del Entorno de Desarrollo

1. **Instalar dependencias localmente** (opcional)
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

2. **Ejecutar en modo desarrollo**
```bash
# Backend (dentro del contenedor)
docker exec -it luxor_backend python manage.py runserver 0.0.0.0:8000

# Frontend (dentro del contenedor)
docker exec -it luxor_frontend npm run dev
```

### Contribuir al Proyecto

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Documentación

- **[Manual de Usuario](MANUAL_USUARIO_SISTEMA_HOTELERO.txt)** - Guía completa para usuarios finales
- **[Informe Técnico](INFORME_SISTEMA_GESTION_HOTELERA.txt)** - Documentación técnica detallada
- **[API Documentation](http://localhost:8000/api/docs/)** - Documentación interactiva de la API

## 🐛 Solución de Problemas

### Problemas Comunes

**Error de conexión a la base de datos:**
```bash
docker-compose down
docker-compose up -d db
# Esperar 30 segundos
docker-compose up -d
```

**Frontend no carga:**
```bash
docker exec -it luxor_frontend npm install
docker-compose restart frontend
```

**Permisos de usuario:**
```bash
docker exec -it luxor_backend python manage.py createsuperuser
```

## 📈 Roadmap

### Versión 1.1.0 (Próxima)
- [ ] Módulo de reservas online
- [ ] Integración con sistemas de pago
- [ ] Notificaciones push
- [ ] App móvil

### Versión 1.2.0 (Futuro)
- [ ] Integración con PMS externos
- [ ] BI y analytics avanzados
- [ ] Multi-idioma
- [ ] API pública

## 🤝 Contribuidores

<div align="center">

| Rol | Responsabilidad |
|-----|----------------|
| **Backend Developer** | API REST, Base de datos, Seguridad |
| **Frontend Developer** | Interfaz de usuario, UX/UI |
| **DevOps Engineer** | Containerización, Despliegue |
| **QA Tester** | Testing, Calidad de software |

</div>

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

¿Necesitas ayuda? Contáctanos:

- **Issues**: [GitHub Issues](https://github.com/gaguilarf/SistemaGestionHotelLuxor/issues)
- **Documentación**: Ver archivos de documentación incluidos
- **Email**: soporte@luxorhotel.com

---

<div align="center">

**⭐ Si este proyecto te fue útil, no olvides darle una estrella ⭐**

Desarrollado con ❤️ para la industria hotelera

</div>