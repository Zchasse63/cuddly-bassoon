import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InboxPageClient } from './inbox-client';

export const metadata = {
  title: 'Inbox',
  description: 'Unified communication inbox for SMS and email',
};

async function InboxContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get unread count
  const { count: unreadCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
    .eq('direction', 'inbound');

  return <InboxPageClient initialUnreadCount={unreadCount || 0} />;
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxPageSkeleton />}>
      <InboxContent />
    </Suspense>
  );
}

function InboxPageSkeleton() {
  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Thread list skeleton */}
      <div className="w-80 border-r">
        <div className="p-4 border-b space-y-4">
          <div className="h-7 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded" />
        </div>
        <div className="p-2 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Conversation skeleton */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 mx-auto bg-muted animate-pulse rounded-full" />
          <div className="h-5 w-40 mx-auto bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
