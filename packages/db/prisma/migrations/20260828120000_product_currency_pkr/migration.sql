-- Default and existing catalog prices are Pakistani rupees.
ALTER TABLE "Product" ALTER COLUMN "currency" SET DEFAULT 'PKR';
UPDATE "Product" SET "currency" = 'PKR' WHERE "currency" = 'USD';
