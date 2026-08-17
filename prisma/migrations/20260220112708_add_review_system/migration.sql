/*
  Warnings:

  - You are about to drop the `user_reviews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_reviews" DROP CONSTRAINT "user_reviews_broker_id_fkey";

-- DropForeignKey
ALTER TABLE "user_reviews" DROP CONSTRAINT "user_reviews_prop_firm_id_fkey";

-- DropForeignKey
ALTER TABLE "user_reviews" DROP CONSTRAINT "user_reviews_user_id_fkey";

-- AlterTable
ALTER TABLE "brokers" ADD COLUMN     "avg_overall_rating" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_platform_rating" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_service_rating" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_support_rating" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_value_rating" DOUBLE PRECISION DEFAULT 0.0;

-- AlterTable
ALTER TABLE "prop_firms" ADD COLUMN     "avg_customer_care" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_overall_rating" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_payout_process" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_trading_conditions" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "avg_user_friendliness" DOUBLE PRECISION DEFAULT 0.0;

-- DropTable
DROP TABLE "user_reviews";

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "service_rating" INTEGER,
    "platform_rating" INTEGER,
    "value_rating" INTEGER,
    "support_rating" INTEGER,
    "trading_conditions" INTEGER,
    "customer_care" INTEGER,
    "user_friendliness" INTEGER,
    "payout_process" INTEGER,
    "trading_experience" TEXT,
    "years_trading" INTEGER,
    "verified_trader" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "moderation_note" TEXT,
    "moderated_by" TEXT,
    "moderated_at" TIMESTAMP(3),
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "broker_id" INTEGER,
    "prop_firm_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_replies" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_reply_id" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "helpful_votes" (
    "id" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "helpful_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_reports" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "reviews_broker_id_status_idx" ON "reviews"("broker_id", "status");

-- CreateIndex
CREATE INDEX "reviews_prop_firm_id_status_idx" ON "reviews"("prop_firm_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_broker_id_key" ON "reviews"("user_id", "broker_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_prop_firm_id_key" ON "reviews"("user_id", "prop_firm_id");

-- CreateIndex
CREATE INDEX "review_replies_review_id_idx" ON "review_replies"("review_id");

-- CreateIndex
CREATE INDEX "review_replies_user_id_idx" ON "review_replies"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "helpful_votes_review_id_user_id_key" ON "helpful_votes"("review_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_reports_review_id_user_id_key" ON "review_reports"("review_id", "user_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_parent_reply_id_fkey" FOREIGN KEY ("parent_reply_id") REFERENCES "review_replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "helpful_votes" ADD CONSTRAINT "helpful_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "helpful_votes" ADD CONSTRAINT "helpful_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
