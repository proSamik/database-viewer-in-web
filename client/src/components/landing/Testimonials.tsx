export function Testimonials() {
  const testimonials = [
    {
      content: "DBViewer has completely transformed how we manage our databases. The interface is intuitive and the performance is outstanding.",
      author: "Sarah Chen",
      role: "CTO at TechCorp",
      image: "/testimonials/sarah.jpg"
    },
    {
      content: "The real-time updates and collaboration features have made our team significantly more productive.",
      author: "Michael Rodriguez",
      role: "Lead Developer at StartupX",
      image: "/testimonials/michael.jpg"
    },
    {
      content: "Security was our main concern, and DBViewer exceeded our expectations with their enterprise-grade features.",
      author: "Emma Thompson",
      role: "Database Administrator at SecureData",
      image: "/testimonials/emma.jpg"
    }
  ];

  return (
    <div className="py-24 bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by developers worldwide
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            See what our users have to say about their experience with DBViewer.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="flex flex-col bg-gray-800/50 p-6 rounded-2xl">
              <div className="flex-1">
                <p className="text-lg text-gray-300">{testimonial.content}</p>
              </div>
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-700" />
                <div className="ml-3">
                  <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 