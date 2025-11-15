-- Make task_description nullable in sessions table
ALTER TABLE "sessions" ALTER COLUMN "task_description" DROP NOT NULL;
