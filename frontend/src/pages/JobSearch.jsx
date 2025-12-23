import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Loader2,
} from "lucide-react";

import apiClient from "@/lib/apiClient";

const jobTypes = [
  { value: "any", label: "Any" },
  { value: "full_time", label: "Full-time" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
  { value: "internship", label: "Internship" },
];

const categories = [
  "Software Development",
  "Customer Service",
  "Design",
  "Marketing",
  "Sales",
  "Product",
  "Data",
  "DevOps / Sysadmin",
  "Finance / Legal",
  "Human Resources",
  "QA",
];

const formatDate = (iso) => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
};

const fetchJobs = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { search, location, jobType, category, minSalary } = params;
  return apiClient.search.jobs({
    q: search,
    location,
    job_type: jobType,
    category,
    min_salary: minSalary,
  });
};

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("any");
  const [categoryFilter, setCategoryFilter] = useState("any");
  const [minSalary, setMinSalary] = useState(0);
  const [savedJobs, setSavedJobs] = useState([]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "global-jobs",
      {
        search: searchQuery,
        location: locationFilter,
        jobType: typeFilter,
        category: categoryFilter,
        minSalary,
      },
    ],
    queryFn: fetchJobs,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const toggleSave = (id) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const jobs = useMemo(() => data?.jobs || [], [data]);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const salaryValue = Number(job.salary || 0);
        const meetsSalary = !minSalary || salaryValue >= minSalary;
        return meetsSalary;
      }),
    [jobs, minSalary]
  );

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
              Discover and save jobs worldwide powered by live search
            </p>
          </div>

          {/* Search & Filters */}
          <Card className="glass opacity-0 animate-fade-in animation-delay-100">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by role, company, or skills..."
                      className="pl-10 bg-secondary/50 border-border"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && refetch()}
                    />
                  </div>
                  <div className="relative w-full lg:w-72">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Filter by location (city, country)"
                      className="pl-10 bg-secondary/50 border-border"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && refetch()}
                    />
                  </div>
                  <Button
                    variant="gradient"
                    className="w-full lg:w-auto"
                    onClick={() => refetch()}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Jobs
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-secondary/50">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-secondary/50">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-3 bg-secondary/50 rounded-md px-3 py-2 border border-border">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      placeholder="Min salary"
                      value={minSalary || ""}
                      onChange={(e) => setMinSalary(Number(e.target.value) || 0)}
                      className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
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

          {isError && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive text-sm">Failed to load jobs. Please try again.</CardTitle>
              </CardHeader>
            </Card>
          )}

          {isLoading ? (
            <Card className="glass">
              <CardContent className="p-6 flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching jobs worldwide...
              </CardContent>
            </Card>
          ) : null}

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
                      {job.company_name?.[0] || "J"}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Building2 className="w-4 h-4" />
                            <span>{job.company_name}</span>
                            <span className="text-border">•</span>
                            <MapPin className="w-4 h-4" />
                            <span>{job.candidate_required_location || "Worldwide"}</span>
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
                          {job.job_type || "Flexible"}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          {job.salary || "Not listed"}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDate(job.publication_date)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.tags?.map((tag) => (
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
                      <Button variant="gradient" className="flex-1 lg:flex-none" asChild>
                        <a
                          href={job.company_website_url || job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={job.company_website_url ? "Apply on company website" : "Apply on job board"}
                        >
                          Apply Now
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 lg:flex-none bg-secondary/50"
                        asChild
                      >
                        <a
                          href={job.company_website_url || job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={job.company_website_url ? "View on company website" : "View on job board"}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!isLoading && filteredJobs.length === 0 && (
              <Card className="glass">
                <CardContent className="p-6 text-muted-foreground">
                  No jobs matched your filters. Try adjusting search terms or filters.
                </CardContent>
              </Card>
            )}
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
