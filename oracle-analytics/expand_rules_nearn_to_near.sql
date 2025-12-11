-- Expanded rules for NEARn into plain NEAR logic (Oracle 23ai syntax)
UPDATE rb_comment_rules SET rule_expr_raw = '"career" NEAR "growth" WITHIN 5 OR "promotion" NEAR "growth" WITHIN 5 OR "learning" NEAR "growth" WITHIN 5' WHERE id = 1;
UPDATE rb_comment_rules SET rule_expr_raw = '"internal transfer" NEAR "opportunity" WITHIN 4 OR "from_within" NEAR "opportunity" WITHIN 4 OR "lateral move" NEAR "opportunity" WITHIN 4 OR "IJP" NEAR "opportunity" WITHIN 4' WHERE id = 2;
UPDATE rb_comment_rules SET rule_expr_raw = '"client" NEAR "support" WITHIN 5 OR "customer" NEAR "support" WITHIN 5 OR "end user" NEAR "support" WITHIN 5' WHERE id = 3;
UPDATE rb_comment_rules SET rule_expr_raw = '"support" NEAR "helpful" WITHIN 3 OR "assistance" NEAR "helpful" WITHIN 3 OR "HR help" NEAR "helpful" WITHIN 3 OR "guidance" NEAR "helpful" WITHIN 3' WHERE id = 4;
UPDATE rb_comment_rules SET rule_expr_raw = '"team" NEAR "issues" WITHIN 2 OR "collaboration" NEAR "issues" WITHIN 2 OR "peers" NEAR "issues" WITHIN 2 OR "coworkers" NEAR "issues" WITHIN 2' WHERE id = 5;
UPDATE rb_comment_rules SET rule_expr_raw = '"onboarding" NEAR "orientation" WITHIN 3 OR "orientation" NEAR "orientation" WITHIN 3 OR "welcome process" NEAR "orientation" WITHIN 3' WHERE id = 6;
