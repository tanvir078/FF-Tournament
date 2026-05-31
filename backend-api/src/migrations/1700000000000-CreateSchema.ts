import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "name" varchar NOT NULL,
        "phone" varchar,
        "role" varchar NOT NULL DEFAULT 'PLAYER',
        "uid" varchar,
        "ign" varchar,
        "avatar" varchar,
        "isVerified" boolean NOT NULL DEFAULT false,
        "isBanned" boolean NOT NULL DEFAULT false,
        "banReason" varchar,
        "stats" json,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL UNIQUE,
        "tag" varchar,
        "logo" varchar,
        "captainId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "players" json,
        "stats" json,
        "walletBalance" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "tournaments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar NOT NULL,
        "description" text,
        "banner" varchar,
        "format" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'DRAFT',
        "currentStage" varchar NOT NULL DEFAULT 'QUALIFIER',
        "stages" json,
        "entryFee" decimal(10,2) NOT NULL DEFAULT 0,
        "isFree" boolean NOT NULL DEFAULT false,
        "prizePool" decimal(10,2) NOT NULL DEFAULT 0,
        "maxTeams" integer NOT NULL DEFAULT 0,
        "registeredTeams" integer NOT NULL DEFAULT 0,
        "prizeDistribution" json,
        "rules" json,
        "maps" json,
        "matchCount" integer NOT NULL DEFAULT 0,
        "registrationStart" timestamp,
        "registrationEnd" timestamp,
        "registrationDeadline" timestamp,
        "startDate" timestamp,
        "endDate" timestamp,
        "startTime" varchar,
        "paymentMethods" json,
        "roomDetails" json,
        "perKillReward" decimal(10,2) NOT NULL DEFAULT 0,
        "organizerId" uuid NOT NULL REFERENCES "users"("id"),
        "sponsors" json,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "matches" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tournamentId" uuid NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
        "matchNumber" integer NOT NULL,
        "stage" varchar NOT NULL,
        "roomId" varchar,
        "roomPassword" varchar,
        "map" varchar NOT NULL,
        "scheduledTime" timestamp NOT NULL,
        "status" varchar NOT NULL DEFAULT 'SCHEDULED',
        "slots" json,
        "results" json,
        "mvpTeamId" uuid REFERENCES "teams"("id"),
        "screenshots" json,
        "streamUrl" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid REFERENCES "users"("id") ON DELETE CASCADE,
        "teamId" uuid REFERENCES "teams"("id") ON DELETE CASCADE,
        "balance" decimal(10,2) NOT NULL DEFAULT 0,
        "totalDeposited" decimal(10,2) NOT NULL DEFAULT 0,
        "totalWithdrawn" decimal(10,2) NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "walletId" uuid NOT NULL REFERENCES "wallets"("id") ON DELETE CASCADE,
        "type" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'PENDING',
        "amount" decimal(10,2) NOT NULL,
        "description" varchar,
        "reference" varchar,
        "metadata" json,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "type" varchar NOT NULL,
        "title" varchar NOT NULL,
        "message" text NOT NULL,
        "data" json,
        "channel" varchar NOT NULL DEFAULT 'PUSH',
        "isRead" boolean NOT NULL DEFAULT false,
        "readAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "sponsors" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL UNIQUE,
        "logo" varchar,
        "website" varchar,
        "description" text,
        "socialLinks" json,
        "isActive" boolean NOT NULL DEFAULT false,
        "packages" json,
        "sponsoredTournaments" json,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "withdraw_requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "amount" decimal(10,2) NOT NULL,
        "method" varchar NOT NULL,
        "accountNumber" varchar,
        "accountName" varchar,
        "bankName" varchar,
        "mobileNumber" varchar,
        "transactionId" varchar,
        "status" varchar NOT NULL DEFAULT 'PENDING',
        "rejectionReason" varchar,
        "adminNote" varchar,
        "processedAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "banners" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar NOT NULL,
        "description" varchar,
        "imageUrl" varchar NOT NULL,
        "linkUrl" varchar,
        "isActive" boolean NOT NULL DEFAULT false,
        "order" integer NOT NULL DEFAULT 0,
        "startDate" timestamp,
        "endDate" timestamp,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "notices" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar NOT NULL,
        "content" text NOT NULL,
        "type" varchar NOT NULL DEFAULT 'GENERAL',
        "isActive" boolean NOT NULL DEFAULT true,
        "isPinned" boolean NOT NULL DEFAULT false,
        "startDate" timestamp,
        "endDate" timestamp,
        "showOnDashboard" boolean NOT NULL DEFAULT false,
        "showOnTournaments" boolean NOT NULL DEFAULT false,
        "showOnWallet" boolean NOT NULL DEFAULT false,
        "targetRoles" json,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "tournament_registrations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tournamentId" uuid NOT NULL REFERENCES "tournaments"("id") ON DELETE CASCADE,
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "status" varchar NOT NULL DEFAULT 'APPROVED',
        "transactionId" varchar,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        UNIQUE ("tournamentId", "userId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "tournament_registrations"');
    await queryRunner.query('DROP TABLE IF EXISTS "notices"');
    await queryRunner.query('DROP TABLE IF EXISTS "banners"');
    await queryRunner.query('DROP TABLE IF EXISTS "withdraw_requests"');
    await queryRunner.query('DROP TABLE IF EXISTS "sponsors"');
    await queryRunner.query('DROP TABLE IF EXISTS "notifications"');
    await queryRunner.query('DROP TABLE IF EXISTS "transactions"');
    await queryRunner.query('DROP TABLE IF EXISTS "wallets"');
    await queryRunner.query('DROP TABLE IF EXISTS "matches"');
    await queryRunner.query('DROP TABLE IF EXISTS "tournaments"');
    await queryRunner.query('DROP TABLE IF EXISTS "teams"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}
