'use client';

import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function CTA() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/console');
  };

  return (
    <div className="relative isolate my-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-800/80 px-6 py-24 shadow-2xl rounded-3xl sm:px-24 xl:py-32">
          <div className="mx-auto max-w-2xl text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your database experience?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Start managing your databases with ease. No credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleGetStarted}
                className="relative z-20"
              >
                Get Started for Free
              </Button>
            </div>
          </div>
          
          <div className="absolute -top-32 left-0 transform-gpu blur-3xl -z-10" aria-hidden="true">
            <div className="aspect-[1156/678] w-[72.25rem] bg-gradient-to-tr from-blue-600 to-blue-400 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
} 