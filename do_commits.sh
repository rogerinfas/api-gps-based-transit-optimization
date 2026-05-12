#!/bin/bash
set -e

# 1. Config
git add tsconfig.json && git commit -m "chore(config): add granular path aliases to tsconfig.json"
git add package.json && git commit -m "chore(config): update scripts to use tsconfig-paths"

# 2. Domain - Vehicle
git add src/domain/entities/vehicle/vehicle.entity.ts && git commit -m "refactor(domain): move vehicle entity to entities folder"
git add src/domain/entities/vehicle/vehicle.entity.spec.ts && git commit -m "refactor(domain): move vehicle entity unit tests"
git add src/domain/entities/vehicle/vehicle-status.ts && git commit -m "refactor(domain): move vehicle status enum to domain entities"
git add src/domain/repositories/vehicle/vehicle.repository.ts && git commit -m "refactor(domain): move vehicle repository interface"

# 3. Domain - Route
git add src/domain/entities/route/route.entity.ts && git commit -m "refactor(domain): relocate route entity to entities subfolder"
git add src/domain/repositories/route/route.repository.ts && git commit -m "refactor(domain): relocate route repository interface"

# 4. Application - Vehicle Use Cases
git add src/application/use-cases/vehicle/create-vehicle.use-case.ts && git commit -m "refactor(application): move create vehicle use case"
git add src/application/use-cases/vehicle/delete-vehicle.use-case.ts && git commit -m "refactor(application): move delete vehicle use case"
git add src/application/use-cases/vehicle/find-all-vehicles.use-case.ts && git commit -m "refactor(application): move find all vehicles use case"
git add src/application/use-cases/vehicle/find-vehicle-by-id.use-case.ts && git commit -m "refactor(application): move find vehicle by id use case"
git add src/application/use-cases/vehicle/update-vehicle.use-case.ts && git commit -m "refactor(application): move update vehicle use case"
git add src/application/use-cases/vehicle/vehicle.service.spec.ts && git commit -m "refactor(application): relocate vehicle use case tests"

# 5. Application - Route Use Cases
git add src/application/use-cases/route/create-route.use-case.ts && git commit -m "refactor(application): move create route use case"
git add src/application/use-cases/route/delete-route.use-case.ts && git commit -m "refactor(application): move delete route use case"
git add src/application/use-cases/route/find-all-routes.use-case.ts && git commit -m "refactor(application): move find all routes use case"
git add src/application/use-cases/route/find-route-by-id.use-case.ts && git commit -m "refactor(application): move find route by id use case"
git add src/application/use-cases/route/update-route.use-case.ts && git commit -m "refactor(application): move update route use case"

# 6. Infrastructure - Persistence
git add src/infrastructure/persistence/vehicle/prisma-vehicle.repository.ts && git commit -m "refactor(infra): move prisma vehicle repository implementation"
git add src/infrastructure/persistence/vehicle/prisma-vehicle.mapper.ts && git commit -m "refactor(infra): move prisma vehicle domain mapper"
git add src/infrastructure/persistence/vehicle/prisma-vehicle.repository.spec.ts && git commit -m "refactor(infra): move vehicle repository integration tests"
git add src/infrastructure/persistence/route/prisma-route.repository.ts && git commit -m "refactor(infra): move prisma route repository implementation"
git add src/infrastructure/persistence/route/prisma-route.mapper.ts && git commit -m "refactor(infra): move prisma route domain mapper"

# 7. Infrastructure - Modules
git add src/infrastructure/modules/vehicle/vehicle.module.ts && git commit -m "refactor(infra): move vehicle module to infrastructure layer"
git add src/infrastructure/modules/route/route.module.ts && git commit -m "refactor(infra): move route module to infrastructure layer"

# 8. Presentation - Vehicle
git add src/presentation/controllers/vehicle/vehicle.controller.ts && git commit -m "refactor(presentation): move vehicle controller to controllers folder"
git add src/presentation/controllers/vehicle/vehicle.controller.spec.ts && git commit -m "refactor(presentation): move vehicle controller unit tests"
git add src/presentation/dtos/vehicle/create-vehicle.dto.ts && git commit -m "refactor(presentation): move create vehicle dto"
git add src/presentation/dtos/vehicle/update-vehicle.dto.ts && git commit -m "refactor(presentation): move update vehicle dto"
git add src/presentation/dtos/vehicle/vehicle-response.dto.ts && git commit -m "refactor(presentation): move vehicle response dto"

# 9. Presentation - Route
git add src/presentation/controllers/route/route.controller.ts && git commit -m "refactor(presentation): move route controller"
git add src/presentation/dtos/route/create-route.dto.ts && git commit -m "refactor(presentation): move create route dto"
git add src/presentation/dtos/route/update-route.dto.ts && git commit -m "refactor(presentation): move update route dto"
git add src/presentation/dtos/route/route-response.dto.ts && git commit -m "refactor(presentation): move route response dto"

# 10. Final
git add src/app.module.ts && git commit -m "refactor(arch): update app module with new granular paths"
git add . && git commit -m "chore(arch): finalize modular clean architecture refactor"
