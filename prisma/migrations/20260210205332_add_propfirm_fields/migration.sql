/*
  Warnings:

  - You are about to drop the column `charting_tools` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `copy_trading` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `education_resources_score` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `min_payout` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_trading` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `payout_processing` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `rule_flexibility` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `scaling_plan` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `support` on the `prop_firms` table. All the data in the column will be lost.
  - You are about to drop the column `trading_features` on the `prop_firms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prop_firms" DROP COLUMN "charting_tools",
DROP COLUMN "copy_trading",
DROP COLUMN "education_resources_score",
DROP COLUMN "min_payout",
DROP COLUMN "mobile_trading",
DROP COLUMN "payout_processing",
DROP COLUMN "rule_flexibility",
DROP COLUMN "scaling_plan",
DROP COLUMN "support",
DROP COLUMN "trading_features",
ADD COLUMN     "minimum_payout" DOUBLE PRECISION;
