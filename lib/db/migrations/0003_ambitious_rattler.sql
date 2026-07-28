CREATE INDEX "enrollments_user_course_idx" ON "enrollments" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "otps_email_purpose_idx" ON "otps" USING btree ("email","purpose");--> statement-breakpoint
CREATE INDEX "otps_code_idx" ON "otps" USING btree ("code");--> statement-breakpoint
CREATE INDEX "questions_course_idx" ON "questions" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "quiz_attempts_quiz_user_idx" ON "quiz_attempts" USING btree ("quiz_id","user_id");