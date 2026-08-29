-- CreateEnum
CREATE TYPE "CreditTerms" AS ENUM ('cod', 'prepaid', 'net-15', 'net-30', 'net-45', 'net-60');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN "creditTerms" "CreditTerms" NOT NULL DEFAULT 'net-30';
