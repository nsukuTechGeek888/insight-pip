-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brokers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "short_description" TEXT,
    "logo" TEXT,
    "founded" INTEGER,
    "headquarters" TEXT,
    "website" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "type" TEXT,
    "category" TEXT,
    "target_audience" TEXT[],
    "regulated" BOOLEAN NOT NULL DEFAULT false,
    "regulation" JSONB,
    "safety_score" DOUBLE PRECISION DEFAULT 0.0,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "expert_rating" DOUBLE PRECISION DEFAULT 0.0,
    "min_deposit" DOUBLE PRECISION,
    "max_leverage" TEXT,
    "average_spreads" JSONB,
    "commissions" JSONB,
    "leverage_options" JSONB,
    "features" TEXT[],
    "platforms" TEXT[],
    "instruments" JSONB,
    "demo_account" BOOLEAN NOT NULL DEFAULT false,
    "islamic_account" BOOLEAN NOT NULL DEFAULT false,
    "deposit_methods" TEXT[],
    "withdrawal_methods" TEXT[],
    "withdrawal_fee" TEXT,
    "min_withdrawal" DOUBLE PRECISION,
    "support_languages" TEXT[],
    "support_availability" TEXT,
    "has_education" BOOLEAN NOT NULL DEFAULT false,
    "education_types" TEXT[],
    "trust_score" INTEGER DEFAULT 0,
    "awards" TEXT[],
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "years" INTEGER,
    "years_in_operation" INTEGER,
    "assets" TEXT,
    "promo" TEXT,
    "max_allocation" DOUBLE PRECISION,
    "payout" DOUBLE PRECISION,
    "bonus_offer" TEXT,
    "bonus" TEXT,
    "highlight" TEXT,
    "signup_link" TEXT,
    "account_size" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_reviewed" TIMESTAMP(3),

    CONSTRAINT "brokers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prop_firms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "short_description" TEXT,
    "logo" TEXT,
    "founded" INTEGER,
    "headquarters" TEXT,
    "website" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "type" TEXT,
    "category" TEXT,
    "regulated" BOOLEAN NOT NULL DEFAULT false,
    "regulation" TEXT,
    "safety_score" DOUBLE PRECISION DEFAULT 0.0,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "expert_rating" DOUBLE PRECISION DEFAULT 0.0,
    "leverage_options" JSONB,
    "average_spreads" JSONB,
    "commissions" JSONB,
    "platform_fees" DOUBLE PRECISION DEFAULT 0,
    "platforms" TEXT[],
    "trading_instruments" TEXT[],
    "features" TEXT[],
    "payout_frequency" TEXT,
    "payout_methods" TEXT[],
    "minimum_payout" DOUBLE PRECISION,
    "news_trading_restrictions" TEXT,
    "minimum_age" INTEGER,
    "supported_countries" TEXT[],
    "prohibited_countries" TEXT[],
    "has_education" BOOLEAN NOT NULL DEFAULT false,
    "education_resources" TEXT[],
    "community_features" TEXT[],
    "customer_support" TEXT[],
    "trustpilot_rating" DOUBLE PRECISION,
    "trustpilot_reviews" INTEGER,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "years" INTEGER,
    "years_in_operation" INTEGER,
    "assets" TEXT[],
    "promo" TEXT,
    "max_allocation" DOUBLE PRECISION,
    "signup_link" TEXT,
    "trading_conditions" DOUBLE PRECISION,
    "customer_care" DOUBLE PRECISION,
    "user_friendliness" DOUBLE PRECISION,
    "payout_process" DOUBLE PRECISION,
    "total_reviews" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_reviewed" TIMESTAMP(3),

    CONSTRAINT "prop_firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prop_firm_programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "time_limit" JSONB,
    "rules" JSONB,
    "profit_target" JSONB,
    "account_options" JSONB,
    "prop_firm_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prop_firm_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reviews" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "service_rating" DOUBLE PRECISION,
    "platform_rating" DOUBLE PRECISION,
    "value_rating" DOUBLE PRECISION,
    "support_rating" DOUBLE PRECISION,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "broker_id" INTEGER,
    "prop_firm_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "broker_id" INTEGER,
    "prop_firm_id" INTEGER,
    "notes" TEXT,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comparisons" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "items" JSONB NOT NULL,
    "criteria" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_account_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "min_deposit" DOUBLE PRECISION,
    "commission" TEXT,
    "spread_type" TEXT,
    "swap_free" BOOLEAN NOT NULL DEFAULT false,
    "broker_id" INTEGER NOT NULL,

    CONSTRAINT "broker_account_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_bonuses" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "conditions" TEXT,
    "expiry" TEXT,
    "code" TEXT,
    "broker_id" INTEGER NOT NULL,

    CONSTRAINT "broker_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_promotions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "valid_until" TIMESTAMP(3),
    "broker_id" INTEGER NOT NULL,

    CONSTRAINT "broker_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prop_firm_promotions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "valid_until" TIMESTAMP(3),
    "prop_firm_id" INTEGER NOT NULL,

    CONSTRAINT "prop_firm_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "brokers_name_key" ON "brokers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brokers_slug_key" ON "brokers"("slug");

-- CreateIndex
CREATE INDEX "brokers_rating_idx" ON "brokers"("rating");

-- CreateIndex
CREATE INDEX "brokers_min_deposit_idx" ON "brokers"("min_deposit");

-- CreateIndex
CREATE INDEX "brokers_regulated_idx" ON "brokers"("regulated");

-- CreateIndex
CREATE INDEX "brokers_country_idx" ON "brokers"("country");

-- CreateIndex
CREATE UNIQUE INDEX "prop_firms_name_key" ON "prop_firms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "prop_firms_slug_key" ON "prop_firms"("slug");

-- CreateIndex
CREATE INDEX "prop_firms_rating_idx" ON "prop_firms"("rating");

-- CreateIndex
CREATE INDEX "prop_firms_payout_frequency_idx" ON "prop_firms"("payout_frequency");

-- CreateIndex
CREATE INDEX "prop_firms_country_idx" ON "prop_firms"("country");

-- CreateIndex
CREATE INDEX "prop_firms_regulated_idx" ON "prop_firms"("regulated");

-- CreateIndex
CREATE INDEX "user_reviews_rating_idx" ON "user_reviews"("rating");

-- CreateIndex
CREATE INDEX "user_reviews_created_at_idx" ON "user_reviews"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_reviews_user_id_broker_id_prop_firm_id_key" ON "user_reviews"("user_id", "broker_id", "prop_firm_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_broker_id_prop_firm_id_key" ON "favorites"("user_id", "broker_id", "prop_firm_id");

-- CreateIndex
CREATE INDEX "comparisons_user_id_idx" ON "comparisons"("user_id");

-- CreateIndex
CREATE INDEX "comparisons_is_public_idx" ON "comparisons"("is_public");

-- AddForeignKey
ALTER TABLE "prop_firm_programs" ADD CONSTRAINT "prop_firm_programs_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reviews" ADD CONSTRAINT "user_reviews_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_account_types" ADD CONSTRAINT "broker_account_types_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_bonuses" ADD CONSTRAINT "broker_bonuses_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_promotions" ADD CONSTRAINT "broker_promotions_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prop_firm_promotions" ADD CONSTRAINT "prop_firm_promotions_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
