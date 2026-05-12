-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- AlterTable
ALTER TABLE "GpsPosition" ADD COLUMN     "location" geometry(Point, 4326);

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "path" geometry(LineString, 4326);

-- AlterTable
ALTER TABLE "Stop" ADD COLUMN     "location" geometry(Point, 4326);
