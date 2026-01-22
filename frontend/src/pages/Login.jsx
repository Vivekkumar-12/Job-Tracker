import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { AlertCircle, LogIn, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending2FACode, setSending2FACode] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("login_email");
    if (savedEmail) setEmail(savedEmail);
    // Ensure password field is empty on mount
    setPassword("");
  }, []);

  // Auto-save email to localStorage
  useEffect(() => {
    if (email) {
      localStorage.setItem("login_email", email);
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      if (requires2FA && !twoFactorCode) {
        throw new Error("Please enter the 2FA code");
      }

      const response = await login(email, password, twoFactorCode || undefined);
      
      // Check if 2FA is required
      if (response?.requires2FA) {
        setRequires2FA(true);
        // Automatically send 2FA code
        await handleSend2FACode();
        setLoading(false);
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSend2FACode = async () => {
    try {
      setSending2FACode(true);
      await apiClient.auth.send2FACode(email);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to send 2FA code");
    } finally {
      setSending2FACode(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTwoFactorCode("");
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md opacity-0 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Login to your Job Hunt Hub account</p>
        </div>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-xl">
              {requires2FA ? "Two-Factor Authentication" : "Sign In"}
            </CardTitle>
            {requires2FA && (
              <CardDescription>
                Enter the 6-digit code sent to your email
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {!requires2FA ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="bg-secondary/50 border-border"
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="bg-secondary/50 border-border"
                      autoComplete="new-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="2fa-code" className="text-foreground">
                      Verification Code
                    </Label>
                    <Input
                      id="2fa-code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                      className="bg-secondary/50 border-border text-center text-2xl tracking-widest"
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleBack}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      className="flex-1"
                      disabled={loading || twoFactorCode.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Sign In"
                      )}
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={handleSend2FACode}
                    disabled={sending2FACode}
                  >
                    {sending2FACode ? "Sending..." : "Resend code"}
                  </Button>
                </>
              )}
            </form>

            {!requires2FA && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Login;
