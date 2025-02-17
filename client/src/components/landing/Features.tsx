import { 
  ServerIcon,
  ShieldCheckIcon, 
  BoltIcon,
  ListBulletIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Real-time Data Updates',
    description: 'See your data changes instantly with real-time updates and synchronization.',
    Icon: BoltIcon,
  },
  {
    name: 'Secure Access Control',
    description: 'Enterprise-grade security with role-based access control and audit logging.',
    Icon: ShieldCheckIcon,
  },
  {
    name: 'Multiple Database Support',
    description: 'Connect to PostgreSQL, MySQL, and more with our unified interface.',
    Icon: ServerIcon,
  },
  {
    name: 'Advanced Table Management',
    description: 'Sort, filter, and manage your tables with an intuitive interface.',
    Icon: ListBulletIcon,
  },
  {
    name: 'Data Visualization',
    description: 'Visualize your data with built-in charts and reporting tools.',
    Icon: ChartBarIcon,
  },
  {
    name: 'Customizable Interface',
    description: 'Customize your workspace with themes and layout options.',
    Icon: Cog6ToothIcon,
  },
];

export function Features() {
  return (
    <div id="features" className="py-24 bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to manage your database
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Powerful features designed for developers and teams.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="relative">
              <div className="absolute left-0 top-0 h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <feature.Icon className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </div>
              <div className="ml-16">
                <h3 className="text-lg font-medium text-white">{feature.name}</h3>
                <p className="mt-2 text-base text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 