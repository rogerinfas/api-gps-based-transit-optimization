/*
  Warnings:

  - The primary key for the `EtaPrediction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GpsPosition` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Route` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `path` on the `Route` table. All the data in the column will be lost.
  - The primary key for the `RouteStop` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Stop` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Vehicle` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `routeId` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `EtaPrediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vehicleId` on the `EtaPrediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `routeId` on the `EtaPrediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `stopId` on the `EtaPrediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `GpsPosition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vehicleId` on the `GpsPosition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Route` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `routeId` on the `RouteStop` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `stopId` on the `RouteStop` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Stop` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `Vehicle` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "EtaPrediction" DROP CONSTRAINT "EtaPrediction_routeId_fkey";

-- DropForeignKey
ALTER TABLE "EtaPrediction" DROP CONSTRAINT "EtaPrediction_stopId_fkey";

-- DropForeignKey
ALTER TABLE "EtaPrediction" DROP CONSTRAINT "EtaPrediction_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "GpsPosition" DROP CONSTRAINT "GpsPosition_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "RouteStop" DROP CONSTRAINT "RouteStop_routeId_fkey";

-- DropForeignKey
ALTER TABLE "RouteStop" DROP CONSTRAINT "RouteStop_stopId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_routeId_fkey";

-- AlterTable
ALTER TABLE "EtaPrediction" DROP CONSTRAINT "EtaPrediction_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "vehicleId",
ADD COLUMN     "vehicleId" UUID NOT NULL,
DROP COLUMN "routeId",
ADD COLUMN     "routeId" UUID NOT NULL,
DROP COLUMN "stopId",
ADD COLUMN     "stopId" UUID NOT NULL,
ADD CONSTRAINT "EtaPrediction_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GpsPosition" DROP CONSTRAINT "GpsPosition_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "vehicleId",
ADD COLUMN     "vehicleId" UUID NOT NULL,
ADD CONSTRAINT "GpsPosition_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Route" DROP CONSTRAINT "Route_pkey",
DROP COLUMN "path",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "outboundPath" geometry(LineString, 4326),
ADD COLUMN     "returnPath" geometry(LineString, 4326),
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Route_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RouteStop" DROP CONSTRAINT "RouteStop_pkey",
DROP COLUMN "routeId",
ADD COLUMN     "routeId" UUID NOT NULL,
DROP COLUMN "stopId",
ADD COLUMN     "stopId" UUID NOT NULL,
ADD CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("routeId", "stopId");

-- AlterTable
ALTER TABLE "Stop" DROP CONSTRAINT "Stop_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Stop_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "routeId",
ADD COLUMN     "routeId" UUID,
ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "EtaPrediction_vehicleId_calculatedAt_idx" ON "EtaPrediction"("vehicleId", "calculatedAt" DESC);

-- CreateIndex
CREATE INDEX "EtaPrediction_routeId_stopId_predictedArrivalAt_idx" ON "EtaPrediction"("routeId", "stopId", "predictedArrivalAt");

-- CreateIndex
CREATE INDEX "GpsPosition_vehicleId_recordedAt_idx" ON "GpsPosition"("vehicleId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "RouteStop_stopId_idx" ON "RouteStop"("stopId");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_routeId_stopOrder_key" ON "RouteStop"("routeId", "stopOrder");

-- CreateIndex
CREATE INDEX "Vehicle_routeId_idx" ON "Vehicle"("routeId");

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GpsPosition" ADD CONSTRAINT "GpsPosition_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtaPrediction" ADD CONSTRAINT "EtaPrediction_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtaPrediction" ADD CONSTRAINT "EtaPrediction_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtaPrediction" ADD CONSTRAINT "EtaPrediction_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "Stop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
