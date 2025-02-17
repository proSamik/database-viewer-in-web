import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export function Demo() {
  return (
    <div id="demo" className="relative py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See it in action
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Experience the power and simplicity of our database viewer.
          </p>
        </div>

        <div className="mt-16">
          <div className="relative rounded-xl bg-gray-800/50 p-2">
            {/* Replace with your actual demo screenshot/video */}
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <div className="bg-gray-800 w-full h-full flex items-center justify-center">
                <p className="text-gray-400">Demo Preview</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button variant="primary" size="lg">
              Try Live Demo
            </Button>
            <Button variant="secondary" size="lg">
              Watch Tutorial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 