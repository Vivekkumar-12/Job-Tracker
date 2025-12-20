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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const applications = [
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
    status: "screening",
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
  screening: {
    label: "Screening",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  interview: {
    label: "Interview",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  offer: {
    label: "Offer",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

const Applications = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
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
            <Button variant="gradient">
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
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card className="glass opacity-0 animate-fade-in animation-delay-200">
            <CardHeader>
              <CardTitle className="text-lg">
                All Applications ({filteredApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                        key={app.id}
                        className="border-border hover:bg-secondary/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-semibold text-primary">
                              {app.logo}
                            </div>
                            <span className="font-medium">{app.company}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{app.role}</TableCell>
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
                            className={statusConfig[app.status].className}
                          >
                            {statusConfig[app.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(app.appliedDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {app.source}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Job
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
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
            </CardContent>
          </Card>
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

export default Applications;
