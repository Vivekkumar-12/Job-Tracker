import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  LocateFixed,
  Briefcase,
  Clock,
  IndianRupee,
  DollarSign,
  Euro,
  Bookmark,
  ExternalLink,
  Building2,
  SlidersHorizontal,
  Loader2,
  Calendar,
} from "lucide-react";

import apiClient from "@/lib/apiClient";

const jobTypes = [
  { value: "any", label: "All" },
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

const adzunaRegions = [
  { value: "worldwide", label: "Worldwide" },
  { value: "auto", label: "Auto by location" },
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "in", label: "India" },
  { value: "sg", label: "Singapore" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "es", label: "Spain" },
  { value: "it", label: "Italy" },
  { value: "nl", label: "Netherlands" },
  { value: "ie", label: "Ireland" },
  { value: "nz", label: "New Zealand" },
  { value: "za", label: "South Africa" },
  { value: "pl", label: "Poland" },
  { value: "ro", label: "Romania" },
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

// Get currency info based on country code or region
const getCurrencyInfo = (countryCode) => {
  const code = (countryCode || 'us').toLowerCase();
  const currencyMap = {
    in: { symbol: '₹', icon: <IndianRupee className="w-4 h-4" />, name: 'INR' },
    us: { symbol: '$', icon: <DollarSign className="w-4 h-4" />, name: 'USD' },
    ca: { symbol: 'C$', icon: <DollarSign className="w-4 h-4" />, name: 'CAD' },
    au: { symbol: 'A$', icon: <DollarSign className="w-4 h-4" />, name: 'AUD' },
    gb: { symbol: '£', icon: <DollarSign className="w-4 h-4" />, name: 'GBP' },
    de: { symbol: '€', icon: <Euro className="w-4 h-4" />, name: 'EUR' },
    fr: { symbol: '€', icon: <Euro className="w-4 h-4" />, name: 'EUR' },
    es: { symbol: '€', icon: <Euro className="w-4 h-4" />, name: 'EUR' },
    it: { symbol: '€', icon: <Euro className="w-4 h-4" />, name: 'EUR' },
    nl: { symbol: '€', icon: <Euro className="w-4 h-4" />, name: 'EUR' },
    ie: { symbol: '€', icon: <Euro className="w-4 h-4" />, name: 'EUR' },
    sg: { symbol: 'S$', icon: <DollarSign className="w-4 h-4" />, name: 'SGD' },
    nz: { symbol: 'NZ$', icon: <DollarSign className="w-4 h-4" />, name: 'NZD' },
    za: { symbol: 'R', icon: <DollarSign className="w-4 h-4" />, name: 'ZAR' },
    pl: { symbol: 'zł', icon: <Euro className="w-4 h-4" />, name: 'PLN' },
    ro: { symbol: 'lei', icon: <Euro className="w-4 h-4" />, name: 'RON' },
  };
  return currencyMap[code] || currencyMap['us'];
};

// Extract country code from job location
const getJobCountryCode = (location) => {
  if (!location) return 'us';
  const loc = location.toLowerCase();
  
  // Country name mappings
  const countryMappings = {
    'india': 'in',
    'united states': 'us',
    'usa': 'us',
    'canada': 'ca',
    'australia': 'au',
    'united kingdom': 'gb',
    'uk': 'gb',
    'germany': 'de',
    'france': 'fr',
    'spain': 'es',
    'italy': 'it',
    'netherlands': 'nl',
    'ireland': 'ie',
    'singapore': 'sg',
    'new zealand': 'nz',
    'south africa': 'za',
    'poland': 'pl',
    'romania': 'ro',
  };
  
  for (const [country, code] of Object.entries(countryMappings)) {
    if (loc.includes(country)) return code;
  }
  
  return 'us';
};

const formatSalary = (job) => {
  const locationCode = getJobCountryCode(job.candidate_required_location);
  const currencyInfo = getCurrencyInfo(locationCode);
  const symbol = currencyInfo.symbol || '$';

  if (job.salary && String(job.salary).trim()) return job.salary;

  const min = job.salary_min ?? job.salaryMin;
  const max = job.salary_max ?? job.salaryMax;

  if (min && max) return `${symbol}${min} - ${symbol}${max}`;
  if (min) return `${symbol}${min}+`;
  if (max) return `${symbol}${max}`;

  return null;
};

const fetchJobs = async ({ queryKey }) => {
  const [, params] = queryKey;
  const { search, jobType, category, adzunaCountry } = params;
  return apiClient.search.jobs({
    q: search || '',
    job_type: jobType || '',
    category: category || '',
    adzuna_country: adzunaCountry === "auto" || adzunaCountry === "worldwide" ? "" : adzunaCountry,
  });
};

const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [adzunaCountry, setAdzunaCountry] = useState("auto");
  const [savedJobs, setSavedJobs] = useState([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCountryCode, setDetectedCountryCode] = useState("us");
  const autoLocationAttempted = useRef(false);
  const queryClient = useQueryClient();

  // Fetch saved job listings from backend
  const { data: savedListings } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => apiClient.jobListings.getAll(),
  });

  // Update savedJobs when savedListings changes
  useEffect(() => {
    if (savedListings) {
      setSavedJobs(savedListings.map(job => job.jobUrl || job._id));
    }
  }, [savedListings]);

  // Mutation for saving a job
  const saveJobMutation = useMutation({
    mutationFn: async (jobData) => {
      return apiClient.jobListings.create(jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["saved-jobs"]);
    },
  });

  // Mutation for deleting a saved job
  const deleteJobMutation = useMutation({
    mutationFn: async (jobUrl) => {
      // Find the job listing by URL
      const savedJob = savedListings?.find(job => job.jobUrl === jobUrl);
      if (savedJob) {
        return apiClient.jobListings.delete(savedJob._id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["saved-jobs"]);
    },
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "global-jobs",
      {
        search: searchQuery,
        jobType: typeFilter,
        category: categoryFilter,
        adzunaCountry,
      },
    ],
    queryFn: fetchJobs,
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
    enabled: true, // Allow search even with empty query for worldwide/location-only searches
  });

  const detectLocation = async () => {
    if (isDetectingLocation) return;
    setIsDetectingLocation(true);
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("Location lookup failed");
      const data = await res.json();
      const countryCode = (data?.country_code || "").toLowerCase();
      if (countryCode) {
        setDetectedCountryCode(countryCode);
        setAdzunaCountry(countryCode);
      }
      await refetch();
    } catch (err) {
      // If lookup fails, we silently ignore; user can set manually.
      console.error("Auto-location failed", err?.message || err);
    } finally {
      autoLocationAttempted.current = true;
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    if (adzunaCountry === "auto" && !autoLocationAttempted.current) {
      detectLocation();
    }
  }, [adzunaCountry]);

  const toggleSave = async (job) => {
    const jobUrl = job.url || job.company_website_url;
    const isSaved = savedJobs.includes(jobUrl);

    if (isSaved) {
      // Remove from saved
      deleteJobMutation.mutate(jobUrl);
    } else {
      // Save job to backend
      const jobData = {
        title: job.title,
        company: job.company_name,
        description: job.description,
        location: job.candidate_required_location || "Remote",
        salary: job.salary,
        jobUrl: jobUrl,
        source: "other",
        skills: job.tags || [],
        isBookmarked: true,
      };
      saveJobMutation.mutate(jobData);
    }
  };

  const jobs = useMemo(() => data?.jobs || [], [data]);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;

    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    
    return jobs.filter((job) => {
      const title = (job.title || "").toLowerCase();
      const company = (job.company_name || "").toLowerCase();
      const location = (job.candidate_required_location || "").toLowerCase();

      // Match if ANY word from the search exists in title, company, or location
      return searchWords.some((word) => 
        title.includes(word) || 
        company.includes(word) || 
        location.includes(word)
      );
    });
  }, [jobs, searchQuery]);

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
                      placeholder="Search jobs by title, company, or keywords..."
                      className="pl-10 bg-secondary/50 border-border"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                      <SelectValue placeholder="Employment Type" />
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
                      <SelectValue placeholder="Job Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">All</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Select value={adzunaCountry} onValueChange={setAdzunaCountry}>
                      <SelectTrigger className="bg-secondary/50">
                        <MapPin className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Country/Region" />
                      </SelectTrigger>
                      <SelectContent>
                        {adzunaRegions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="bg-secondary/60 shrink-0"
                      onClick={detectLocation}
                      disabled={isDetectingLocation || isFetching}
                      title="Auto-detect my location"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LocateFixed className="w-4 h-4" />
                      )}
                    </Button>
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
            {filteredJobs.map((job, idx) => {
              const currencyInfo = getCurrencyInfo(getJobCountryCode(job.candidate_required_location));
              const salaryDisplay = formatSalary(job);

              return (
                <Card
                  key={job.id}
                  className="glass glass-hover opacity-0 animate-fade-in"
                  style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Company Logo */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-8 h-8 text-primary" />
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
                            onClick={() => toggleSave(job)}
                            className={
                              savedJobs.includes(job.url || job.company_website_url)
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          >
                            <Bookmark
                              className="w-5 h-5"
                              fill={savedJobs.includes(job.url || job.company_website_url) ? "currentColor" : "none"}
                            />
                          </Button>
                        </div>

                        <p className="text-muted-foreground mt-2 line-clamp-1">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {job.job_type || "Flexible"}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {currencyInfo.icon}
                            {salaryDisplay || "Not listed"}
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
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Apply for this position"
                          >
                            Apply Now
                          </a>
                        </Button>
                        {job.company_website_url && job.company_website_url !== job.url && (
                          <Button
                            variant="outline"
                            className="flex-1 lg:flex-none bg-secondary/50"
                            asChild
                          >
                            <a
                              href={job.company_website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Visit company careers page"
                            >
                              <Building2 className="w-4 h-4 mr-2" />
                              Careers
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

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
