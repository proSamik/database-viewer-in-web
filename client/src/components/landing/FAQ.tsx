import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: "What databases does DBViewer support?",
    answer: "Currently, we support PostgreSQL databases. We're actively working on adding support for MySQL, MongoDB, and other popular databases."
  },
  {
    question: "Is my database connection secure?",
    answer: "Yes, all database connections are encrypted using industry-standard SSL/TLS protocols. We never store your database credentials and all connections are made directly from your browser to your database."
  },
  {
    question: "Can I use DBViewer with my self-hosted database?",
    answer: "Absolutely! DBViewer works with any accessible PostgreSQL database, whether it's hosted in the cloud or on your own infrastructure."
  },
  {
    question: "Do you offer custom enterprise solutions?",
    answer: "Yes, we offer enterprise solutions with custom features, dedicated support, and self-hosting options. Contact our sales team to learn more."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer community support for our free tier users through our documentation and community forums. Pro and Enterprise users get priority email support and dedicated account management."
  }
];

export function FAQ() {
  return (
    <div id="faq" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-700">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center mb-16">
            Frequently asked questions
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-700">
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left">
                        <span className="text-lg font-semibold leading-7 text-white">
                          {faq.question}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          <ChevronDownIcon
                            className={cn(
                              'h-6 w-6 text-gray-400 transition-transform',
                              open ? '-rotate-180' : ''
                            )}
                          />
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-400">
                        {faq.answer}
                      </p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 