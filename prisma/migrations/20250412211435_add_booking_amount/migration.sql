/*
  Warnings:

  - You are about to drop the `Appliance` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Appliance";
