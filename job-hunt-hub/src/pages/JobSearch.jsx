import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Bookmark,
  ExternalLink,
  Building2,
  SlidersHorizontal,
} from "lucide-react";

const jobs = [
  {
    id: 1,
    company: "Spotify",
    role: "Senior Frontend Engineer",
    location: "Stockholm, Sweden (Remote)",
    type: "Full-time",
    salary: "$140k - $180k",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "GraphQL"],
    logo: "S",
    description: "Build the next generation of music streaming experience...",
    saved: false,
  },
  {
    id: 2,
    company: "Figma",
    role: "UI Engineer",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$160k - $200k",
    posted: "1 day ago",
    tags: ["React", "Canvas", "WebGL"],
    logo: "F",
    description: "Help create the future of collaborative design tools...",
    saved: true,
  },
  {
    id: 3,
    company: "Notion",
    role: "Full Stack Developer",
    location: "New York, NY (Hybrid)",
    type: "Full-time",
    salary: "$150k - $190k",
    posted: "3 days ago",
    tags: ["React", "Node.js", "PostgreSQL"],
    logo: "N",
    description: "Join us in building the all-in-one workspace...",
    saved: false,
  },
  {
    id: 4,
    company: "Vercel",
    role: "Developer Experience Engineer",
    location: "Remote",
    type: "Full-time",
    salary: "$145k - $185k",
    posted: "5 hours ago",
    tags: ["Next.js", "TypeScript", "Edge"],
    logo: "V",
    description: "Shape the future of web development...",
    saved: false,
  },
  {
    id: 5,
    company: "Linear",
    role: "Frontend Engineer",
    location: "Remote (US)",
    type: "Full-time",
    salary: "$155k - $195k",
    posted: "1 week ago",
    tags: ["React", "TypeScript", "Electron"],
    logo: "L",
    description: "Build a faster way to build software...",
    saved: true,
  },
  {
    id: 6,
    company: "Discord",
    role: "React Developer",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$165k - $210k",
    posted: "4 days ago",
    tags: ["React", "Redux", "WebRTC"],
    logo: "D",
    description: "Create features for millions of communities...",
    saved: false,
  },
];

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState(
    jobs.filter((j) => j.saved).map((j) => j.id)
  );

  const toggleSave = (id) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesLocation =
      locationFilter === "all" ||
      (locationFilter === "remote" &&
        job.location.toLowerCase().includes("remote")) ||
      (locationFilter === "onsite" &&
        !job.location.toLowerCase().includes("remote"));
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />

        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="opacity-0 animate-fade-in">
            <h1 className="text-2xl font-bold">Job Search</h1>
            <p className="text-muted-foreground mt-1">
              Discover and save jobs that match your skills
            </p>
          </div>

          {/* Search & Filters */}
          <Card className="glass opacity-0 animate-fade-in animation-delay-100">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by role, company, or skills..."
                    className="pl-10 bg-secondary/50 border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-40 bg-secondary/50">
                      <MapPin className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-secondary/50">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results count */}
          <div className="flex items-center justify-between opacity-0 animate-fade-in animation-delay-200">
            <p className="text-muted-foreground">
              Found <span className="text-foreground font-medium">{filteredJobs.length}</span> jobs
            </p>
            <p className="text-sm text-muted-foreground">
              <Bookmark className="w-4 h-4 inline mr-1" />
              {savedJobs.length} saved
            </p>
          </div>

          {/* Job Listings */}
          <div className="grid gap-4">
            {filteredJobs.map((job, idx) => (
              <Card
                key={job.id}
                className="glass glass-hover opacity-0 animate-fade-in"
                style={{ animationDelay: `${(idx + 3) * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                      {job.logo}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{job.role}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company}</span>
                            <span className="text-border">•</span>
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSave(job.id)}
                          className={
                            savedJobs.includes(job.id)
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          <Bookmark
                            className="w-5 h-5"
                            fill={savedJobs.includes(job.id) ? "currentColor" : "none"}
                          />
                        </Button>
                      </div>

                      <p className="text-muted-foreground mt-2 line-clamp-1">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {job.posted}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="bg-secondary/50 border-border text-muted-foreground"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:shrink-0">
                      <Button variant="gradient" className="flex-1 lg:flex-none">
                        Apply Now
                      </Button>
                      <Button variant="outline" className="flex-1 lg:flex-none bg-secondary/50">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default JobSearch;
