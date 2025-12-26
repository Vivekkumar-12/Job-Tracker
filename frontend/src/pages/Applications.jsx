import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Trash2,
  Edit,
  Bookmark,
  Globe,
} from "lucide-react";
// Icon for enrichment (optional). If unavailable, button will show text only.
import { Wand2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/apiClient";

// Demo applications for fallback
const demoApplications = [
  {
    id: 1,
    company: "Google",
    role: "Senior Frontend Engineer",
    location: "Mountain View, CA",
    salary: "$180k - $250k",
    status: "interview",
    appliedDate: "2024-01-15",
    source: "LinkedIn",
    logo: "G",
  },
  {
    id: 2,
    company: "Meta",
    role: "React Developer",
    location: "Menlo Park, CA",
    salary: "$170k - $230k",
    status: "applied",
    appliedDate: "2024-01-14",
    source: "Company Website",
    logo: "M",
  },
  {
    id: 3,
    company: "Netflix",
    role: "UI Engineer",
    location: "Los Gatos, CA",
    salary: "$200k - $280k",
    status: "offer",
    appliedDate: "2024-01-10",
    source: "Referral",
    logo: "N",
  },
  {
    id: 4,
    company: "Amazon",
    role: "Frontend Developer",
    location: "Seattle, WA",
    salary: "$150k - $200k",
    status: "rejected",
    appliedDate: "2024-01-08",
    source: "Indeed",
    logo: "A",
  },
  {
    id: 5,
    company: "Apple",
    role: "Web Developer",
    location: "Cupertino, CA",
    salary: "$160k - $220k",
    status: "interviewing",
    appliedDate: "2024-01-12",
    source: "LinkedIn",
    logo: "A",
  },
  {
    id: 6,
    company: "Microsoft",
    role: "Software Engineer",
    location: "Redmond, WA",
    salary: "$155k - $210k",
    status: "interview",
    appliedDate: "2024-01-11",
    source: "Company Website",
    logo: "M",
  },
  {
    id: 7,
    company: "Stripe",
    role: "Full Stack Developer",
    location: "San Francisco, CA",
    salary: "$175k - $240k",
    status: "applied",
    appliedDate: "2024-01-16",
    source: "AngelList",
    logo: "S",
  },
  {
    id: 8,
    company: "Airbnb",
    role: "Frontend Engineer",
    location: "San Francisco, CA",
    salary: "$165k - $225k",
    status: "screening",
    appliedDate: "2024-01-13",
    source: "Referral",
    logo: "A",
  },
];

const statusConfig = {
  applied: {
    label: "Applied",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  assessment: {
    label: "Assessment",
    className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  interviewing: {
    label: "Interviewing",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  offered: {
    label: "Offered",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  withdrawn: {
    label: "Withdrawn",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState("");
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    status: "applied",
    appliedDate: new Date().toISOString().split('T')[0],
    jobUrl: "",
    salary: "",
    location: "",
    notes: "",
  });

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await apiClient.applications.getAll();
        setApplications(Array.isArray(data) ? data : demoApplications);
        setError(null);
      } catch (err) {
        console.warn("Failed to fetch from API, using demo data:", err);
        setApplications(demoApplications);
        setError("Using demo data - backend connection failed");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Fetch saved jobs from API
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setSavedJobsLoading(true);
        const data = await apiClient.jobListings.getAll();
        setSavedJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Failed to fetch saved jobs:", err);
        setSavedJobs([]);
      } finally {
        setSavedJobsLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleDeleteApplication = async (id) => {
    try {
      await apiClient.applications.delete(id);
      setApplications(applications.filter((app) => app.id !== id));
    } catch (err) {
      console.error("Failed to delete application:", err);
      alert("Failed to delete application");
    }
  };

  const handleDeleteSavedJob = async (id) => {
    try {
      await apiClient.jobListings.delete(id);
      setSavedJobs(savedJobs.filter((job) => job._id !== id));
    } catch (err) {
      console.error("Failed to delete saved job:", err);
      if (String(err.message || '').includes('401')) {
        alert('Please log in to delete saved jobs.');
      } else {
        alert("Failed to delete saved job");
      }
    }
  };

  const handleCreateApplicationFromJob = async (job) => {
    try {
      // Map Talent500 to ANSR as company when detected from URL
      const isTalent500 = (job.jobUrl || "").includes("talent500");
      const mappedCompany = isTalent500 ? "ANSR" : (job.company || "");
      const payload = {
        jobTitle: job.title || "",
        company: mappedCompany,
        status: "applied",
        appliedDate: new Date().toISOString().split('T')[0],
        jobUrl: job.jobUrl || "",
        salary: job.salary || "",
        location: job.location || "",
        notes: "",
      };

      if (!payload.jobTitle || !payload.company) {
        alert("Saved job is missing title or company. Please edit and try again.");
        return;
      }

      const newApp = await apiClient.applications.create(payload);
      setApplications([newApp, ...applications]);
      alert("Application created from saved job.");
    } catch (err) {
      console.error("Failed to create application from saved job:", err);
      alert("Failed to create application from saved job");
    }
  };

  const handleOpenDialog = (application = null) => {
    if (application) {
      setEditingApplication(application);
      setFormData({
        jobTitle: application.jobTitle || "",
        company: application.company || "",
        status: application.status || "applied",
        appliedDate: application.appliedDate ? new Date(application.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        jobUrl: application.jobUrl || "",
        salary: application.salary || "",
        location: application.location || "",
        notes: application.notes || "",
      });
    } else {
      setEditingApplication(null);
      setFormData({
        jobTitle: "",
        company: "",
        status: "applied",
        appliedDate: new Date().toISOString().split('T')[0],
        jobUrl: "",
        salary: "",
        location: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingApplication(null);
    setEnriching(false);
    setEnrichError("");
    setFormData({
      jobTitle: "",
      company: "",
      status: "applied",
      appliedDate: new Date().toISOString().split('T')[0],
      jobUrl: "",
      salary: "",
      location: "",
      notes: "",
    });
  };

  const handleEnrichFromUrl = async () => {
    setEnrichError("");
    const url = (formData.jobUrl || "").trim();
    if (!url) {
      setEnrichError("Please enter a job URL first.");
      return;
    }
    try {
      // Basic URL validation
      // eslint-disable-next-line no-new
      new URL(url);
    } catch (_) {
      setEnrichError("Please enter a valid URL (including http/https).");
      return;
    }

    try {
      setEnriching(true);
      const data = await apiClient.jobListings.enrich(url);
      setFormData((prev) => ({
        ...prev,
        jobTitle: data.jobTitle || prev.jobTitle,
        company: data.company || prev.company,
        location: data.location || prev.location,
        salary: data.salary || prev.salary,
      }));
    } catch (err) {
      setEnrichError(err.message || "Failed to fetch details from URL.");
    } finally {
      setEnriching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.jobTitle || !formData.company) {
      alert("Please fill in required fields: Job Title and Company");
      return;
    }

    try {
      if (editingApplication) {
        // Update existing application
        const updated = await apiClient.applications.update(editingApplication._id || editingApplication.id, formData);
        setApplications(applications.map(app => 
          (app._id || app.id) === (editingApplication._id || editingApplication.id) ? updated : app
        ));
      } else {
        // Create new application
        const newApp = await apiClient.applications.create(formData);
        setApplications([newApp, ...applications]);
      }
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save application:", err);
      alert("Failed to save application: " + (err.message || "Unknown error"));
    }
  };

  const filteredApplications = applications.filter((app) => {
    const searchWords = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const company = (app.company || "").toLowerCase();
    const title = (app.jobTitle || app.role || "").toLowerCase();

    // Match if ANY word from the search exists in the title or company (order-agnostic)
    const matchesSearch =
      searchWords.length === 0 ||
      searchWords.some((word) => title.includes(word) || company.includes(word));

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />

        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-0 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Applications</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all your job applications
              </p>
            </div>
            <Button variant="gradient" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </div>

          {/* Filters */}
          <Card className="glass opacity-0 animate-fade-in animation-delay-100">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by company or role..."
                    className="pl-10 bg-secondary/50 border-border"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-secondary/50">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Applications and Saved Jobs */}
          <Tabs defaultValue="applications" className="opacity-0 animate-fade-in animation-delay-200">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="applications">Applications ({filteredApplications.length})</TabsTrigger>
              <TabsTrigger value="saved">Saved Jobs ({savedJobs.length})</TabsTrigger>
            </TabsList>

            {/* Applications Table */}
            <TabsContent value="applications">
          <Card className="glass">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  All Applications ({filteredApplications.length})
                </CardTitle>
                {error && (
                  <span className="text-xs text-amber-500">{error}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading applications...</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Company</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Location</TableHead>
                      <TableHead className="text-muted-foreground">Salary</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Applied</TableHead>
                      <TableHead className="text-muted-foreground">Source</TableHead>
                      <TableHead className="text-muted-foreground w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow
                        key={app._id || app.id}
                        className="border-border hover:bg-secondary/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-semibold text-primary">
                              {app.logo || app.company?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span className="font-medium">{app.company}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{app.jobTitle || app.role}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {app.location}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {app.salary}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusConfig[app.status]?.className || "bg-gray-500/20 text-gray-400 border-gray-500/30"}
                          >
                            {statusConfig[app.status]?.label || app.status || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {app.source || "Direct"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(app)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  const url = app.jobUrl;
                                  if (url) {
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                  } else {
                                    alert('No job URL available for this application.');
                                  }
                                }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Job
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteApplication(app._id || app.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>

            {/* Saved Jobs Table */}
            <TabsContent value="saved">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Saved Jobs ({savedJobs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {savedJobsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">Loading saved jobs...</p>
                    </div>
                  ) : savedJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bookmark className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No saved jobs yet</p>
                      <p className="text-sm text-muted-foreground mt-1">Save jobs from the Job Search page</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Company</TableHead>
                            <TableHead className="text-muted-foreground">Title</TableHead>
                            <TableHead className="text-muted-foreground">Location</TableHead>
                            <TableHead className="text-muted-foreground">Salary</TableHead>
                            <TableHead className="text-muted-foreground">Source</TableHead>
                            <TableHead className="text-muted-foreground w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {savedJobs.map((job) => (
                            <TableRow
                              key={job._id}
                              className="border-border hover:bg-secondary/30 transition-colors"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary" />
                                  </div>
                                  <span className="font-medium">{job.company}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {job.location || "Remote"}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {job.salary || "Not specified"}
                              </TableCell>
                              <TableCell className="text-muted-foreground capitalize">
                                {job.source || "other"}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleCreateApplicationFromJob(job)}>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add to Applications
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const url = job.jobUrl;
                                        if (url) {
                                          window.open(url, '_blank', 'noopener,noreferrer');
                                        } else {
                                          alert('No job URL available for this saved job.');
                                        }
                                      }}
                                    >
                                      <Globe className="w-4 h-4 mr-2" />
                                      View Job
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDeleteSavedJob(job._id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Add/Edit Application Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingApplication ? "Edit Application" : "Add New Application"}</DialogTitle>
            <DialogDescription>
              {editingApplication ? "Update the details of your job application." : "Add a new job application to track your progress."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company <span className="text-destructive">*</span></Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Google"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="interviewing">Interviewing</SelectItem>
                      <SelectItem value="offered">Offered</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appliedDate">Applied Date</Label>
                  <Input
                    id="appliedDate"
                    name="appliedDate"
                    type="date"
                    value={formData.appliedDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g. $120k - $160k"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobUrl">Job URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="jobUrl"
                      name="jobUrl"
                      type="url"
                      value={formData.jobUrl}
                      onChange={(e) => {
                        if (enrichError) setEnrichError("");
                        handleInputChange(e);
                      }}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEnrichFromUrl}
                      disabled={enriching || !formData.jobUrl}
                    >
                      {enriching ? "Fetching..." : "Fetch"}
                    </Button>
                  </div>
                  {enrichError ? (
                    <p className="text-sm text-destructive">{enrichError}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">We'll try to prefill title, company, location and salary.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes about this application..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                {editingApplication ? "Update" : "Add"} Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Applications;
