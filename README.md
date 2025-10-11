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

## Description

**Scheduling Service Microservice** - A comprehensive NestJS-based service for managing teacher availability, session scheduling, bookings, and enrollments. This service integrates with video conferencing platforms and payment systems to provide a complete educational platform backend.

## Features

### Core Functionality
- **Availability Management**: Teachers can define and update their available time slots
- **Session Scheduling**: Create and manage both one-on-one and group sessions
- **Booking & Enrollment**: Students can book individual sessions or enroll in group classes
- **Payment Integration**: Handles both free and paid sessions with payment coordination
- **Video Conferencing**: Automatic Jitsi Meet integration for live sessions
- **Real-time Notifications**: Integration points for session reminders

### Database Schema
- **teacher_availability**: Time blocks when teachers are available
- **scheduled_sessions**: Central table for all sessions (one-on-one and group)
- **session_attendees**: Tracks student enrollments in sessions

## API Endpoints

### Teacher-Facing APIs

#### POST `/api/scheduling/availability`
Update teacher availability slots
```json
{
  "availabilities": [
    { "startTime": "2025-07-21T09:00:00Z", "endTime": "2025-07-21T12:00:00Z" }
  ]
}
```

#### POST `/api/scheduling/group-sessions`
Create a new group session
```json
{
  "title": "Mastering Quadratic Equations",
  "description": "An in-depth look at factoring and solving.",
  "startTime": "2025-07-22T14:00:00Z",
  "endTime": "2025-07-22T15:00:00Z",
  "isPaid": true,
  "price": 500.00,
  "maxAttendees": 20
}
```

#### GET `/api/scheduling/me/sessions`
Retrieve all sessions for authenticated teacher

### Student-Facing APIs

#### GET `/api/scheduling/teachers/{teacherId}/availability`
Get available time slots for a specific teacher

#### GET `/api/scheduling/group-sessions`
List all upcoming, open group sessions

#### POST `/api/scheduling/book-session`
Book a one-on-one session
```json
{
  "availabilityId": "avail-uuid-123"
}
```

#### POST `/api/scheduling/enroll-group-session`
Enroll in a group session
```json
{
  "sessionId": "session-uuid-abc"
}
```

#### GET `/api/scheduling/me/sessions`
Retrieve all sessions for authenticated student

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Docker

This service includes a production-ready multi-stage `Dockerfile` and a `docker-compose.yml` for local development with PostgreSQL.

Prerequisites
- Docker Desktop should be installed and running (Windows). If you see an error like `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`, start Docker Desktop and try again.

Build image
```powershell
docker build -t scheduling-service:dev .
```

Run with Docker (single container)
```powershell
docker run --rm -p 3004:3004 `
  -e NODE_ENV=production `
  -e PORT=3004 `
  -e DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require `
  scheduling-service:dev
```

Run with Docker Compose (app + Postgres for local dev)
```powershell
docker compose up --build
```

Compose details
- App available at http://localhost:3004
- Postgres exposed at host port 5433 (container port 5432)
- App uses discrete DB_* env vars in compose to connect to the `db` service

Environment variables
- Default `PORT` is 3004 (configurable)
- For cloud DBs, prefer `DATABASE_URL`. For local dev via compose, DB_* vars are provided automatically to the app container.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
