# API de Optimización de Transporte Público basada en GPS

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

Servicio backend orientado a la reducción de tiempos de espera en el transporte público mediante el uso de tecnologías web y sistemas de posicionamiento global (GPS).

## 📌 Descripción
Esta API gestiona la lógica de negocio del sistema, permitiendo el procesamiento de datos geoespaciales en tiempo real, el cálculo de tiempos estimados de llegada (ETA) y la optimización de rutas de transporte.

El sistema está diseñado para mejorar la eficiencia del transporte público y brindar información precisa a los usuarios finales.

## 🧠 Enfoque de Arquitectura
El desarrollo del backend se basa en los siguientes principios:

- **Clean Architecture**: separación clara de responsabilidades y desacoplamiento entre capas.
- **DDD (Domain-Driven Design)**: modelado del dominio enfocado en el problema real del transporte.
- **SOLID**: aplicación de principios de diseño para lograr un sistema mantenible, escalable y robusto.

## 🛠️ Tecnologías Utilizadas
- **NestJS** como framework principal para la construcción de la API
- **PostgreSQL** como sistema de base de datos relacional
- **PostGIS** para el manejo de datos geoespaciales y consultas basadas en ubicación
- Comunicación mediante **API REST**

## ⚙️ Funcionalidades Principales
- Procesamiento de ubicaciones GPS en tiempo real
- Cálculo de tiempos estimados de llegada (ETA)
- Optimización de rutas de transporte público
- Gestión de unidades de transporte
- Exposición de endpoints para consumo del frontend administrativo

## 🎯 Objetivo
Proporcionar una base sólida y escalable para la implementación de soluciones inteligentes en el transporte público, reduciendo tiempos de espera y mejorando la experiencia del usuario.

## 📌 Estado del Proyecto
Proyecto en desarrollo con fines académicos (tesis), enfocado en la validación de un modelo de optimización de tiempos en transporte público.

## 🔐 Variables de entorno
1. Copia el archivo de ejemplo:
   - `cp .env.example .env`
2. Configura las variables según tu entorno local.

Variables actuales:
- `PORT`: puerto donde levanta la API (por defecto `4000`).
- `DB_HOST`: host de base de datos (local: `localhost`).
- `DB_PORT`: puerto de base de datos (local: `5432`).
- `DB_NAME`: nombre de la base de datos.
- `DB_USER`: usuario de base de datos.
- `DB_PASSWORD`: contraseña de base de datos.

## 🐳 Docker Compose (PostgreSQL + PostGIS)
El proyecto incluye `docker-compose.yml` para levantar la base de datos geoespacial.

Comandos:
- Levantar en segundo plano: `docker compose up -d`
- Ver estado: `docker compose ps`
- Ver logs: `docker compose logs -f postgres`
- Detener: `docker compose down`
- Detener y borrar volumen de datos: `docker compose down -v`

Nota:
- La extensión `postgis` se habilita automáticamente en una base nueva mediante `docker/postgres/init/01-enable-postgis.sql`.

## 🧱 Prisma
Prisma está configurado con PostgreSQL y modelos base del dominio:
- `Route`
- `Stop`
- `RouteStop`
- `Vehicle`
- `GpsPosition`
- `EtaPrediction`

Comandos útiles:
- Generar cliente: `pnpm prisma:generate`
- Migración en desarrollo: `pnpm prisma:migrate:dev`
- Aplicar migraciones en despliegue: `pnpm prisma:migrate:deploy`
- Abrir Prisma Studio: `pnpm prisma:studio`

## 🚀 CI/CD
- Rama de integración: `develop`.
- Rama de producción: `main`/`master`.
- CI corre en PR/push a `develop`, `main`, `master`.
- CD despliega automáticamente al hacer merge/push a `main` o `master`.

Secrets requeridos en GitHub Actions:
- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT`
- `VPS_SSH_KEY`
- `BACKEND_APP_PATH`
- `BACKEND_PORT` (recomendado `4000`)
- `POSTGRES_PORT` (recomendado `5432`)
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`