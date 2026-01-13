import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, LogIn, Phone, Sparkles, CheckCircle2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const { login, loginWithPhone, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated && !isLoading) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (loginMethod === "email") {
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Welcome back! 🎉",
          description: "You have successfully logged in",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } else {
      if (!phone || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const result = await loginWithPhone(phone, password);

      if (result.success) {
        toast({
          title: "Welcome back! 🎉",
          description: "You have successfully logged in",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      }
    }

    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="glass-card w-full max-w-md p-8 animate-scale-in relative overflow-hidden">
        {/* Card decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-tr-full" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Welcome Back</span>
          </h1>
          <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
        </div>

        <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "email" | "phone")} className="mb-6 relative z-10">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="email" className="flex items-center gap-2 h-10 data-[state=active]:shadow-lg">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2 h-10 data-[state=active]:shadow-lg">
              <Phone className="h-4 w-4" />
              Phone
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {loginMethod === "email" ? (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 border-2 focus:border-primary focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-11 h-12 border-2 focus:border-primary focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 h-12 border-2 focus:border-primary focus:shadow-lg focus:shadow-primary/10 transition-all duration-300"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary/30 btn-shine" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Signing in...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Sign In
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-sm text-muted-foreground">New here?</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/30 text-primary font-medium hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
