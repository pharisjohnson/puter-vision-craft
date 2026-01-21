import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  Image, 
  FileText, 
  Copy, 
  Download, 
  ExternalLink, 
  LogOut,
  Lock,
  TrendingUp
} from "lucide-react";

// Simple auth credentials (for personal use only - not production secure)
const ADMIN_EMAIL = "matatasnr@gmail.com";
const ADMIN_PASSWORD = "@Puterapp2026";

type Stats = {
  imagesUploaded: number;
  textsExtracted: number;
  textsCopied: number;
  textsDownloaded: number;
  lastUpdated: string;
};

const getStoredStats = (): Stats => {
  const stored = localStorage.getItem("ocr_admin_stats");
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    imagesUploaded: 0,
    textsExtracted: 0,
    textsCopied: 0,
    textsDownloaded: 0,
    lastUpdated: new Date().toISOString(),
  };
};

export const incrementStat = (key: keyof Omit<Stats, 'lastUpdated'>) => {
  const stats = getStoredStats();
  stats[key]++;
  stats.lastUpdated = new Date().toISOString();
  localStorage.setItem("ocr_admin_stats", JSON.stringify(stats));
};

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authenticated", "true");
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Sign in to view OCR analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full gradient-primary">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  description: string;
}) => (
  <Card className="shadow-elegant">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [stats, setStats] = useState<Stats>(getStoredStats);

  useEffect(() => {
    // Refresh stats every 5 seconds
    const interval = setInterval(() => {
      setStats(getStoredStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    onLogout();
  };

  const resetStats = () => {
    const emptyStats: Stats = {
      imagesUploaded: 0,
      textsExtracted: 0,
      textsCopied: 0,
      textsDownloaded: 0,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("ocr_admin_stats", JSON.stringify(emptyStats));
    setStats(emptyStats);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">OCR Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://us.posthog.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                PostHog Dashboard
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Usage Statistics</h2>
          <p className="text-muted-foreground">
            Local session tracking • Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Images Uploaded"
            value={stats.imagesUploaded}
            icon={Image}
            description="Total images processed"
          />
          <StatCard
            title="Texts Extracted"
            value={stats.textsExtracted}
            icon={FileText}
            description="Successful OCR operations"
          />
          <StatCard
            title="Texts Copied"
            value={stats.textsCopied}
            icon={Copy}
            description="Copy to clipboard actions"
          />
          <StatCard
            title="Texts Downloaded"
            value={stats.textsDownloaded}
            icon={Download}
            description="TXT file downloads"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Full Analytics
              </CardTitle>
              <CardDescription>
                View detailed analytics and user behavior in PostHog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                PostHog provides comprehensive analytics including:
              </p>
              <ul className="text-sm space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Session recordings and user journeys
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Event funnels and conversion tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  User cohorts and retention analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Real-time event streams
                </li>
              </ul>
              <Button asChild className="w-full gradient-primary">
                <a 
                  href="https://us.posthog.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open PostHog Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your OCR scanner statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setStats(getStoredStats())}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Refresh Statistics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={resetStats}
              >
                <FileText className="w-4 h-4 mr-2" />
                Reset Local Stats
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                asChild
              >
                <a href="/">
                  <Image className="w-4 h-4 mr-2" />
                  Go to OCR Scanner
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(
    sessionStorage.getItem("admin_authenticated") === "true"
  );

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setAuthenticated(false)} />;
};

export default Admin;
