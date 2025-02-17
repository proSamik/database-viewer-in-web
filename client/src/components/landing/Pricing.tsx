import { Button } from '@/components/ui/Button';
import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for personal projects and learning.',
    features: [
      'Connect to 1 database',
      'Basic table operations',
      'Standard security features',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'Ideal for professionals and small teams.',
    features: [
      'Connect to unlimited databases',
      'Advanced table operations',
      'Real-time collaboration',
      'Priority support',
      'Custom themes',
      'Data export',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations requiring advanced features and support.',
    features: [
      'Everything in Pro',
      'Custom deployment options',
      'Advanced security features',
      'Dedicated support',
      'SLA guarantees',
      'Custom integrations',
    ],
  },
];

export function Pricing() {
  return (
    <div id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Choose the plan that best fits your needs
          </p>
        </div>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-3xl p-8 bg-gray-800/50 ring-1 ring-gray-700 xl:p-10"
            >
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-white">
                  {tier.name}
                </h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-400">
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {tier.price}
                </span>
                {tier.price !== 'Custom' && (
                  <span className="text-sm font-semibold text-gray-400">/month</span>
                )}
              </p>
              <Button
                variant={tier.name === 'Pro' ? 'primary' : 'secondary'}
                className="mt-6 w-full"
              >
                {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Button>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-400">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-blue-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 