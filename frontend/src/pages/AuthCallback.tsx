import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First check for errors in query params
        const error = searchParams.get('error');
        if (error) {
          setError(`Authentication failed: ${error}`);
          setStatus('error');
          return;
        }

        // Check for authorization code (traditional OAuth flow)
        const code = searchParams.get('code');
        
        // Check for tokens in hash fragment (Supabase implicit flow)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (code) {
          // Handle authorization code flow
          const response = await authService.handleGoogleCallback(code);
          
          if (response.session && response.user) {
            setStatus('success');
            setTimeout(() => {
              navigate('/', { replace: true });
              window.location.reload();
            }, 1500);
          } else {
            throw new Error('Invalid response from server');
          }
        } else if (accessToken && refreshToken) {
          // Handle token-based flow from Supabase
          console.log('Handling Supabase token callback');
          
          // Create a session object from the tokens
          const session = {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: parseInt(hashParams.get('expires_at') || '0'),
            token_type: hashParams.get('token_type') || 'bearer'
          };

          // Save session and redirect
          authService.handleTokenCallback(session);
          setStatus('success');
          
          setTimeout(() => {
            navigate('/', { replace: true });
            window.location.reload();
          }, 1500);
        } else {
          setError('No authorization code or tokens received');
          setStatus('error');
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication...</h2>
          <p className="text-gray-300">Please wait while we sign you in.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Successful!</h2>
          <p className="text-gray-300">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default AuthCallback;