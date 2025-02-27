import { Button } from '@/components/ui/Button';

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
            {/* Embed YouTube video for demo */}
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/cn8MsmLzOQQ"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 