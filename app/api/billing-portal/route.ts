python3 -c "
content = '''import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    const customers = await stripe.customers.list({ limit: 100 });
    const customer = customers.data.find(
      (c) => c.metadata?.userId === userId || c.metadata?.user_id === userId
    );
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: 'https://www.ohte-toppa-es.com',
    });
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
'''
with open('app/api/billing-portal/route.ts', 'w') as f:
    f.write(content)
print('Done')
"
