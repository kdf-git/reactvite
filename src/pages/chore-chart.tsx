import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';

export default function ChoreChartLanding() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://api.mailerlite.com/api/v2/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-MailerLite-ApiKey': import.meta.env.VITE_MAILERLITE_API_KEY,
        },
        body: JSON.stringify({
          email,
          name,
          groups: [import.meta.env.VITE_MAILERLITE_GROUP_ID],
          resubscribe: true,
          type: 'active',
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to subscribe');
      }
      navigate('/chore-chart/download');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Free Kids' Printable Chore Chart</h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Keep your kids motivated and organized with our colorful chore chart!
        </p>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block mb-1">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email" className="block mb-1">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Get the Chart'}
          </Button>
        </form>
      </div>
    </div>
  );
}
