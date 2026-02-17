import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/" className="text-primary underline text-sm">Go to Home</Link>
    </div>
  );
}
