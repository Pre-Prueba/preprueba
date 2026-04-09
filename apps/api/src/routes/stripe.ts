import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { stripe } from '../services/stripe';
import { requireAuth } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// POST /stripe/checkout
router.post('/checkout', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.nombre ?? undefined });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout?checkout=cancelled`,
    metadata: { userId: user.id },
  });

  res.json({ checkoutUrl: session.url });
});

// POST /stripe/webhook
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature' });
    return;
  }

  let event: ReturnType<(typeof stripe)['webhooks']['constructEvent']>;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    res.status(400).json({ error: 'Webhook signature verification failed' });
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: sub.id,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
        create: {
          userId,
          stripeSubscriptionId: sub.id,
          status: 'ACTIVE',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const statusMap: Record<string, 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING'> = {
        active: 'ACTIVE',
        canceled: 'CANCELLED',
        past_due: 'PAST_DUE',
        trialing: 'TRIALING',
      };
      const status = statusMap[sub.status] ?? 'CANCELLED';
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status, currentPeriodEnd: new Date(sub.current_period_end * 1000), cancelAtPeriodEnd: sub.cancel_at_period_end },
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: 'CANCELLED' },
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: 'PAST_DUE' },
        });
      }
      break;
    }
  }

  res.json({ received: true });
});

// GET /stripe/portal
router.get('/portal', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const user = (req as AuthRequest).user;

  if (!user.stripeCustomerId) {
    res.status(400).json({ error: 'No tienes una suscripción activa.' });
    return;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/settings`,
  });

  res.json({ portalUrl: session.url });
});

export default router;
