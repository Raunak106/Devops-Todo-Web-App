import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, UserPlus, Phone, Sparkles, Rocket, AlertCircle, CheckCircle2 } from "lucide-react";
import { signupSchema, SignupFormData } from "@/lib/emailValidation";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { signup, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated && !isLoading) {
    navigate("/dashboard");
    return null;
  }

  const validateField = (field: string, value: string) => {
    const formData = { name, email, phone, password, confirmPassword, [field]: value };
    const result = signupSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldError = result.error.errors.find(e => e.path[0] === field);
      if (fieldError) {
        setErrors(prev => ({ ...prev, [field]: fieldError.message }));
      } else {
        setErrors(prev => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    } else {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, field === 'name' ? name : field === 'email' ? email : field === 'phone' ? phone : field === 'password' ? password : confirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const formData: SignupFormData = { name, email, phone: phone || undefined, password, confirmPassword };
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
      toast({ 
        title: "Validation Error", 
        description: result.error.errors[0]?.message || "Please fix the errors below", 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    const signupResult = await signup(name, email, password, phone || undefined);

    if (signupResult.success) {
      toast({ title: "Account created! 🎉", description: "Welcome to TaskFlow" });
      navigate("/dashboard");
    } else {
      toast({ title: "Signup failed", description: signupResult.error, variant: "destructive" });
    }

    setLoading(false);
  };

  const getFieldStatus = (field: string) => {
    if (!touched[field]) return 'idle';
    if (errors[field]) return 'error';
    return 'success';
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
            <Label htmlFor="name" className="flex items-center gap-2">
              Full Name *
              {getFieldStatus('name') === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </Label>
            <div className="relative group">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${getFieldStatus('name') === 'error' ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} />
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => { setName(e.target.value); if (touched.name) validateField('name', e.target.value); }}
                onBlur={() => handleBlur('name')}
                className={`pl-11 h-12 border-2 transition-all ${getFieldStatus('name') === 'error' ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`} 
              />
            </div>
            {touched.name && errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" /> {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email *
              {getFieldStatus('email') === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </Label>
            <div className="relative group">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${getFieldStatus('email') === 'error' ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} />
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => { setEmail(e.target.value); if (touched.email) validateField('email', e.target.value); }}
                onBlur={() => handleBlur('email')}
                className={`pl-11 h-12 border-2 transition-all ${getFieldStatus('email') === 'error' ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`} 
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" /> {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              Phone (optional)
              {phone && getFieldStatus('phone') === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </Label>
            <div className="relative group">
              <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${getFieldStatus('phone') === 'error' ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} />
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1234567890" 
                value={phone} 
                onChange={(e) => { setPhone(e.target.value); if (touched.phone) validateField('phone', e.target.value); }}
                onBlur={() => handleBlur('phone')}
                className={`pl-11 h-12 border-2 transition-all ${getFieldStatus('phone') === 'error' ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`} 
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" /> {errors.phone}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                Password *
                {getFieldStatus('password') === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </Label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${getFieldStatus('password') === 'error' ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••" 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); if (touched.password) validateField('password', e.target.value); }}
                  onBlur={() => handleBlur('password')}
                  className={`pl-11 h-12 border-2 transition-all ${getFieldStatus('password') === 'error' ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`} 
                />
              </div>
              {touched.password && errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="h-3 w-3" /> {errors.password}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                Confirm *
                {getFieldStatus('confirmPassword') === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </Label>
              <div className="relative group">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${getFieldStatus('confirmPassword') === 'error' ? 'text-destructive' : 'text-muted-foreground group-focus-within:text-primary'}`} />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••" 
                  value={confirmPassword} 
                  onChange={(e) => { setConfirmPassword(e.target.value); if (touched.confirmPassword) validateField('confirmPassword', e.target.value); }}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`pl-11 h-12 border-2 transition-all ${getFieldStatus('confirmPassword') === 'error' ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`} 
                />
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Password requirements hint */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters with at least one letter and one number.
            </p>
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
