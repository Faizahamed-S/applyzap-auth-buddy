import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Email address not found. Please sign up again.");
      return;
    }

    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification email sent! Check your inbox.");
    }
    setResending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="text-center">
              <p className="font-medium text-foreground">{email}</p>
            </div>
          )}
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2">⚠️ Verification Required</p>
              <p>You must verify your email before you can sign in. Please click the verification link in your email to activate your account.</p>
            </div>
            
            <p className="text-center">
              <strong>Important:</strong> Check your spam folder if you don't see the email within a few minutes.
            </p>
            
            <p className="text-center text-xs">
              If you entered an incorrect email address, you'll need to sign up again with the correct one.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Didn't receive the email?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
              disabled={resending || !email}
            >
              {resending ? "Sending..." : "Resend verification email"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
