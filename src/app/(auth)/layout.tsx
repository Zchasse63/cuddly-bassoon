/**
 * Auth Route Group Layout
 * Force dynamic rendering to prevent SSR issues with auth pages
 */

export const dynamic = 'force-dynamic';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Abstract Glass Background Shapes */}
      <div className="pointer-events-none absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[100px] animate-pulse" />
      <div
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse"
        style={{ animationDelay: '2s' }}
      />
      <div className="pointer-events-none absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-4">{children}</div>
    </div>
  );
}
