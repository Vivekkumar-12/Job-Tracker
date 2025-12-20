import { Briefcase, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingInterviews } from "@/components/dashboard/UpcomingInterviews";
import { RecentApplications } from "@/components/dashboard/RecentApplications";
import { ApplicationStatusBoard } from "@/components/dashboard/ApplicationStatusBoard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";

const stats = [
  {
    icon: Briefcase,
    label: "Total Applications",
    value: 24,
    trend: { value: 12, isPositive: true },
    iconColor: "from-blue-500/30 to-blue-600/30",
  },
  {
    icon: Clock,
    label: "Active Applications",
    value: 18,
    trend: { value: 8, isPositive: true },
    iconColor: "from-amber-500/30 to-orange-500/30",
  },
  {
    icon: CheckCircle2,
    label: "Offers Received",
    value: 3,
    trend: { value: 50, isPositive: true },
    iconColor: "from-emerald-500/30 to-green-500/30",
  },
  {
    icon: XCircle,
    label: "Rejected",
    value: 6,
    iconColor: "from-red-500/30 to-rose-500/30",
  },
];

const Index = () => {
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
              <UpcomingInterviews />
              <ApplicationStatusBoard />
            </div>
            <div className="space-y-6">
              <ActivityChart />
            </div>
          </div>

          {/* Recent Applications */}
          <RecentApplications />
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
