import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const statusConfig = {
  applied: { label: "Applied", color: "bg-blue-500/20 text-blue-400" },
  assessment: { label: "Assessment", color: "bg-amber-500/20 text-amber-400" },
  interviewing: { label: "Interviewing", color: "bg-purple-500/20 text-purple-400" },
  offered: { label: "Offer", color: "bg-emerald-500/20 text-emerald-400" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400" },
  withdrawn: { label: "Withdrawn", color: "bg-gray-500/20 text-gray-400" },
};

const field = (label, value) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground/90">{value || "Not provided"}</p>
  </div>
);

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDatetime = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return date.toLocaleString();
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const data = await apiClient.applications.get(id);
        setApplication(data);
      } catch (err) {
        setError("Could not load application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const statusColor = statusConfig[application?.status]?.color || statusConfig.applied.color;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />
        <main className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/applications")}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
              </button>
              <h1 className="text-2xl font-bold mt-2">Application Details</h1>
              <p className="text-muted-foreground text-sm">Review the full application record</p>
            </div>
            {application?.jobUrl && (
              <Button variant="outline" size="sm" onClick={() => window.open(application.jobUrl, "_blank")}> 
                <ExternalLink className="w-4 h-4 mr-2" /> Job Posting
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="glass card-shadow">
              <CardContent className="py-10 text-center text-destructive">{error}</CardContent>
            </Card>
          ) : application ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="glass card-shadow xl:col-span-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{application.company}</CardTitle>
                      <p className="text-muted-foreground">{application.jobTitle}</p>
                    </div>
                    <Badge className={cn("text-xs", statusColor)}>
                      {statusConfig[application.status]?.label || application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {field("Applied On", formatDate(application.appliedDate))}
                    {field("Location", application.location)}
                    {field("Salary", application.salary)}
                    {field("Job URL", application.jobUrl || "Not provided")}
                  </div>
                  {application.notes && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{application.notes}</p>
                    </div>
                  )}
                  {Array.isArray(application.contacts) && application.contacts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Contacts</p>
                      <div className="space-y-2">
                        {application.contacts.map((contact, idx) => (
                          <div key={idx} className="rounded-lg border border-border/50 p-3 bg-secondary/40">
                            <p className="text-sm font-medium">{contact.name || "Contact"}</p>
                            <p className="text-xs text-muted-foreground">{contact.position || ""}</p>
                            <div className="text-xs text-muted-foreground space-x-2">
                              {contact.email && <span>{contact.email}</span>}
                              {contact.phone && <span>{contact.phone}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(application.interviewDates) && application.interviewDates.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Interview Dates</p>
                      <div className="flex flex-wrap gap-2">
                        {application.interviewDates.map((d, idx) => (
                          <Badge key={idx} variant="secondary">{formatDatetime(d)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass card-shadow">
                <CardHeader>
                  <CardTitle className="text-base">Meta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {field("Created", formatDatetime(application.createdAt))}
                  {field("Last Updated", formatDatetime(application.updatedAt))}
                  {field("Record ID", application._id || id)}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="glass card-shadow">
              <CardContent className="py-10 text-center text-muted-foreground">Application not found.</CardContent>
            </Card>
          )}
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default ApplicationDetail;
