/*
  Warnings:

  - Added the required column `prefix` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "prefix" VARCHAR(2) NOT NULL;
