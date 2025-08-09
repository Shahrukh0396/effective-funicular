export const config = {
  apiUrl: import.meta.env.DEV ? 'http://localhost:3000/api' : (import.meta.env.VITE_API_URL || 'http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com/api')
} 