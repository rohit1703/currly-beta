'use client';

import { useState, useTransition } from 'react';
import { Mail, Loader2, Check } from 'lucide-react';
import { subscribeNewsletter } from '@/actions/newsletter';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await subscribeNewsletter(email);
      setMessage(result.message);
      setSuccess(result.success);
      if (result.success) setEmail('');
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0066FF] via-[#0080FF] to-cyan-500 p-10 md:p-16 text-center">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Stay ahead of AI
          </h2>
          <p className="text-white/75 text-base md:text-lg mb-8 max-w-lg mx-auto">
            Weekly roundups of the best new AI tools, curated by experts. No spam, unsubscribe anytime.
          </p>

          {success ? (
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-8 py-4 rounded-2xl font-bold text-base">
              <Check className="w-5 h-5" /> {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/20 backdrop-blur text-white placeholder-white/50 border border-white/30 outline-none focus:border-white/70 text-sm"
              />
              <button
                type="submit"
                disabled={isPending}
                className="bg-white text-[#0066FF] px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-70 flex items-center gap-2 justify-center shrink-0"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Subscribe
              </button>
            </form>
          )}

          {message && !success && (
            <p className="mt-3 text-white/60 text-sm">{message}</p>
          )}

          <p className="mt-5 text-white/40 text-xs">
            Join 420+ members · No spam · Unsubscribe anytime
          </p>
        </div>
      </div>
    </section>
  );
}
