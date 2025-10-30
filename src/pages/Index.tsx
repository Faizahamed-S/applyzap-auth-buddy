import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/20">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            ApplyZap
          </h1>
          <p className="text-xl text-muted-foreground">Welcome to your application portal</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate("/login")} size="lg">
            Sign In
          </Button>
          <Button onClick={() => navigate("/signup")} variant="outline" size="lg">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
