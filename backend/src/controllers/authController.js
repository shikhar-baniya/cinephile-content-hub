import { getSupabase } from '../config/database.js';

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase();

    // Always use Netlify domain for redirect
    const netlifyDomain = 'https://thebingebook.netlify.app';
    const origin = netlifyDomain;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/email-confirmation`,
      }
    });

    if (error) throw error;

    // Don't return session data for unconfirmed users
    res.json({
      user: data.user,
      session: null, // Force null session until email is confirmed
      message: 'Please check your email and click the confirmation link to complete your registration.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Check if email is confirmed
    if (data.user && !data.user.email_confirmed_at) {
      // Sign out the unconfirmed user
      await supabase.auth.signOut();
      return res.status(400).json({ 
        error: 'Please confirm your email address before signing in. Check your inbox for the confirmation link.',
        requiresEmailConfirmation: true
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const signOut = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resendConfirmation = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const supabase = getSupabase();
    const netlifyDomain = 'https://thebingebook.netlify.app';
    const origin = netlifyDomain;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${origin}/email-confirmation`,
      }
    });

    if (error) throw error;

    res.json({ message: 'Confirmation email sent! Please check your inbox.' });
  } catch (error) {
    console.error('Resend confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Google OAuth - Initiate authentication
export const initiateGoogleAuth = async (req, res) => {
  try {
    const supabase = getSupabase();
    const { origin } = req.body;
    
    // Use the provided origin or fallback to production domain
    const redirectOrigin = origin || 'https://thebingebook.netlify.app';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectOrigin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;

    res.json({ 
      url: data.url,
      message: 'Redirect to Google OAuth' 
    });
  } catch (error) {
    console.error('Google auth initiation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Google OAuth - Handle callback
export const handleGoogleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const supabase = getSupabase();
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    // Return the session data
    res.json({
      user: data.user,
      session: data.session,
      message: 'Google authentication successful'
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: error.message });
  }
};