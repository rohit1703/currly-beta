import React from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle2, DollarSign } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  category: string;
  pricing: string;
  image: string;
  url: string;
}

const ToolCard = ({ title, description, category, pricing, image, url }: ToolCardProps) => {
  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500">
      
      {/* Top Section: Icon + Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Tool Icon / Image */}
          <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
             {/* Using standard img tag to avoid Next.js external domain config issues for now */}
            <img 
              src={image || "https://api.dicebear.com/7.x/shapes/svg?seed=" + title} 
              alt={title} 
              className="h-full w-full object-cover"
            />
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {title}
            </h3>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {category}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {description}
      </p>

      {/* Footer: Metadata & Action */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {pricing}
          </span>
        </div>

        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Visit <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default ToolCard;