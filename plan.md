# Microservice Project Plan

## Project: E-Commerce Platform (Production-grade)

---

## Architecture Overview

```
                        [Client]
                           |
                    [API Gateway :3000]
                    (routing, auth, rate limit, circuit breaker)
                    /       |       \        \
              [User]  [Product]  [Order]  [Notification]
             :3001     :3002      :3003      :3004
               |          |         |
           postgres    postgres   mongodb
                              |
                         [RabbitMQ]
                              |
                    [Notification Service]
```

---

## Services

| Service              | Port | Database   | Responsibility                        |
|----------------------|------|------------|---------------------------------------|
| api-gateway          | 3000 | -          | Routing, Auth check, Rate limit, Circuit breaker |
| user-service         | 3001 | PostgreSQL | Register, Login, JWT                  |
| product-service      | 3002 | PostgreSQL | Product CRUD                          |
| order-service        | 3003 | MongoDB    | Create order, Publish event           |
| notification-service | 3004 | -          | Consume RabbitMQ event, Send notification |

---

## Infrastructure (Docker)

| Service    | Port          | Purpose                  |
|------------|---------------|--------------------------|
| PostgreSQL | 5432          | user-service, product-service DB |
| MongoDB    | 27017         | order-service DB         |
| RabbitMQ   | 5672 / 15672  | Async messaging (admin UI: 15672) |

---

## Project Structure

```
micro-service/
├── docker-compose.yml
├── plan.md
│
├── api-gateway/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── circuitBreaker.middleware.ts
│   │   └── config/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── user-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── interfaces/
│   │   │   ├── IUserService.ts
│   │   │   └── IUserRepository.ts
│   │   ├── routes/
│   │   │   └── user.routes.ts
│   │   ├── controllers/
│   │   │   └── user.controller.ts
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   ├── repositories/
│   │   │   └── user.repository.ts
│   │   ├── models/
│   │   │   └── user.model.ts
│   │   ├── middleware/
│   │   │   └── validate.middleware.ts
│   │   ├── events/
│   │   │   └── publisher.ts
│   │   └── config/
│   │       └── db.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── product-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── interfaces/
│   │   │   ├── IProductService.ts
│   │   │   └── IProductRepository.ts
│   │   ├── routes/
│   │   │   └── product.routes.ts
│   │   ├── controllers/
│   │   │   └── product.controller.ts
│   │   ├── services/
│   │   │   └── product.service.ts
│   │   ├── repositories/
│   │   │   └── product.repository.ts
│   │   ├── models/
│   │   │   └── product.model.ts
│   │   └── config/
│   │       └── db.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── order-service/
│   ├── src/
│   │   ├── index.ts
│   │   ├── interfaces/
│   │   │   ├── IOrderService.ts
│   │   │   └── IOrderRepository.ts
│   │   ├── routes/
│   │   │   └── order.routes.ts
│   │   ├── controllers/
│   │   │   └── order.controller.ts
│   │   ├── services/
│   │   │   └── order.service.ts
│   │   ├── repositories/
│   │   │   └── order.repository.ts
│   │   ├── models/
│   │   │   └── order.model.ts
│   │   ├── events/
│   │   │   └── publisher.ts
│   │   └── config/
│   │       └── db.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
└── notification-service/
    ├── src/
    │   ├── index.ts
    │   ├── events/
    │   │   └── consumer.ts
    │   └── handlers/
    │       ├── INotificationHandler.ts    <- interface (OCP)
    │       ├── userRegistered.handler.ts
    │       └── orderCreated.handler.ts
    ├── package.json
    ├── tsconfig.json
    └── Dockerfile
```

---

## SOLID Principles — কোথায় apply হবে

### S - Single Responsibility
```
controller   → শুধু request/response handle করবে
service      → শুধু business logic
repository   → শুধু DB query
publisher    → শুধু event publish করবে
```

### O - Open/Closed
```
notification-service-এ নতুন event type আসলে
existing consumer.ts change করতে হবে না
শুধু নতুন handler file add করবো
```

### L - Liskov Substitution
```
UserRepository implements IUserRepository
যেকোনো জায়গায় IUserRepository use করলে
UserRepository দিয়ে replace করা যাবে
```

### I - Interface Segregation
```
IUserService  → user-related methods only
IUserRepository → DB methods only
আলাদা আলাদা interface, একটা fat interface না
```

### D - Dependency Inversion
```
UserController → IUserService (interface) এ depend করে
UserService    → IUserRepository (interface) এ depend করে
concrete class এ directly depend করে না
```

---

## Design Patterns — কোথায় apply হবে

| Pattern            | কোথায়                                      |
|--------------------|---------------------------------------------|
| Repository Pattern | repositories/ layer — DB query আলাদা        |
| Service Layer      | services/ layer — business logic আলাদা      |
| Singleton Pattern  | DB connection, RabbitMQ connection          |
| Factory Pattern    | RabbitMQ connection তৈরিতে                  |
| Observer Pattern   | Event publish/consume (RabbitMQ)            |
| Middleware Pattern | Auth, rate limit, logging, validation       |

---

## Request Flow (Pattern অনুযায়ী)

```
Request
  -> Middleware (validate, auth)
  -> Controller (request/response handle)
  -> Service (business logic)
  -> Repository (DB query)
  -> Model (schema)

Event Flow:
  -> Service
  -> Publisher (RabbitMQ publish)
  -> [RabbitMQ]
  -> Consumer
  -> Handler
```

