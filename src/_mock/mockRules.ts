export interface MockRule {
    id: string;
    description: string;
    topic: string;
    unique: number;
    total: number;
    excluded: boolean;
    loading?: boolean;
}

export const getMockRulesForTopic = (topic: string): MockRule[] => {
    switch (topic) {
        case 'career-development':
            return [
                {
                    id: 'career_1',
                    description: 'bacghr_career NEAR bacghr_opportunity WITHIN 5 WORDS',
                    topic: 'Career Development',
                    unique: 45,
                    total: 134,
                    excluded: false
                },
                {
                    id: 'career_2',
                    description: 'bacghr_learning NEAR bacghr_career WITHIN 3 WORDS',
                    topic: 'Career Development',
                    unique: 32,
                    total: 98,
                    excluded: false
                },
                {
                    id: 'career_3',
                    description: 'promotion NEAR career WITHIN 4 WORDS',
                    topic: 'Career Development',
                    unique: 28,
                    total: 75,
                    excluded: false
                },
                {
                    id: 'career_4',
                    description: 'lack NEAR bacghr_career WITHIN 3 WORDS',
                    topic: 'Career Development',
                    unique: 22,
                    total: 65,
                    excluded: false
                },
                {
                    id: 'career_5',
                    description: 'skill NEAR development WITHIN 3 WORDS',
                    topic: 'Career Development',
                    unique: 18,
                    total: 52,
                    excluded: false
                }
            ];
        case 'client-support':
            return [
                {
                    id: 'client_1',
                    description: 'bacghr_client NEAR bacghr_support WITHIN 5 WORDS',
                    topic: 'Client Support',
                    unique: 38,
                    total: 112,
                    excluded: false
                },
                {
                    id: 'client_2',
                    description: 'client NEAR support WITHIN 5 WORDS',
                    topic: 'Client Support',
                    unique: 29,
                    total: 87,
                    excluded: false
                },
                {
                    id: 'client_3',
                    description: 'customer NEAR help WITHIN 4 WORDS',
                    topic: 'Client Support',
                    unique: 25,
                    total: 73,
                    excluded: false
                },
                {
                    id: 'client_4',
                    description: 'user NEAR assistance WITHIN 4 WORDS',
                    topic: 'Client Support',
                    unique: 21,
                    total: 58,
                    excluded: false
                },
                {
                    id: 'client_5',
                    description: '"end user" NEAR (support OR help OR assistance) WITHIN 5 WORDS',
                    topic: 'Client Support',
                    unique: 17,
                    total: 45,
                    excluded: false
                }
            ];
        case 'team-collaboration':
            return [
                {
                    id: 'team_1',
                    description: 'team NEAR collaboration WITHIN 4 WORDS',
                    topic: 'Team Collaboration',
                    unique: 42,
                    total: 128,
                    excluded: false
                },
                {
                    id: 'team_2',
                    description: 'team NEAR help WITHIN 3 WORDS',
                    topic: 'Team Collaboration',
                    unique: 35,
                    total: 95,
                    excluded: false
                },
                {
                    id: 'team_3',
                    description: 'collaboration NEAR work WITHIN 4 WORDS',
                    topic: 'Team Collaboration',
                    unique: 31,
                    total: 82,
                    excluded: false
                },
                {
                    id: 'team_4',
                    description: 'team NEAR communication WITHIN 4 WORDS',
                    topic: 'Team Collaboration',
                    unique: 27,
                    total: 71,
                    excluded: false
                },
                {
                    id: 'team_5',
                    description: '"cross functional" NEAR (team OR group) WITHIN 3 WORDS',
                    topic: 'Team Collaboration',
                    unique: 23,
                    total: 59,
                    excluded: false
                }
            ];
        default:
            return [
                {
                    id: '1',
                    description: 'Sample rule for ' + topic,
                    topic: 'Sample Topic',
                    unique: 10,
                    total: 100,
                    excluded: false
                }
            ];
    }
};
