import { createClient } from '@/utils/supabase/server'; // or your existing supabase client path
import { cookies } from 'next/headers';
import ToolCard from '@/components/ToolCard';// app/page.tsx

// 1. Change this import to point to the SERVER utility
import { createClient } from '@/utils/supabase/server'; 

import { cookies } from 'next/headers';

// 2. Fix the ToolCard import (See Step 3 below)
import ToolCard from '@/components/ToolCard'; // We will verify this path next

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore); 
  
  // ... rest of your code

export default async function Home() {
  // 1. Initialize Supabase Client
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 2. Fetch Tools from DB
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .eq('launch_status', 'Live') // Optional: Ensure we only show live items
    .order('date_added', { ascending: false }); // Show newest first

  if (error) {
    console.error('Error fetching tools:', error);
    return <div>Error loading tools</div>;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Your existing Hero Section here... */}
      
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-6">Latest AI Tools</h2>
        
        {/* 3. Render the Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools?.map((tool) => (
            <ToolCard 
              key={tool.id}
              title={tool.name}
              description={tool.description}
              category={tool.main_category}
              pricing={tool.pricing_model} // Connects to your new data
              image={tool.image_url || '/placeholder.png'}
              url={tool.website}
            />
          ))}
        </div>
      </section>
    </main>
  );
}