import { useState } from 'react';
import type { FormEvent } from 'react';
import { signIn } from '../../services/auth';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card rounded-soft-lg shadow-soft-lg p-8 max-w-md w-full border border-border">
        <h1 className="text-3xl font-bold text-peach mb-2 text-center">
          Cozy Production
        </h1>
        <p className="text-text-secondary text-center mb-6">
          Connexion
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-input border border-border bg-card text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-peach/30 focus:border-peach transition-all"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-input border border-border bg-card text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-peach/30 focus:border-peach transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-peach-light text-peach-dark px-4 py-2 rounded-soft text-sm border border-peach/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-peach to-lavender hover:from-peach-dark hover:to-lavender-dark disabled:from-text-muted disabled:to-text-muted text-white font-semibold py-3 px-6 rounded-soft shadow-soft hover:shadow-soft-lg transition-all duration-200"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
