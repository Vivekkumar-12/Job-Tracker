import { useState, useEffect } from "react";
import { Briefcase, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingInterviews } from "@/components/dashboard/UpcomingInterviews";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { ApplicationStatusBoard } from "@/components/dashboard/ApplicationStatusBoard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.applications.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare stats for display
  const stats = dashboardData ? [
    {
      icon: Briefcase,
      label: "Total Applications",
      value: dashboardData.stats.total,
      trend: dashboardData.stats.trends.total > 0 
        ? { value: dashboardData.stats.trends.total, isPositive: true }
        : undefined,
      iconColor: "from-blue-500/30 to-blue-600/30",
    },
    {
      icon: Clock,
      label: "Active Applications",
      value: dashboardData.stats.active,
      trend: dashboardData.stats.trends.active > 0
        ? { value: dashboardData.stats.trends.active, isPositive: true }
        : undefined,
      iconColor: "from-amber-500/30 to-orange-500/30",
    },
    {
      icon: CheckCircle2,
      label: "Offers Received",
      value: dashboardData.stats.offers,
      trend: dashboardData.stats.trends.offers > 0
        ? { value: dashboardData.stats.trends.offers, isPositive: true }
        : undefined,
      iconColor: "from-emerald-500/30 to-green-500/30",
    },
    {
      icon: XCircle,
      label: "Rejected",
      value: dashboardData.stats.rejected,
      iconColor: "from-red-500/30 to-rose-500/30",
    },
  ] : [];
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />
        
        <main className="p-6 space-y-6">
          {/* Page Title */}
          <div className="opacity-0 animate-fade-in">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your job search progress and upcoming interviews
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : dashboardData ? (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                  <StatCard
                    key={stat.label}
                    {...stat}
                    delay={idx * 100}
                  />
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <UpcomingInterviews upcomingReminders={dashboardData.upcomingReminders} />
                  <ApplicationStatusBoard statusData={dashboardData.statusBreakdown} />
                </div>
                <div className="space-y-6">
                  <ActivityChart weekData={dashboardData.weekActivity} />
                </div>
              </div>

              {/* Recent Applications */}
              <RecentApplications applications={dashboardData.recentApplications} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No dashboard data available</p>
            </div>
          )}
        </main>
      </div>

      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Index;