---

## Build Order (File by File)

### Phase 1: Infrastructure
- [ ] docker-compose.yml (PostgreSQL + MongoDB + RabbitMQ)
- [ ] Infrastructure test (containers up করে verify)

### Phase 2: User Service
- [ ] package.json + tsconfig.json
- [ ] src/config/db.ts (PostgreSQL connection — Singleton)
- [ ] src/models/user.model.ts (TypeORM entity)
- [ ] src/interfaces/IUserRepository.ts
- [ ] src/interfaces/IUserService.ts
- [ ] src/repositories/user.repository.ts
- [ ] src/services/user.service.ts (register, login, JWT)
- [ ] src/middleware/validate.middleware.ts (Zod)
- [ ] src/controllers/user.controller.ts
- [ ] src/routes/user.routes.ts
- [ ] src/events/publisher.ts (RabbitMQ publish USER_REGISTERED)
- [ ] src/index.ts (app entry point)
- [ ] Dockerfile

### Phase 3: Notification Service
- [ ] package.json + tsconfig.json
- [ ] src/handlers/INotificationHandler.ts (interface — OCP)
- [ ] src/handlers/userRegistered.handler.ts
- [ ] src/handlers/orderCreated.handler.ts
- [ ] src/events/consumer.ts (RabbitMQ consume)
- [ ] src/index.ts
- [ ] Dockerfile

### Phase 4: Product Service
- [ ] package.json + tsconfig.json
- [ ] src/config/db.ts
- [ ] src/models/product.model.ts
- [ ] src/interfaces/IProductRepository.ts
- [ ] src/interfaces/IProductService.ts
- [ ] src/repositories/product.repository.ts
- [ ] src/services/product.service.ts
- [ ] src/middleware/validate.middleware.ts
- [ ] src/controllers/product.controller.ts
- [ ] src/routes/product.routes.ts
- [ ] src/index.ts
- [ ] Dockerfile

### Phase 5: Order Service
- [ ] package.json + tsconfig.json
- [ ] src/config/db.ts (MongoDB)
- [ ] src/models/order.model.ts (Mongoose)
- [ ] src/interfaces/IOrderRepository.ts
- [ ] src/interfaces/IOrderService.ts
- [ ] src/repositories/order.repository.ts
- [ ] src/services/order.service.ts
- [ ] src/controllers/order.controller.ts
- [ ] src/routes/order.routes.ts
- [ ] src/events/publisher.ts (ORDER_CREATED)
- [ ] src/index.ts
- [ ] Dockerfile

### Phase 6: API Gateway
- [ ] package.json + tsconfig.json
- [ ] src/middleware/auth.middleware.ts (JWT verify)
- [ ] src/middleware/rateLimit.middleware.ts
- [ ] src/middleware/circuitBreaker.middleware.ts (opossum)
- [ ] src/routes/ (proxy to each service)
- [ ] src/index.ts
- [ ] Dockerfile

### Phase 7: Production Touches
- [ ] Distributed logging with correlation ID (Winston)
- [ ] Health check endpoint on every service
- [ ] docker-compose final test
- [ ] README.md

---

## Event Flow

### User Registration:
```
POST /api/users/register
  -> api-gateway
  -> user-service (hash password, save DB)
  -> publish USER_REGISTERED to RabbitMQ
  -> notification-service consumes
  -> userRegistered.handler.ts runs
  -> log "Welcome email sent to user@example.com"
```

### Order Created:
```
POST /api/orders
  -> api-gateway (JWT check)
  -> order-service (save MongoDB)
  -> publish ORDER_CREATED to RabbitMQ
  -> notification-service consumes
  -> orderCreated.handler.ts runs
  -> log "Order confirmation sent to user@example.com"
```

---

## Key Concepts Covered (Interview Topics)

| Concept                        | Where                              |
|--------------------------------|------------------------------------|
| Service communication (sync)   | Gateway -> Services via HTTP       |
| Service communication (async)  | Order -> RabbitMQ -> Notification  |
| Database per service           | Each service has own DB            |
| JWT Authentication             | User service + Gateway middleware  |
| API Gateway pattern            | api-gateway service                |
| Rate limiting                  | api-gateway                        |
| Circuit breaker pattern        | api-gateway (opossum)              |
| Event-driven architecture      | RabbitMQ events                    |
| Distributed logging            | Winston + correlation ID           |
| Health checks                  | /health on every service           |
| Containerization               | Docker + Docker Compose            |
| Repository Pattern             | repositories/ layer                |
| Service Layer Pattern          | services/ layer                    |
| SOLID Principles               | Throughout all services            |
| Singleton Pattern              | DB & RabbitMQ connections          |
| Observer Pattern               | RabbitMQ publish/consume           |

---

## Tech Stack

| Layer           | Technology                  |
|-----------------|-----------------------------|
| Language        | Node.js + TypeScript        |
| Framework       | Express                     |
| Auth            | JWT (jsonwebtoken)          |
| Password hash   | bcrypt                      |
| Message Queue   | RabbitMQ (amqplib)          |
| ORM (SQL)       | TypeORM                     |
| ODM (MongoDB)   | Mongoose                    |
| Validation      | Zod                         |
| Logging         | Winston                     |
| Containerize    | Docker + Docker Compose     |
| Rate limiting   | express-rate-limit          |
| Circuit breaker | opossum                     |
