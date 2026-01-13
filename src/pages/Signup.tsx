import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, UserPlus, Phone, Sparkles, Rocket } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated && !isLoading) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      setLoading(false);
      return;
    }

    const result = await signup(name, email, password, phone || undefined);

    if (result.success) {
      toast({ title: "Account created! 🎉", description: "Welcome to TaskFlow" });
      navigate("/dashboard");
    } else {
      toast({ title: "Signup failed", description: result.error, variant: "destructive" });
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
      <div className="absolute top-20 right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="glass-card w-full max-w-md p-8 animate-scale-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse-glow">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2"><span className="gradient-text">Create Account</span></h1>
          <p className="text-muted-foreground">Start your productivity journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-11 h-12 border-2 focus:border-primary transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-12 border-2 focus:border-primary transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input id="phone" type="tel" placeholder="+1234567890" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-11 h-12 border-2 focus:border-primary transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="password" type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 h-12 border-2 focus:border-primary transition-all" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm *</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="confirmPassword" type="password" placeholder="••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-11 h-12 border-2 focus:border-primary transition-all" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 shadow-lg shadow-primary/30 btn-shine" disabled={loading}>
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><UserPlus className="mr-2 h-5 w-5" />Create Account</>}
          </Button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <p className="text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
