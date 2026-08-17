/*
  Warnings:

  - You are about to drop the column `minimum_payout` on the `prop_firms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prop_firms" DROP COLUMN "minimum_payout",
ADD COLUMN     "charting_tools" TEXT[],
ADD COLUMN     "copy_trading" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "education_resources_score" DOUBLE PRECISION,
ADD COLUMN     "min_payout" TEXT,
ADD COLUMN     "mobile_trading" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payout_processing" TEXT,
ADD COLUMN     "rule_flexibility" DOUBLE PRECISION,
ADD COLUMN     "scaling_plan" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "support" JSONB,
ADD COLUMN     "trading_features" TEXT[];
