import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[50%] top-0 h-[1000px] w-[1000px] -translate-x-1/2 bg-gradient-radial from-blue-500/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Modern Database Management
            <br />
            Made Simple and Powerful
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            A lightning-fast, secure, and intuitive database viewer that helps you manage your data with ease. 
            Built for developers who value speed, security, and simplicity.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button variant="primary" size="lg">
              Try Demo
            </Button>
            <Button variant="secondary" size="lg">
              View Documentation
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { title: 'Lightning Fast', description: 'Query and view your data in milliseconds' },
              { title: 'Secure by Default', description: 'End-to-end encryption and secure connections' },
              { title: 'Modern Interface', description: 'Intuitive UI with powerful features' }
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg bg-gray-800/50 p-6">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 