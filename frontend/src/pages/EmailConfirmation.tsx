import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmailConfirmation = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-card/95 backdrop-blur-lg border-border/40 rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-primary">Email Confirmed!</h1>
        <p className="mb-6 text-white/80">Thank you for confirming your email. You can now sign in to your account and start using BingeBook.</p>
        <Button onClick={() => navigate("/")}>Go to Sign In</Button>
      </div>
    </div>
  );
};

export default EmailConfirmation; 