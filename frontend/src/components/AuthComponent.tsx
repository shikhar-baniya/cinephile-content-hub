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
  
  const { signIn, signUp, user, isLoading, error, requiresEmailConfirmation, resendConfirmation } = useAuth();

  useEffect(() => {
    if (error) {
      setMessage(error);
    }
  }, [error]);

  useEffect(() => {
    if (requiresEmailConfirmation) {
      setShowConfirmationMessage(true);
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
        setMessage("Account created successfully! Please check your email to confirm your account.");
        setShowConfirmationMessage(true);
        setTimeout(() => {
          setIsLogin(true);
          setShowConfirmationMessage(false);
        }, 3000); // Redirect to sign-in after 3 seconds
      }
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
                disabled={isLoading || showConfirmationMessage}
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
                disabled={isLoading || showConfirmationMessage}
              />
            </div>

            <Button type="submit" disabled={isLoading || showConfirmationMessage} className="w-full">
              {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Sign Up")}
            </Button>

            {showConfirmationMessage && (
              <p className="text-sm text-center text-green-400">
                Please check your email to confirm your account. You will be redirected to sign in.
              </p>
            )}

            {message && !showConfirmationMessage && (
              <p className={`text-sm text-center ${
                message.includes("successfully") ? "text-green-400" : "text-red-400"
              }`}>
                {message}
              </p>
            )}

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary"
                disabled={isLoading || showConfirmationMessage}
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthComponent;