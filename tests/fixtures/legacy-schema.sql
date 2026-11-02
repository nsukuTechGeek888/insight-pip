-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('WITHDRAWAL_PAID', 'WITHDRAWAL_DELAY', 'WITHDRAWAL_REJECTED', 'SLIPPAGE_ISSUES', 'SPREAD_SPIKE', 'EXECUTION_DELAY', 'TRADE_MANIPULATION_SUSPECTED', 'PLATFORM_FREEZE', 'SERVER_DOWN', 'LOGIN_ISSUES', 'ORDER_EXECUTION_FAILURE', 'ACCOUNT_SUSPENDED', 'ACCOUNT_BANNED', 'WITHDRAWAL_DENIED_AFTER_PROFIT', 'RULE_VIOLATION_DISPUTE', 'SUSPICIOUS_BROKER_ACTIVITY', 'SCAM_WARNING', 'OTHER');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('PENDING', 'RESOLVED', 'CONFIRMED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "TraderExperience" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "TradingStyle" AS ENUM ('SCALPER', 'DAY_TRADER', 'SWING_TRADER', 'EA_TRADER', 'NEWS_TRADER');

-- CreateEnum
CREATE TYPE "ReplyType" AS ENUM ('USER', 'BROKER', 'PROP_FIRM', 'ADMIN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "avg_overall_rating" DOUBLE PRECISION DEFAULT 0.0,
    "avg_service_rating" DOUBLE PRECISION DEFAULT 0.0,
    "avg_platform_rating" DOUBLE PRECISION DEFAULT 0.0,
    "avg_value_rating" DOUBLE PRECISION DEFAULT 0.0,
    "avg_support_rating" DOUBLE PRECISION DEFAULT 0.0,
    "avg_withdrawal_experience" DOUBLE PRECISION DEFAULT 0.0,
    "avg_deposit_experience" DOUBLE PRECISION DEFAULT 0.0,
    "avg_customer_support" DOUBLE PRECISION DEFAULT 0.0,
    "avg_trading_experience" DOUBLE PRECISION DEFAULT 0.0,
    "avg_reliability" DOUBLE PRECISION DEFAULT 0.0,
    "avg_trust_score" DOUBLE PRECISION DEFAULT 0.0,
    "avg_withdrawal_success" DOUBLE PRECISION DEFAULT 0.0,
    "avg_execution_quality" DOUBLE PRECISION DEFAULT 0.0,
    "recommendation_rate" DOUBLE PRECISION DEFAULT 0.0,
    "withdrawal_stats" JSONB,
    "account_issue_stats" JSONB,
    "total_incidents" INTEGER NOT NULL DEFAULT 0,
    "incidents_last_7_days" INTEGER NOT NULL DEFAULT 0,
    "incidents_last_30_days" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_reports" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_delays" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_confirmed" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_rejected" INTEGER NOT NULL DEFAULT 0,
    "execution_complaints" INTEGER NOT NULL DEFAULT 0,
    "slippage_reports" INTEGER NOT NULL DEFAULT 0,
    "spread_spike_reports" INTEGER NOT NULL DEFAULT 0,
    "platform_issues" INTEGER NOT NULL DEFAULT 0,
    "server_down_reports" INTEGER NOT NULL DEFAULT 0,
    "account_bans_reported" INTEGER NOT NULL DEFAULT 0,
    "account_suspensions" INTEGER NOT NULL DEFAULT 0,
    "resolved_incidents" INTEGER NOT NULL DEFAULT 0,
    "disputed_incidents" INTEGER NOT NULL DEFAULT 0,
    "last_incident_at" TIMESTAMP(3),
    "incident_trends" JSONB,
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
    "corporate_address" TEXT,
    "account_currencies" TEXT[],
    "regulatory_warnings" TEXT[],
    "entity_mapping" JSONB,
    "min_trade_size" TEXT,
    "max_trade_size" TEXT,
    "margin_call" TEXT,
    "stop_out_level" TEXT,
    "order_execution" TEXT,
    "trading_hours" TEXT,
    "swap_rates" TEXT,
    "commission_notes" TEXT,
    "charting_tools" TEXT[],
    "copy_trading_available" BOOLEAN NOT NULL DEFAULT false,
    "social_trading_available" BOOLEAN NOT NULL DEFAULT false,
    "vps_available" BOOLEAN NOT NULL DEFAULT false,
    "api_available" BOOLEAN NOT NULL DEFAULT false,
    "economic_calendar" BOOLEAN NOT NULL DEFAULT false,
    "news_trading" BOOLEAN NOT NULL DEFAULT false,
    "deposit_methods_details" JSONB,
    "withdrawal_methods_details" JSONB,
    "withdrawal_processing_time" TEXT,
    "deposit_processing_time" TEXT,
    "inactivity_fee" TEXT,
    "account_closure_policy" TEXT,
    "partnership_programs" TEXT[],
    "ib_program_available" BOOLEAN NOT NULL DEFAULT false,
    "affiliate_program_available" BOOLEAN NOT NULL DEFAULT false,
    "security_features" TEXT[],
    "account_verification" TEXT,
    "two_factor_auth" BOOLEAN NOT NULL DEFAULT false,
    "social_media" JSONB,
    "press_releases" JSONB,
    "max_daily_loss" DOUBLE PRECISION,
    "max_loss_per_trade" DOUBLE PRECISION,
    "profit_target" TEXT,
    "consistency_rule" TEXT,
    "scaling_plan" JSONB,
    "news_trading_restrictions" TEXT,
    "weekend_holding" BOOLEAN NOT NULL DEFAULT true,
    "ea_trading" BOOLEAN NOT NULL DEFAULT true,
    "hedging_allowed" BOOLEAN NOT NULL DEFAULT true,
    "martingale_allowed" BOOLEAN NOT NULL DEFAULT true,
    "hft_allowed" BOOLEAN NOT NULL DEFAULT true,
    "copy_trading_rules" TEXT,
    "max_daily_profit" DOUBLE PRECISION,
    "first_payout_split" INTEGER,
    "second_payout_split" INTEGER,
    "third_payout_split" INTEGER,
    "max_withdrawable_profit" DOUBLE PRECISION,
    "goat_guard" BOOLEAN NOT NULL DEFAULT false,
    "activation_fee" JSONB,
    "monthly_searches" INTEGER,
    "monthly_traffic" INTEGER,
    "claimed_payouts" TEXT,
    "traders_served" INTEGER,
    "countries_served" INTEGER,
    "founded_month" TEXT,
    "additional_office" TEXT,
    "legal_name" TEXT,
    "company_number" TEXT,
    "ceo" TEXT,
    "regions" TEXT[] DEFAULT ARRAY['GLOBAL']::TEXT[],
    "restrictedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region_notes" JSONB,
    "region_descriptions" JSONB,
    "region_pricing" JSONB,
    "region_payment_methods" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "ceo" TEXT,
    "ceo_bio" TEXT,
    "leadership_team" JSONB,
    "legal_name" TEXT,
    "company_number" TEXT,
    "corporate_address" TEXT,
    "additional_office" TEXT,
    "registration_number" TEXT,
    "registration_country" TEXT,
    "entity_mapping" JSONB,
    "founded_month" TEXT,
    "previous_headquarters" TEXT,
    "migration_status" TEXT,
    "regulated" BOOLEAN NOT NULL DEFAULT false,
    "regulation" TEXT,
    "regulatory_bodies" TEXT[],
    "regulatory_warnings" TEXT[],
    "safety_score" DOUBLE PRECISION DEFAULT 0.0,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "expert_rating" DOUBLE PRECISION DEFAULT 0.0,
    "avg_trust_score" DOUBLE PRECISION DEFAULT 0.0,
    "recommendation_rate" DOUBLE PRECISION DEFAULT 0.0,
    "is_recommended" BOOLEAN NOT NULL DEFAULT false,
    "avg_overall_rating" DOUBLE PRECISION DEFAULT 0.0,
    "avg_trading_conditions" DOUBLE PRECISION DEFAULT 0.0,
    "avg_customer_care" DOUBLE PRECISION DEFAULT 0.0,
    "avg_user_friendliness" DOUBLE PRECISION DEFAULT 0.0,
    "avg_payout_process" DOUBLE PRECISION DEFAULT 0.0,
    "avg_reliability" DOUBLE PRECISION DEFAULT 0.0,
    "avg_execution_quality" DOUBLE PRECISION DEFAULT 0.0,
    "trustpilot_rating" DOUBLE PRECISION,
    "trustpilot_reviews" INTEGER,
    "trustpilot_url" TEXT,
    "forex_peace_army_rating" DOUBLE PRECISION,
    "other_review_sites" JSONB,
    "positive_review_themes" TEXT[],
    "negative_review_themes" TEXT[],
    "support_agents" TEXT[],
    "known_issues" JSONB,
    "system_bugs" TEXT[],
    "payout_delays_reported" BOOLEAN NOT NULL DEFAULT false,
    "slippage_reported" BOOLEAN NOT NULL DEFAULT false,
    "hidden_rules_reported" BOOLEAN NOT NULL DEFAULT false,
    "retroactive_rule_changes" BOOLEAN NOT NULL DEFAULT false,
    "withdrawal_denials" BOOLEAN NOT NULL DEFAULT false,
    "public_warnings" JSONB,
    "warning_dates" TIMESTAMP(3)[],
    "total_payouts_paid" TEXT,
    "total_payouts_currency" TEXT,
    "total_payouts_verified" BOOLEAN NOT NULL DEFAULT false,
    "payout_verification_source" TEXT,
    "total_traders_served" INTEGER,
    "monthly_trading_volume" TEXT,
    "daily_trade_count" INTEGER,
    "risk_level" TEXT,
    "risk_score" INTEGER,
    "risk_factors" TEXT[],
    "recommendation" TEXT,
    "red_flags" TEXT[],
    "green_flags" TEXT[],
    "max_account_size" INTEGER,
    "max_account_size_currency" TEXT,
    "min_account_size" INTEGER,
    "account_currencies" TEXT[],
    "max_allocation" DOUBLE PRECISION,
    "min_deposit" DOUBLE PRECISION,
    "one_step_available" BOOLEAN NOT NULL DEFAULT false,
    "one_step_profit_target" INTEGER,
    "one_step_max_drawdown" INTEGER,
    "one_step_daily_drawdown" INTEGER,
    "one_step_min_days" INTEGER,
    "one_step_max_loss_per_trade" INTEGER,
    "one_step_consistency" INTEGER,
    "two_step_available" BOOLEAN NOT NULL DEFAULT false,
    "two_step_profit_target_1" INTEGER,
    "two_step_profit_target_2" INTEGER,
    "two_step_max_drawdown" INTEGER,
    "two_step_daily_drawdown" INTEGER,
    "two_step_min_days_1" INTEGER,
    "two_step_min_days_2" INTEGER,
    "two_step_max_loss_per_trade" INTEGER,
    "two_step_consistency" INTEGER,
    "instant_funding_available" BOOLEAN NOT NULL DEFAULT false,
    "if_max_drawdown" INTEGER,
    "if_daily_drawdown" INTEGER,
    "if_min_trading_days" INTEGER,
    "if_max_loss_per_trade" INTEGER,
    "if_consistency_rule" INTEGER,
    "if_profit_split" INTEGER,
    "if_reward_cycle" TEXT,
    "if_time_limit" JSONB,
    "pay_later_available" BOOLEAN NOT NULL DEFAULT false,
    "pay_later_initial_fee" INTEGER,
    "pay_later_activation_fee" INTEGER,
    "pay_later_profit_target" INTEGER,
    "pay_later_max_drawdown" INTEGER,
    "pay_later_max_loss_per_trade" INTEGER,
    "pay_later_consistency" INTEGER,
    "pay_later_max_accounts" INTEGER,
    "pay_later_country_cap" INTEGER,
    "pay_later_account_sizes" TEXT[],
    "news_trading" BOOLEAN NOT NULL DEFAULT false,
    "news_trading_window" TEXT,
    "news_profit_cap" INTEGER,
    "news_trading_restrictions" TEXT,
    "profit_caps" JSONB,
    "short_trade_min_duration" INTEGER,
    "prohibited_strategies" TEXT[],
    "hedging_allowed" BOOLEAN NOT NULL DEFAULT true,
    "martingale_allowed" BOOLEAN NOT NULL DEFAULT true,
    "copy_trading_allowed" BOOLEAN NOT NULL DEFAULT true,
    "copy_trading_rules" TEXT,
    "ea_trading" BOOLEAN NOT NULL DEFAULT true,
    "hft_allowed" BOOLEAN NOT NULL DEFAULT true,
    "weekend_holding" BOOLEAN NOT NULL DEFAULT true,
    "consistency_rule" TEXT,
    "scaling_plan" JSONB,
    "scaling_level1_months" INTEGER,
    "scaling_level1_payouts" INTEGER,
    "scaling_level1_boost" INTEGER,
    "scaling_level1_split" INTEGER,
    "scaling_level1_drawdown" INTEGER,
    "scaling_level1_benefits" TEXT[],
    "scaling_level2_months" INTEGER,
    "scaling_level2_payouts" INTEGER,
    "scaling_level2_boost" INTEGER,
    "scaling_level2_split" INTEGER,
    "scaling_level2_drawdown" INTEGER,
    "scaling_level2_weekly_payouts" BOOLEAN NOT NULL DEFAULT false,
    "scaling_level2_benefits" TEXT[],
    "scaling_level3_months" INTEGER,
    "scaling_level3_payouts" INTEGER,
    "scaling_level3_boost" INTEGER,
    "scaling_level3_split" INTEGER,
    "scaling_level3_drawdown" INTEGER,
    "scaling_level3_monthly_salary" INTEGER,
    "scaling_level3_free_challenge" BOOLEAN NOT NULL DEFAULT false,
    "scaling_level3_benefits" TEXT[],
    "scaling_level4_months" INTEGER,
    "scaling_level4_payouts" INTEGER,
    "scaling_level4_boost" INTEGER,
    "scaling_level4_split" INTEGER,
    "scaling_level4_drawdown" INTEGER,
    "scaling_level4_monthly_salary" INTEGER,
    "scaling_level4_free_challenge" BOOLEAN NOT NULL DEFAULT false,
    "scaling_level4_benefits" TEXT[],
    "scaling_level_max" INTEGER,
    "bogo_available" BOOLEAN NOT NULL DEFAULT false,
    "bogo_discount" INTEGER,
    "bogo_free_accounts" INTEGER,
    "bogo_free_account_timing" TEXT,
    "affiliate_discount_code" TEXT,
    "affiliate_discount_percent" INTEGER,
    "discount_codes" JSONB,
    "leverage_options" JSONB,
    "max_leverage" TEXT,
    "average_spreads" JSONB,
    "commissions" JSONB,
    "platform_fees" DOUBLE PRECISION DEFAULT 0,
    "min_trade_size" TEXT,
    "max_trade_size" TEXT,
    "margin_call" TEXT,
    "stop_out_level" TEXT,
    "order_execution" TEXT,
    "trading_hours" TEXT,
    "swap_rates" TEXT,
    "commission_notes" TEXT,
    "platforms" TEXT[],
    "trading_instruments" TEXT[],
    "features" TEXT[],
    "charting_tools" TEXT[],
    "copy_trading_available" BOOLEAN NOT NULL DEFAULT false,
    "social_trading_available" BOOLEAN NOT NULL DEFAULT false,
    "vps_available" BOOLEAN NOT NULL DEFAULT false,
    "api_available" BOOLEAN NOT NULL DEFAULT false,
    "economic_calendar" BOOLEAN NOT NULL DEFAULT false,
    "payout_frequency" TEXT,
    "payout_methods" TEXT[],
    "minimum_payout" INTEGER,
    "payout_processing_time" TEXT,
    "supported_countries" TEXT[],
    "prohibited_countries" TEXT[],
    "minimum_age" INTEGER,
    "restricted_features" TEXT[],
    "warnings" TEXT[],
    "customer_support" TEXT[],
    "has_education" BOOLEAN NOT NULL DEFAULT false,
    "education_resources" TEXT[],
    "community_features" TEXT[],
    "deposit_methods_details" JSONB,
    "withdrawal_methods_details" JSONB,
    "deposit_processing_time" TEXT,
    "withdrawal_processing_time" TEXT,
    "inactivity_fee" TEXT,
    "account_closure_policy" TEXT,
    "partnership_programs" TEXT[],
    "ib_program_available" BOOLEAN NOT NULL DEFAULT false,
    "affiliate_program_available" BOOLEAN NOT NULL DEFAULT false,
    "security_features" TEXT[],
    "account_verification" TEXT,
    "two_factor_auth" BOOLEAN NOT NULL DEFAULT false,
    "goat_guard" BOOLEAN NOT NULL DEFAULT false,
    "social_media" JSONB,
    "press_releases" JSONB,
    "monthly_searches" INTEGER,
    "monthly_traffic" INTEGER,
    "claimed_payouts" TEXT,
    "traders_served" INTEGER,
    "countries_served" INTEGER,
    "country" TEXT,
    "years" INTEGER,
    "years_in_operation" INTEGER,
    "assets" TEXT[],
    "promo" TEXT,
    "signup_link" TEXT,
    "trading_conditions" DOUBLE PRECISION,
    "customer_care" DOUBLE PRECISION,
    "user_friendliness" DOUBLE PRECISION,
    "payout_process" DOUBLE PRECISION,
    "total_reviews" INTEGER,
    "total_incidents" INTEGER NOT NULL DEFAULT 0,
    "incidents_last_7_days" INTEGER NOT NULL DEFAULT 0,
    "incidents_last_30_days" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_reports" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_delays" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_confirmed" INTEGER NOT NULL DEFAULT 0,
    "withdrawal_rejected" INTEGER NOT NULL DEFAULT 0,
    "execution_complaints" INTEGER NOT NULL DEFAULT 0,
    "slippage_reports" INTEGER NOT NULL DEFAULT 0,
    "platform_issues" INTEGER NOT NULL DEFAULT 0,
    "server_down_reports" INTEGER NOT NULL DEFAULT 0,
    "account_bans_reported" INTEGER NOT NULL DEFAULT 0,
    "rule_violation_disputes" INTEGER NOT NULL DEFAULT 0,
    "resolved_incidents" INTEGER NOT NULL DEFAULT 0,
    "disputed_incidents" INTEGER NOT NULL DEFAULT 0,
    "last_incident_at" TIMESTAMP(3),
    "incident_trends" JSONB,
    "regions" TEXT[] DEFAULT ARRAY['GLOBAL']::TEXT[],
    "restrictedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region_notes" JSONB,
    "region_descriptions" JSONB,
    "region_pricing" JSONB,
    "region_payment_methods" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "account_options" JSONB,
    "prop_firm_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prop_firm_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prop_firm_promotions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount" TEXT,
    "code" TEXT,
    "valid_until" TIMESTAMP(3),
    "regions" TEXT[] DEFAULT ARRAY['GLOBAL']::TEXT[],
    "restrictedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prop_firm_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prop_firm_promotions_pkey" PRIMARY KEY ("id")
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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "regions" TEXT[] DEFAULT ARRAY['GLOBAL']::TEXT[],
    "restrictedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "broker_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broker_bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_promotions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount" TEXT,
    "code" TEXT,
    "valid_until" TIMESTAMP(3),
    "regions" TEXT[] DEFAULT ARRAY['GLOBAL']::TEXT[],
    "restrictedRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "broker_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "broker_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "pros" TEXT,
    "cons" TEXT,
    "experience_level" TEXT,
    "years_trading" TEXT,
    "trading_style" TEXT,
    "trading_environment" TEXT,
    "platform_stability" INTEGER,
    "execution_quality" INTEGER,
    "withdrawal_experience" INTEGER,
    "deposit_experience" INTEGER,
    "customer_support" INTEGER,
    "reliability" INTEGER,
    "value" INTEGER,
    "withdrawal_speed" TEXT,
    "account_issues" TEXT,
    "would_recommend" TEXT,
    "trust_score" INTEGER,
    "proof_files" JSONB,
    "service_rating" INTEGER,
    "platform_rating" INTEGER,
    "value_rating" INTEGER,
    "support_rating" INTEGER,
    "withdrawal_experience_legacy" INTEGER,
    "deposit_experience_legacy" INTEGER,
    "customer_support_legacy" INTEGER,
    "trading_experience_legacy" INTEGER,
    "reliability_legacy" INTEGER,
    "trading_conditions" INTEGER,
    "customer_care" INTEGER,
    "user_friendliness" INTEGER,
    "payout_process" INTEGER,
    "trading_experience_level" TEXT,
    "years_trading_legacy" INTEGER,
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
    "retracted_at" TIMESTAMP(3),
    "retraction_reason" TEXT,
    "edited_at" TIMESTAMP(3),
    "edited_within_window" BOOLEAN NOT NULL DEFAULT false,
    "trust_score_snapshot" INTEGER,
    "original_content" TEXT,
    "edit_history" JSONB,
    "region" TEXT,
    "user_id" TEXT NOT NULL,
    "broker_id" INTEGER,
    "prop_firm_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_replies" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "media_urls" TEXT[],
    "reply_type" "ReplyType" NOT NULL DEFAULT 'USER',
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "region" TEXT,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT,
    "broker_id" INTEGER,
    "prop_firm_id" INTEGER,
    "parent_reply_id" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "moderated_by" TEXT,
    "moderated_at" TIMESTAMP(3),
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "incident_type" "IncidentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incident_date" TIMESTAMP(3) NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawal_amount" DOUBLE PRECISION,
    "withdrawal_method" TEXT,
    "resolution_status" "ResolutionStatus" NOT NULL DEFAULT 'PENDING',
    "user_id" TEXT NOT NULL,
    "user_experience" "TraderExperience",
    "user_trading_style" "TradingStyle",
    "proof_urls" TEXT[],
    "proof_verified" BOOLEAN NOT NULL DEFAULT false,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "disputes" INTEGER NOT NULL DEFAULT 0,
    "verified_badge" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "moderated_by" TEXT,
    "moderated_at" TIMESTAMP(3),
    "moderation_note" TEXT,
    "follow_ups" JSONB,
    "audit_log" JSONB,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "region" TEXT,
    "broker_id" INTEGER,
    "prop_firm_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "helpful_votes" (
    "id" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_reports_pkey" PRIMARY KEY ("id")
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "imageUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "brokers_avg_trust_score_idx" ON "brokers"("avg_trust_score");

-- CreateIndex
CREATE INDEX "brokers_total_incidents_idx" ON "brokers"("total_incidents");

-- CreateIndex
CREATE INDEX "brokers_regions_idx" ON "brokers"("regions");

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
CREATE INDEX "prop_firms_avg_trust_score_idx" ON "prop_firms"("avg_trust_score");

-- CreateIndex
CREATE INDEX "prop_firms_total_incidents_idx" ON "prop_firms"("total_incidents");

-- CreateIndex
CREATE INDEX "prop_firms_trustpilot_rating_idx" ON "prop_firms"("trustpilot_rating");

-- CreateIndex
CREATE INDEX "prop_firms_max_account_size_idx" ON "prop_firms"("max_account_size");

-- CreateIndex
CREATE INDEX "prop_firms_regions_idx" ON "prop_firms"("regions");

-- CreateIndex
CREATE INDEX "prop_firm_promotions_regions_idx" ON "prop_firm_promotions"("regions");

-- CreateIndex
CREATE INDEX "broker_bonuses_regions_idx" ON "broker_bonuses"("regions");

-- CreateIndex
CREATE INDEX "broker_promotions_regions_idx" ON "broker_promotions"("regions");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "reviews_trust_score_idx" ON "reviews"("trust_score");

-- CreateIndex
CREATE INDEX "reviews_broker_id_status_idx" ON "reviews"("broker_id", "status");

-- CreateIndex
CREATE INDEX "reviews_prop_firm_id_status_idx" ON "reviews"("prop_firm_id", "status");

-- CreateIndex
CREATE INDEX "reviews_region_idx" ON "reviews"("region");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_broker_id_key" ON "reviews"("user_id", "broker_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_prop_firm_id_key" ON "reviews"("user_id", "prop_firm_id");

-- CreateIndex
CREATE INDEX "review_replies_review_id_idx" ON "review_replies"("review_id");

-- CreateIndex
CREATE INDEX "review_replies_user_id_idx" ON "review_replies"("user_id");

-- CreateIndex
CREATE INDEX "review_replies_broker_id_idx" ON "review_replies"("broker_id");

-- CreateIndex
CREATE INDEX "review_replies_prop_firm_id_idx" ON "review_replies"("prop_firm_id");

-- CreateIndex
CREATE INDEX "review_replies_parent_reply_id_idx" ON "review_replies"("parent_reply_id");

-- CreateIndex
CREATE INDEX "review_replies_reply_type_idx" ON "review_replies"("reply_type");

-- CreateIndex
CREATE INDEX "review_replies_created_at_idx" ON "review_replies"("created_at");

-- CreateIndex
CREATE INDEX "review_replies_region_idx" ON "review_replies"("region");

-- CreateIndex
CREATE INDEX "incidents_entity_type_entity_id_idx" ON "incidents"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "incidents_incident_type_idx" ON "incidents"("incident_type");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_created_at_idx" ON "incidents"("created_at");

-- CreateIndex
CREATE INDEX "incidents_report_date_idx" ON "incidents"("report_date");

-- CreateIndex
CREATE INDEX "incidents_resolution_status_idx" ON "incidents"("resolution_status");

-- CreateIndex
CREATE INDEX "incidents_withdrawal_amount_idx" ON "incidents"("withdrawal_amount");

-- CreateIndex
CREATE INDEX "incidents_visibility_idx" ON "incidents"("visibility");

-- CreateIndex
CREATE INDEX "incidents_region_idx" ON "incidents"("region");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_user_id_broker_id_prop_firm_id_key" ON "incidents"("user_id", "broker_id", "prop_firm_id");

-- CreateIndex
CREATE UNIQUE INDEX "helpful_votes_review_id_user_id_key" ON "helpful_votes"("review_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_reports_review_id_user_id_key" ON "review_reports"("review_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_broker_id_prop_firm_id_key" ON "favorites"("user_id", "broker_id", "prop_firm_id");

-- CreateIndex
CREATE INDEX "comparisons_user_id_idx" ON "comparisons"("user_id");

-- CreateIndex
CREATE INDEX "comparisons_is_public_idx" ON "comparisons"("is_public");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_slug_idx" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_category_idx" ON "blog_posts"("category");

-- CreateIndex
CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts"("created_at");

-- AddForeignKey
ALTER TABLE "prop_firm_programs" ADD CONSTRAINT "prop_firm_programs_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prop_firm_promotions" ADD CONSTRAINT "prop_firm_promotions_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_account_types" ADD CONSTRAINT "broker_account_types_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_bonuses" ADD CONSTRAINT "broker_bonuses_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_promotions" ADD CONSTRAINT "broker_promotions_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_parent_reply_id_fkey" FOREIGN KEY ("parent_reply_id") REFERENCES "review_replies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "helpful_votes" ADD CONSTRAINT "helpful_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "helpful_votes" ADD CONSTRAINT "helpful_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "brokers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

