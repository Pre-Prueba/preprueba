import Stripe from 'stripe';

// Fallback para uma chave fake para evitar crash se o .env não estiver configurado
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_will_not_work_but_prevents_crash';

export const stripe = new Stripe(stripeKey);
