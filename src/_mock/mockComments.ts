export interface MockComment {
    comment_text: string;
    highlighted_text?: string;
    rule_id?: string;
    topic?: string;
}

export const getMockCommentsForTopic = (topic: string): MockComment[] => {
    switch (topic) {
        case 'career-development':
            return [
                {
                    comment_text: 'I want more career opportunities for growth and advancement.',
                    highlighted_text:
                        'I want more <mark>career</mark> <mark>opportunities</mark> for growth and advancement.',
                    rule_id: 'cd_1',
                    topic: 'Career Growth Opportunities'
                },
                {
                    comment_text: 'Learning is important for my career development and growth.',
                    highlighted_text:
                        '<mark>Learning</mark> is important for my <mark>career</mark> development and growth.',
                    rule_id: 'cd_2',
                    topic: 'Learning and Development'
                },
                {
                    comment_text: 'I want promotion and advancement opportunities in my role.',
                    highlighted_text:
                        'I want <mark>promotion</mark> and <mark>advancement</mark> opportunities in my role.',
                    rule_id: 'cd_3',
                    topic: 'Promotion and Advancement'
                }
            ];
        case 'employee-networks':
            return [
                {
                    comment_text:
                        'I have always been engaged with one or more of the employee networks. I have always taken part in one of the mentorship programs and have become engaged with the people who have been part of the program as my mentor.',
                    highlighted_text:
                        'I have always been engaged with one or more of the <mark>employee networks</mark>. I have always taken part in one of the mentorship programs and have become engaged with the people who have been part of the program as my mentor.',
                    rule_id: '1',
                    topic: 'Employee Networks'
                },
                {
                    comment_text: 'The jewish heritage chapter organized a great event.',
                    highlighted_text: 'The <mark>jewish heritage chapter</mark> organized a great event.',
                    rule_id: '2',
                    topic: 'Jewish Heritage'
                },
                {
                    comment_text: 'The arab heritage chapter is very active in our company.',
                    highlighted_text: 'The <mark>arab heritage chapter</mark> is very active in our company.',
                    rule_id: '3',
                    topic: 'Arab Heritage'
                }
            ];
        case 'client-support':
            return [
                {
                    comment_text: 'I received excellent support from the customer service team.',
                    highlighted_text: 'I received excellent <mark>support</mark> from the customer service team.',
                    rule_id: '1',
                    topic: 'Client Support'
                },
                {
                    comment_text: 'Our client was satisfied with the prompt assistance provided.',
                    highlighted_text: 'Our <mark>client</mark> was satisfied with the prompt assistance provided.',
                    rule_id: '3',
                    topic: 'Client Satisfaction'
                }
            ];
        case 'team-collaboration':
            return [
                {
                    comment_text: 'Team collaboration and communication have been excellent lately.',
                    highlighted_text:
                        '<mark>Team</mark> <mark>collaboration</mark> and communication have been excellent lately.',
                    rule_id: '5',
                    topic: 'Team Collaboration'
                }
            ];
        case 'onboarding':
            return [
                {
                    comment_text: 'Onboarding process was smooth and orientation was helpful.',
                    highlighted_text:
                        '<mark>Onboarding</mark> <mark>process</mark> was smooth and orientation was helpful.',
                    rule_id: '12',
                    topic: 'Onboarding Process'
                },
                {
                    comment_text: 'Orientation experience could be improved to reduce confusion.',
                    highlighted_text: '<mark>Orientation experience</mark> could be improved to reduce confusion.',
                    rule_id: '8',
                    topic: 'Onboarding Feedback'
                }
            ];
        default:
            return [
                {
                    comment_text: 'Sample comment for ' + topic,
                    highlighted_text: 'Sample comment for ' + topic,
                    rule_id: '1',
                    topic: 'Sample Topic'
                }
            ];
    }
};

export const getMockCommentsByRule = (ruleId: string): MockComment[] => {
    const mockCommentsByRule: Record<string, MockComment[]> = {
        '1': [
            {
                comment_text:
                    'I have always been engaged with one or more of the employee networks. I have always taken part in one of the mentorship programs and have become engaged with the people who have been part of the program as my mentor. This year, I took a leap, and became a mentor and so far, so good! BofA has offered me an opportunity to explore leadership skills as well as grow as a person outside of my direct line of work responsibilities.',
                highlighted_text:
                    'I have always been engaged with one or more of the <mark>employee networks</mark>. I have always taken part in one of the mentorship programs and have become engaged with the people who have been part of the program as my mentor. This year, I took a leap, and became a mentor and so far, so good! BofA has offered me an opportunity to explore leadership skills as well as grow as a person outside of my direct line of work responsibilities.'
            },
            {
                comment_text: "I am looking for a new employee network or community stuff. I can't attend anything.",
                highlighted_text:
                    "I am looking for a new <mark>employee network</mark> or community stuff. I can't attend anything."
            }
        ],
        '2': [
            {
                comment_text: 'The jewish heritage chapter organized a great event.',
                highlighted_text: 'The <mark>jewish heritage chapter</mark> organized a great event.'
            }
        ],
        '3': [
            {
                comment_text: 'The arab heritage chapter is very active in our company.',
                highlighted_text: 'The <mark>arab heritage chapter</mark> is very active in our company.'
            }
        ],
        '4': [
            {
                comment_text: 'Our culture heritage network brings together people from diverse backgrounds.',
                highlighted_text:
                    'Our <mark>culture heritage network</mark> brings together people from diverse backgrounds.'
            }
        ],
        '5': [
            {
                comment_text: 'CHN is a great resource for new employees.',
                highlighted_text: '<mark>CHN</mark> is a great resource for new employees.'
            }
        ],
        '6': [
            {
                comment_text: 'The veteran network within the company is very supportive.',
                highlighted_text: 'The <mark>veteran network</mark> within the company is very supportive.'
            }
        ]
    };

    return mockCommentsByRule[ruleId] || [];
};
