import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = emailSchema.parse({ email });
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset link sent to your email!");
        setEmailSent(true);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            {emailSent 
              ? "Check your email for the reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        {!emailSent ? (
          <>
            <CardContent>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-primary hover:underline"
              >
                Back to login
              </button>
            </CardFooter>
          </>
        ) : (
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Please check your inbox and click the link to reset your password.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Back to login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
