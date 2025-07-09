#!/bin/bash

# Deduplicated batch: lines 101-200 from bulk_insert_matched_comments.sh

curl -X POST "localhost:9200/matched_comments/_bulk" -H 'Content-Type: application/x-ndjson' -d '
{"rule_id":"client_2","comment_text":"The client needs more support with implementation.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","support"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs more <mark>support</mark> with implementation.","timestamp":"2024-03-20T10:44:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help desk is always available.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> desk is always available.","timestamp":"2024-03-20T10:45:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Team collaboration leads to better results.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.85,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Team</mark> <mark>collaboration</mark> leads to better results.","timestamp":"2024-03-20T10:46:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"My team helped me understand the new process.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.9,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"My <mark>team</mark> <mark>helped</mark> me understand the new process.","timestamp":"2024-03-20T10:47:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Collaboration tools make work more efficient.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Collaboration</mark> tools make <mark>work</mark> more efficient.","timestamp":"2024-03-20T10:48:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Career opportunities in the sales department are promising.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Career</mark> <mark>opportunities</mark> in the sales department are promising.","timestamp":"2024-03-20T10:49:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Education programs support career growth effectively.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.85,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Education</mark> programs support <mark>career</mark> growth effectively.","timestamp":"2024-03-20T10:50:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"I deserve a promotion after three years of service.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.95,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"I deserve a <mark>promotion</mark> after three years of service.","timestamp":"2024-03-20T10:51:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career progression is frustrating.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> progression is frustrating.","timestamp":"2024-03-20T10:52:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Technical skill development is crucial for advancement.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Technical <mark>skill</mark> <mark>development</mark> is crucial for advancement.","timestamp":"2024-03-20T10:53:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support response time needs improvement.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> response time needs improvement.","timestamp":"2024-03-20T10:54:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client requires immediate help with the issue.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> requires immediate <mark>help</mark> with the issue.","timestamp":"2024-03-20T10:55:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer assistance program is well organized.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>assistance</mark> program is well organized.","timestamp":"2024-03-20T10:56:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Cross-functional team collaboration is essential.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.9,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Cross-functional <mark>team</mark> <mark>collaboration</mark> is essential.","timestamp":"2024-03-20T10:57:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"The team helped me learn new processes.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.85,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"The <mark>team</mark> <mark>helped</mark> me learn new processes.","timestamp":"2024-03-20T10:58:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Inter-departmental collaboration improves work quality.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Inter-departmental <mark>collaboration</mark> improves <mark>work</mark> quality.","timestamp":"2024-03-20T10:59:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"International career opportunities are very attractive.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"International <mark>career</mark> <mark>opportunities</mark> are very attractive.","timestamp":"2024-03-20T11:00:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Knowledge sharing enhances career development.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.85,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Knowledge</mark> sharing enhances <mark>career</mark> development.","timestamp":"2024-03-20T11:01:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion criteria should be clearly defined.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> criteria should be clearly defined.","timestamp":"2024-03-20T11:02:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career guidance is concerning.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> guidance is concerning.","timestamp":"2024-03-20T11:03:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Leadership skill development is important.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Leadership <mark>skill</mark> <mark>development</mark> is important.","timestamp":"2024-03-20T11:04:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support documentation is comprehensive.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> documentation is comprehensive.","timestamp":"2024-03-20T11:05:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs ongoing help with maintenance.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.85,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs ongoing <mark>help</mark> with maintenance.","timestamp":"2024-03-20T11:06:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help resources are easily accessible.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> resources are easily accessible.","timestamp":"2024-03-20T11:07:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Virtual team collaboration works well remotely.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.85,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Virtual <mark>team</mark> <mark>collaboration</mark> works well remotely.","timestamp":"2024-03-20T11:08:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"My team helped me overcome challenges.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.9,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"My <mark>team</mark> <mark>helped</mark> me overcome challenges.","timestamp":"2024-03-20T11:09:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Strategic collaboration enhances work outcomes.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Strategic <mark>collaboration</mark> enhances <mark>work</mark> outcomes.","timestamp":"2024-03-20T11:10:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Remote career opportunities are becoming more common.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"Remote <mark>career</mark> <mark>opportunities</mark> are becoming more common.","timestamp":"2024-03-20T11:11:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Continuous learning drives career success.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"Continuous <mark>learning</mark> drives <mark>career</mark> success.","timestamp":"2024-03-20T11:12:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion timeline should be communicated clearly.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> timeline should be communicated clearly.","timestamp":"2024-03-20T11:13:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career advancement is demoralizing.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.95,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> advancement is demoralizing.","timestamp":"2024-03-20T11:14:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Soft skill development is often overlooked.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.85,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Soft <mark>skill</mark> <mark>development</mark> is often overlooked.","timestamp":"2024-03-20T11:15:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support quality varies by region.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.8,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> quality varies by region.","timestamp":"2024-03-20T11:16:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs urgent help with deployment.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.9,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs urgent <mark>help</mark> with deployment.","timestamp":"2024-03-20T11:17:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help portal is user-friendly.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.85,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> portal is user-friendly.","timestamp":"2024-03-20T11:18:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Agile team collaboration improves productivity.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.9,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Agile <mark>team</mark> <mark>collaboration</mark> improves productivity.","timestamp":"2024-03-20T11:19:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"The team helped me adapt to changes.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.85,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"The <mark>team</mark> <mark>helped</mark> me adapt to changes.","timestamp":"2024-03-20T11:20:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Cross-team collaboration streamlines work processes.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Cross-team <mark>collaboration</mark> streamlines <mark>work</mark> processes.","timestamp":"2024-03-20T11:21:00Z"}
{"index":{}}
{"rule_id":"career_1","comment_text":"Career opportunities in emerging technologies are exciting.","topic":"Career Development","description":"bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS","score":0.9,"matched_terms":["bacghr_career","bacghr_opportunity"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Career</mark> <mark>opportunities</mark> in emerging technologies are exciting.","timestamp":"2024-03-20T11:22:00Z"}
{"index":{}}
{"rule_id":"career_2","comment_text":"Professional learning accelerates career growth.","topic":"Career Development","description":"bacghr_learning NEAR bacghr_career WITHIN 3 WORDS","score":0.85,"matched_terms":["bacghr_learning","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"Professional <mark>learning</mark> accelerates <mark>career</mark> growth.","timestamp":"2024-03-20T11:23:00Z"}
{"index":{}}
{"rule_id":"career_3","comment_text":"Promotion feedback should be constructive.","topic":"Career Development","description":"promotion NEAR career WITHIN 4 WORDS","score":0.8,"matched_terms":["promotion","career"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Promotion</mark> feedback should be constructive.","timestamp":"2024-03-20T11:24:00Z"}
{"index":{}}
{"rule_id":"career_4","comment_text":"Lack of career recognition is disappointing.","topic":"Career Development","description":"lack NEAR bacghr_career WITHIN 3 WORDS","score":0.9,"matched_terms":["lack","bacghr_career"],"max_gaps":3,"ordered":false,"highlighted_text":"<mark>Lack</mark> of <mark>career</mark> recognition is disappointing.","timestamp":"2024-03-20T11:25:00Z"}
{"index":{}}
{"rule_id":"career_5","comment_text":"Communication skill development is essential.","topic":"Career Development","description":"skill NEAR development WITHIN 3 WORDS","score":0.9,"matched_terms":["skill","development"],"max_gaps":3,"ordered":false,"highlighted_text":"Communication <mark>skill</mark> <mark>development</mark> is essential.","timestamp":"2024-03-20T11:26:00Z"}
{"index":{}}
{"rule_id":"client_1","comment_text":"Client support training is comprehensive.","topic":"Client Support","description":"bacghr_client NEAR bacghr_support WITHIN 5 WORDS","score":0.85,"matched_terms":["bacghr_client","bacghr_support"],"max_gaps":5,"ordered":false,"highlighted_text":"<mark>Client</mark> <mark>support</mark> training is comprehensive.","timestamp":"2024-03-20T11:27:00Z"}
{"index":{}}
{"rule_id":"client_2","comment_text":"The client needs technical help with integration.","topic":"Client Support","description":"client NEAR support WITHIN 5 WORDS","score":0.85,"matched_terms":["client","help"],"max_gaps":5,"ordered":false,"highlighted_text":"The <mark>client</mark> needs technical <mark>help</mark> with integration.","timestamp":"2024-03-20T11:28:00Z"}
{"index":{}}
{"rule_id":"client_3","comment_text":"Customer help system is well-designed.","topic":"Client Support","description":"customer NEAR help WITHIN 4 WORDS","score":0.8,"matched_terms":["customer","help"],"max_gaps":4,"ordered":false,"highlighted_text":"<mark>Customer</mark> <mark>help</mark> system is well-designed.","timestamp":"2024-03-20T11:29:00Z"}
{"index":{}}
{"rule_id":"team_1","comment_text":"Diverse team collaboration brings innovation.","topic":"Team Collaboration","description":"team NEAR collaboration WITHIN 4 WORDS","score":0.85,"matched_terms":["team","collaboration"],"max_gaps":4,"ordered":false,"highlighted_text":"Diverse <mark>team</mark> <mark>collaboration</mark> brings innovation.","timestamp":"2024-03-20T11:30:00Z"}
{"index":{}}
{"rule_id":"team_2","comment_text":"My team helped me develop new skills.","topic":"Team Collaboration","description":"team NEAR help WITHIN 3 WORDS","score":0.9,"matched_terms":["team","help"],"max_gaps":3,"ordered":false,"highlighted_text":"My <mark>team</mark> <mark>helped</mark> me develop new skills.","timestamp":"2024-03-20T11:31:00Z"}
{"index":{}}
{"rule_id":"team_3","comment_text":"Effective collaboration optimizes work efficiency.","topic":"Team Collaboration","description":"collaboration NEAR work WITHIN 4 WORDS","score":0.85,"matched_terms":["collaboration","work"],"max_gaps":4,"ordered":false,"highlighted_text":"Effective <mark>collaboration</mark> optimizes <mark>work</mark> efficiency.","timestamp":"2024-03-20T11:32:00Z"}
{"index":{}}
{"rule_id":"career_6","comment_text":"Advancement opportunities and potential for growth are important to me.","topic":"Career Development","description":"bacghr_advancement NEAR bacghr_opportunity WITHIN 4 WORDS","score":0.8,"matched_terms":["bacghr_advancement","bacghr_opportunity"],"max_gaps":4,"ordered":false,"highlighted_text":"Advancement <mark>opportunities</mark> and potential for <mark>growth</mark> are important to me.","timestamp":"2024-03-20T11:33:00Z"}
{"index":{}} 