import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, user, isLoading, error, requiresEmailConfirmation, resendConfirmation, signOut } = useAuth();

  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  useEffect(() => {
    // If user is set but requiresEmailConfirmation is true, force sign out (should not happen, but for safety)
    if (user && requiresEmailConfirmation) {
      signOut();
    }
    // If user is set and not loading, redirect to home (only for login, not signup)
    if (user && isLogin && !isLoading) {
      window.location.href = "/";
    }
  }, [user, isLogin, isLoading, requiresEmailConfirmation, signOut]);

  useEffect(() => {
    if (requiresEmailConfirmation) {
      setShowConfirmationMessage(true);
      setMessage("Account created successfully! Please check your email to confirm your account.");
      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        setIsLogin(true);
        setShowConfirmationMessage(false);
        setMessage("");
      }, 3000);
    }
  }, [requiresEmailConfirmation]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Do not set user or redirect here; handled by requiresEmailConfirmation effect
      }
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setMessage("");
      await signInWithGoogle();
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-lg border-border/40">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold gradient-text">BingeBook</h1>
          </div>
          <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to your movie collection" : "Join to start tracking movies"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showConfirmationMessage ? (
            <div className="text-center text-green-500 font-semibold py-4">
              {message}
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-background/50 border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-background/50 border-border/60"
                />
              </div>
              {message && (
                <div className="text-center text-red-500 font-semibold py-2">{message}</div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-background/50 border-border/60 hover:bg-background/70" 
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <div className="text-center mt-2">
                <Button type="button" variant="link" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthComponent;