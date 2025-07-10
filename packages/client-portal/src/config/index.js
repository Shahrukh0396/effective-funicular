export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    jiraClientId: import.meta.env.VITE_JIRA_CLIENT_ID,
    subscription: {
        plans: [
            {
                id: 'basic',
                name: 'Basic',
                price: 29,
                features: [
                    'Basic project tracking',
                    'Up to 5 team members',
                    'Basic analytics',
                    'Email support'
                ]
            },
            {
                id: 'pro',
                name: 'Professional',
                price: 79,
                features: [
                    'Advanced project tracking',
                    'Up to 15 team members',
                    'Advanced analytics',
                    'Priority support',
                    'Custom integrations'
                ]
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                price: 199,
                features: [
                    'Unlimited project tracking',
                    'Unlimited team members',
                    'Enterprise analytics',
                    '24/7 support',
                    'Custom integrations',
                    'Dedicated account manager'
                ]
            }
        ]
    }
} 