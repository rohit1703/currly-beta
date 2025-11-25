import React from 'react';
import Link from 'next/link'; // Import Link
import { ExternalLink, DollarSign } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  category: string;
  pricing: string;
  image: string;
  url: string;
  slug: string; // New Prop!
}

const ToolCard = ({ title, description, category, pricing, image, url, slug }: ToolCardProps) => {
  // Safe link: if slug exists go to internal page, else fallback to external
  const internalLink = slug ? `/tool/${slug}` : url;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50">
      
      {/* Clickable Header Area (Goes to Internal Page) */}
      <Link href={internalLink} className="block">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <img 
                src={image || "https://api.dicebear.com/7.x/shapes/svg?seed=" + title} 
                alt={title} 
                className="h-full w-full object-cover"
              />
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                {title}
              </h3>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
          {description}
        </p>
      </Link>

      {/* Footer: Metadata & External Link */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5" />
            {pricing}
          </span>
        </div>

        {/* External Visit Button */}
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Visit <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
};

export default ToolCard;