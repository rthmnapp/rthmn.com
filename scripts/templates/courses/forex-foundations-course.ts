import { whatisforextrading } from '../lessons/what-is-forex-trading';

export interface LessonTemplate {
    title: string;
    description?: string;
    estimatedTime?: string;
    learningObjectives?: string[];
    order: number;
    content?: any[];
    quiz?: any[];
    relatedLessons?: any[];
}

export const forexFoundationsCourse = {
    title: 'Forex Foundations',
    description: 'Master the core principles of forex trading through a comprehensive journey from basic concepts to practical trading psychology',
    chapters: [
        {
            title: 'Introduction to Trading',
            order: 1,
            lessons: [
                { title: 'What is Forex Trading?', order: 1, lesson: whatisforextrading },
                { title: 'The Psychology of Markets', order: 2 },
                { title: 'Understanding Market Participants', order: 3 },
                { title: 'The Truth About Profitable Trading', order: 4 },
                { title: 'Market Cycles and Human Behavior', order: 5 },
                { title: 'The Role of Liquidity', order: 6 },
                { title: 'Smart vs Dumb Money', order: 7 },
                { title: 'Understanding Market Manipulation', order: 8 },
            ],
        },
        {
            title: 'Market Mechanics',
            order: 2,
            lessons: [
                { title: 'How Charts Tell Stories', order: 1 },
                { title: 'Price Action Fundamentals', order: 2 },
                { title: 'Understanding Time Frames', order: 3 },
                { title: 'Market Structure and Flow', order: 4 },
                { title: 'Order Flow Dynamics', order: 5 },
                { title: 'Understanding Market Depth', order: 6 },
                { title: 'Price Discovery Process', order: 7 },
                { title: 'Auction Market Theory', order: 8 },
            ],
        },
        {
            title: 'Essential Trading Concepts',
            order: 3,
            lessons: [
                { title: 'Understanding Risk Management', order: 1 },
                { title: 'Position Sizing and Account Preservation', order: 2 },
                { title: 'The Mathematics of Loss', order: 3 },
                { title: 'Risk-to-Reward Ratios in Practice', order: 4 },
                { title: 'Understanding Expectancy', order: 5 },
                { title: 'Portfolio Heat Management', order: 6 },
                { title: 'Risk of Ruin Calculations', order: 7 },
                { title: 'Building Anti-Fragile Systems', order: 8 },
            ],
        },
        {
            title: 'Pattern Recognition',
            order: 4,
            lessons: [
                { title: 'Why Patterns Work in Markets', order: 1 },
                { title: 'High-Probability Pattern Setups', order: 2 },
                { title: 'Pattern Failures and What They Tell Us', order: 3 },
                { title: 'Building Pattern Recognition Skills', order: 4 },
                { title: 'Market Context and Pattern Validity', order: 5 },
                { title: 'Institutional Pattern Trading', order: 6 },
                { title: 'Complex Pattern Integration', order: 7 },
                { title: 'Pattern Confluence Strategies', order: 8 },
            ],
        },
        {
            title: 'Trading Psychology Mastery',
            order: 5,
            lessons: [
                { title: 'The Law of Large Numbers in Trading', order: 1 },
                { title: 'Emotional Detachment in Trading', order: 2 },
                { title: 'Building a Resilient Trading Mindset', order: 3 },
                { title: 'Developing Trading Discipline', order: 4 },
                { title: 'Managing Cognitive Biases', order: 5 },
                { title: 'Peak Performance States', order: 6 },
                { title: 'Recovery from Trading Setbacks', order: 7 },
                { title: 'Building Mental Toughness', order: 8 },
            ],
        },
        {
            title: 'Practical Trading Framework',
            order: 6,
            lessons: [
                { title: 'Creating a Trading Plan', order: 1 },
                { title: 'Trade Management Principles', order: 2 },
                { title: 'Position Management Strategies', order: 3 },
                { title: 'Exit Strategies and Taking Profits', order: 4 },
                { title: 'Trading Journal Analytics', order: 5 },
                { title: 'Performance Metrics That Matter', order: 6 },
                { title: 'System Optimization Process', order: 7 },
                { title: 'Adapting to Market Changes', order: 8 },
            ],
        },
        {
            title: 'Market Analysis',
            order: 7,
            lessons: [
                { title: 'Understanding Market Context', order: 1 },
                { title: 'Support and Resistance Dynamics', order: 2 },
                { title: 'Volume and Price Relationships', order: 3 },
                { title: 'Multiple Timeframe Analysis', order: 4 },
                { title: 'Market Profile Concepts', order: 5 },
                { title: 'Order Flow Analysis', order: 6 },
                { title: 'Intermarket Analysis', order: 7 },
                { title: 'Institutional Trading Levels', order: 8 },
            ],
        },
        {
            title: 'Advanced Trading Concepts',
            order: 8,
            lessons: [
                { title: 'Market Manipulation Awareness', order: 1 },
                { title: 'Understanding Institutional Trading', order: 2 },
                { title: 'Advanced Risk Management Techniques', order: 3 },
                { title: 'Building a Complete Trading System', order: 4 },
                { title: 'Algorithmic Trading Concepts', order: 5 },
                { title: 'High-Frequency Trading Impact', order: 6 },
                { title: 'Dark Pool Trading', order: 7 },
                { title: 'Market Microstructure', order: 8 },
            ],
        },
        {
            title: 'Market Psychology Deep Dive',
            order: 9,
            lessons: [
                { title: 'Mass Psychology in Markets', order: 1 },
                { title: 'Fear, Greed, and Market Cycles', order: 2 },
                { title: 'Institutional Psychology', order: 3 },
                { title: 'Retail Trading Psychology', order: 4 },
                { title: 'Market Sentiment Analysis', order: 5 },
                { title: 'Contrarian Trading Psychology', order: 6 },
                { title: 'Psychology of Market Makers', order: 7 },
                { title: 'Advanced Behavioral Finance', order: 8 },
            ],
        },
        {
            title: 'Professional Trading',
            order: 10,
            lessons: [
                { title: 'Building a Trading Business', order: 1 },
                { title: 'Professional Risk Management', order: 2 },
                { title: 'Portfolio Management Techniques', order: 3 },
                { title: 'Trading Performance Analytics', order: 4 },
                { title: 'Professional Trading Tools', order: 5 },
                { title: 'Regulatory Compliance', order: 6 },
                { title: 'Business Continuity Planning', order: 7 },
                { title: 'Scaling Trading Operations', order: 8 },
            ],
        },
    ],
};
