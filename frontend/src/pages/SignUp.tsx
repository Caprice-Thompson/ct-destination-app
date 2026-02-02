import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';
import { AppRoute } from '../common/enums';
import { Input } from '../components/Input';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

export const SignUpPage = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password, options: { data: { displayName } } })

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the confirmation link!');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign up to save your favorite destinations
          </p>
        </div>
        <form onSubmit={handleAuth} className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div>
            <div>
                  <Input
                  label="Display Name"
                  type="text"
                  placeholder="Enter a display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required={true}
                  dataTestId="displayName"
                />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required={true}
                dataTestId="email"
              />
            </div>
            <div>
              <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required={true}
              dataTestId="password"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading} 
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </button>

          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
            </div>
            <Link
              to={AppRoute.Login}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in instead
            </Link>
            <div className="pt-2">
              <Link
                to={AppRoute.Landing}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="flex items-center gap-2">                
                <ArrowUturnLeftIcon height={16} width={16} />
                Back to landing
                </span>

              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};