import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";

const AuthComponent = () => {
  const [message, setMessage] = useState("");
  
  const { signInWithGoogle, user, isLoading, error } = useAuth();

  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  useEffect(() => {
    if (user && !isLoading) {
      window.location.href = "/";
    }
  }, [user, isLoading]);

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
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to your movie collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {message && (
              <div className="text-center text-red-500 font-semibold py-2">{message}</div>
            )}
            <Button 
              type="button" 
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
              {isLoading ? "Loading..." : "Continue with Google"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthComponent;