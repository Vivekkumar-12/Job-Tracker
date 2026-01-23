import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  Mail,
  Calendar,
  Globe,
  Smartphone,
  CreditCard,
  LogOut,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";
import { useTheme } from "next-themes";
import { requestNotificationPermission, areNotificationsEnabled } from "@/lib/notificationUtils";

const AVATAR_PREVIEW_SIZE = 96; // matches w-24 h-24
const AVATAR_EXPORT_SIZE = 512; // higher-res export for crisper avatar

const Settings = () => {
  const { user, updateProfile, logout, deleteAccount } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarImage, setAvatarImage] = useState(null);
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarOffset, setAvatarOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Network profiles state
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  
  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [pushPermissionStatus, setPushPermissionStatus] = useState("default"); // "granted", "denied", "default"
  const [isPushRequestingPermission, setIsPushRequestingPermission] = useState(false);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);

  // Data export (OTP) state
  const [exportOtp, setExportOtp] = useState("");
  const [exportOtpInput, setExportOtpInput] = useState("");
  const [exportOtpSentAt, setExportOtpSentAt] = useState(null);
  const [exportOtpVerified, setExportOtpVerified] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [disable2FAPassword, setDisable2FAPassword] = useState("");
  const [isSending2FACode, setIsSending2FACode] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      const [first = "", last = ""] = (user.username || "").split(" ");
      setFirstName(first);
      setLastName(last);
      setBio(user.bio || "");
      setIs2FAEnabled(user.twoFactorAuth?.enabled ?? false);
      const savedAvatar = localStorage.getItem("userAvatarImage");
      if (savedAvatar) {
        setAvatarImage(savedAvatar);
      } else if (user.profilePicture) {
        setAvatarImage(user.profilePicture);
      }
      if (user.notificationPreferences) {
        setEmailNotifications(user.notificationPreferences.email ?? true);
        setPushNotifications(user.notificationPreferences.push ?? true);
        setInterviewReminders(user.notificationPreferences.interview ?? true);
        setDeadlineAlerts(user.notificationPreferences.deadline ?? true);
      }
    }
  }, [user]);

  // Check notification permission status on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPushPermissionStatus(Notification.permission);
    }
  }, []);

  // Load network profiles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("networkProfiles");
    if (saved) {
      try {
        const profiles = JSON.parse(saved);
        setLinkedinUrl(profiles.linkedin || "");
        setGithubUrl(profiles.github || "");
        setPortfolioUrl(profiles.portfolio || "");
        setTwitterUrl(profiles.twitter || "");
      } catch (e) {
        console.warn("Failed to parse network profiles", e);
      }
    }
  }, []);

  // Load notification preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notificationPrefs");
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setEmailNotifications(prefs.email ?? true);
        setPushNotifications(prefs.push ?? true);
        setInterviewReminders(prefs.interview ?? true);
        setDeadlineAlerts(prefs.deadline ?? true);
      } catch (e) {
        console.warn("Failed to parse notification prefs", e);
      }
    }
  }, []);

  // Persist notification preferences when they change
  useEffect(() => {
    const prefs = {
      email: emailNotifications,
      push: pushNotifications,
      interview: interviewReminders,
      deadline: deadlineAlerts,
    };
    localStorage.setItem("notificationPrefs", JSON.stringify(prefs));
  }, [emailNotifications, pushNotifications, interviewReminders, deadlineAlerts]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Avatar must be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Only JPG, PNG, and GIF are allowed",
          variant: "destructive",
        });
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        setAvatarImage(imageData);
        setAvatarOffset({ x: 0, y: 0 });
        setAvatarScale(1);
        // Save to localStorage for persistence
        localStorage.setItem("userAvatarImage", imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const clampOffset = (offset, scale) => {
    const scaledSize = AVATAR_PREVIEW_SIZE * scale;
    const maxDelta = Math.max(0, (scaledSize - AVATAR_PREVIEW_SIZE) / 2);
    return {
      x: Math.min(Math.max(offset.x, -maxDelta), maxDelta),
      y: Math.min(Math.max(offset.y, -maxDelta), maxDelta),
    };
  };

  const handleAvatarMouseDown = (e) => {
    if (!avatarImage || e.button !== 0) return;
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: avatarOffset.x,
      originY: avatarOffset.y,
    };
    setIsDragging(true);
  };

  const handleAvatarMouseMove = (e) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const nextOffset = {
      x: dragState.current.originX + dx,
      y: dragState.current.originY + dy,
    };
    setAvatarOffset(clampOffset(nextOffset, avatarScale));
  };

  const handleAvatarMouseUp = () => {
    dragState.current.dragging = false;
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => handleAvatarMouseMove(e);
    const handleUp = () => handleAvatarMouseUp();

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!avatarImage) return;
    setAvatarOffset((prev) => clampOffset(prev, avatarScale));
  }, [avatarScale, avatarImage]);

  const generateProcessedAvatar = async () => {
    if (!avatarImage) return null;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = AVATAR_EXPORT_SIZE;
        canvas.height = AVATAR_EXPORT_SIZE;
        const ctx = canvas.getContext('2d');

        const scaleRatio = AVATAR_EXPORT_SIZE / AVATAR_PREVIEW_SIZE;
        const scaledSize = AVATAR_EXPORT_SIZE * avatarScale;
        const baseOffset = (AVATAR_EXPORT_SIZE - scaledSize) / 2;
        const drawX = baseOffset + avatarOffset.x * scaleRatio;
        const drawY = baseOffset + avatarOffset.y * scaleRatio;

        ctx.save();
        ctx.beginPath();
        ctx.arc(AVATAR_EXPORT_SIZE / 2, AVATAR_EXPORT_SIZE / 2, AVATAR_EXPORT_SIZE / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, scaledSize, scaledSize);
        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = avatarImage;
    });
  };

  const handleSaveNetworkProfiles = (e) => {
    e.preventDefault();
    const profiles = {
      linkedin: linkedinUrl.trim(),
      github: githubUrl.trim(),
      portfolio: portfolioUrl.trim(),
      twitter: twitterUrl.trim(),
    };
    localStorage.setItem("networkProfiles", JSON.stringify(profiles));
    window.dispatchEvent(new CustomEvent("networkProfilesUpdated", { detail: profiles }));
    toast({
      title: "Success",
      description: "Network profiles saved successfully",
      variant: "default",
    });
  };

  const handlePushNotificationToggle = async (enabled) => {
    if (!enabled) {
      // User is disabling push notifications
      setPushNotifications(false);
      setPushPermissionStatus("default");
      toast({
        title: "Push Notifications Disabled",
        description: "You won't receive push notifications",
      });
      return;
    }

    // User wants to enable push notifications
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in your browser",
        variant: "destructive",
      });
      return;
    }

    // Check if already granted
    if (Notification.permission === "granted") {
      setPushNotifications(true);
      setPushPermissionStatus("granted");
      toast({
        title: "Push Notifications Enabled",
        description: "You'll receive notifications on your device",
      });
      return;
    }

    // Request permission
    setIsPushRequestingPermission(true);
    try {
      const permission = await requestNotificationPermission();
      setPushPermissionStatus(permission);

      if (permission === "granted") {
        setPushNotifications(true);
        toast({
          title: "Success",
          description: "Push notifications enabled. You'll receive notifications on your device",
        });
      } else if (permission === "denied") {
        setPushNotifications(false);
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings to use this feature",
          variant: "destructive",
        });
      } else {
        // default - user dismissed the prompt
        setPushNotifications(false);
        toast({
          title: "Permission Not Granted",
          description: "You can enable notifications anytime in your browser settings",
        });
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      setPushNotifications(false);
      toast({
        title: "Error",
        description: "Failed to enable push notifications",
        variant: "destructive",
      });
    } finally {
      setIsPushRequestingPermission(false);
    }
  };

  const handleSendExportOtp = async () => {
    setIsSendingOtp(true);
    try {
      let code = "";
      try {
        const res = await apiClient.auth.sendExportOtp();
        code = res?.otp || "";
      } catch (err) {
        console.warn("OTP API failed, falling back to local mock", err);
      }

      if (!code) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
      }

      setExportOtp(code);
      setExportOtpSentAt(Date.now());
      setExportOtpVerified(false);

      toast({
        title: "OTP sent",
        description: code ? `Check your email. (Dev: ${code})` : "Check your email for the OTP.",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyExportOtp = () => {
    if (!exportOtp) {
      toast({ title: "Send OTP first", description: "Please request a code", variant: "destructive" });
      return;
    }
    // 10 minute expiry
    if (exportOtpSentAt && Date.now() - exportOtpSentAt > 10 * 60 * 1000) {
      toast({ title: "OTP expired", description: "Request a new code", variant: "destructive" });
      setExportOtp("");
      setExportOtpInput("");
      setExportOtpSentAt(null);
      setExportOtpVerified(false);
      return;
    }
    if (exportOtpInput.trim() !== exportOtp) {
      toast({ title: "Invalid code", description: "Check the 6-digit code", variant: "destructive" });
      return;
    }
    setExportOtpVerified(true);
    toast({ title: "Verified", description: "OTP verified. You can export now." });
  };

  const handleExportData = async () => {
    if (!exportOtpVerified) {
      toast({ title: "Verify OTP", description: "Please verify the code before exporting", variant: "destructive" });
      return;
    }

    try {
      setIsExporting(true);
      const payload = {
        user: {
          id: user?._id,
          username: user?.username,
          email: user?.email,
        },
        profile: {
          firstName,
          lastName,
          bio,
        },
        notifications: {
          email: emailNotifications,
          push: pushNotifications,
          interview: interviewReminders,
          deadline: deadlineAlerts,
        },
        networkProfiles: {
          linkedin: linkedinUrl,
          github: githubUrl,
          portfolio: portfolioUrl,
          twitter: twitterUrl,
        },
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jobtracker-user-data.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "Exported", description: "Your data JSON has been downloaded." });
    } catch (error) {
      toast({ title: "Export failed", description: error.message || "Unable to export data", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast({ title: "Signed out", description: "You have been signed out successfully." });
      navigate('/login');
    } catch (error) {
      toast({ title: "Error", description: error.message || "Failed to sign out", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast({ 
        title: "Password required", 
        description: "Please enter your password to delete your account",
        variant: "destructive" 
      });
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAccount(deletePassword);
      toast({ 
        title: "Account deleted", 
        description: "Your account has been permanently deleted." 
      });
      navigate('/login');
    } catch (error) {
      toast({ 
        title: "Delete failed", 
        description: error.message || "Unable to delete account", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
      setDeletePassword("");
      setShowDeleteDialog(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setIsSending2FACode(true);
      const response = await apiClient.auth.enable2FA();
      setShow2FASetup(true);
      toast({ 
        title: "Code sent", 
        description: response.message || "Check your email for the verification code"
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send verification code", 
        variant: "destructive" 
      });
    } finally {
      setIsSending2FACode(false);
    }
  };

  const handleVerify2FASetup = async () => {
    if (!twoFactorCode.trim() || twoFactorCode.length !== 6) {
      toast({ 
        title: "Invalid code", 
        description: "Please enter the 6-digit code",
        variant: "destructive" 
      });
      return;
    }

    try {
      setIsVerifying2FA(true);
      await apiClient.auth.verify2FASetup(twoFactorCode);
      setIs2FAEnabled(true);
      setShow2FASetup(false);
      setTwoFactorCode("");
      toast({ 
        title: "2FA enabled", 
        description: "Two-factor authentication has been enabled successfully" 
      });
      // Refresh user data
      if (updateProfile) {
        await updateProfile({});
      }
    } catch (error) {
      toast({ 
        title: "Verification failed", 
        description: error.message || "Invalid verification code", 
        variant: "destructive" 
      });
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disable2FAPassword.trim()) {
      toast({ 
        title: "Password required", 
        description: "Please enter your password to disable 2FA",
        variant: "destructive" 
      });
      return;
    }

    try {
      setIsDisabling2FA(true);
      await apiClient.auth.disable2FA(disable2FAPassword);
      setIs2FAEnabled(false);
      setShow2FADisable(false);
      setDisable2FAPassword("");
      toast({ 
        title: "2FA disabled", 
        description: "Two-factor authentication has been disabled" 
      });
      // Refresh user data
      if (updateProfile) {
        await updateProfile({});
      }
    } catch (error) {
      toast({ 
        title: "Failed to disable", 
        description: error.message || "Unable to disable 2FA", 
        variant: "destructive" 
      });
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const processedAvatar = await generateProcessedAvatar();
      await updateProfile({
        username: `${firstName} ${lastName}`.trim(),
        bio: bio.trim(),
        profilePicture: processedAvatar || avatarImage,
        notificationPreferences: {
          email: emailNotifications,
          push: pushNotifications,
          interview: interviewReminders,
          deadline: deadlineAlerts,
        },
      });

      if (processedAvatar) {
        localStorage.setItem("userAvatarImage", processedAvatar);
        setAvatarImage(processedAvatar);
        setAvatarOffset({ x: 0, y: 0 });
        setAvatarScale(1);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="ml-20 lg:ml-64 transition-all duration-300">
        <Header />

        <main className="p-6 space-y-6">
          {/* Page Header */}
          <div className="opacity-0 animate-fade-in">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and application preferences
            </p>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="opacity-0 animate-fade-in animation-delay-100">
            <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="w-4 h-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6 space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and how it appears
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div
                      className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground overflow-hidden select-none"
                      onMouseDown={handleAvatarMouseDown}
                      onMouseMove={handleAvatarMouseMove}
                      onMouseUp={handleAvatarMouseUp}
                      onMouseLeave={handleAvatarMouseUp}
                    >
                      {avatarImage ? (
                        <img
                          src={avatarImage}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          style={{
                            transform: `translate(${avatarOffset.x}px, ${avatarOffset.y}px) scale(${avatarScale})`,
                            transition: dragState.current.dragging ? "none" : "transform 0.12s ease",
                            cursor: dragState.current.dragging ? "grabbing" : "grab",
                          }}
                        />
                      ) : (
                        `${firstName.charAt(0)}${lastName.charAt(0)}`
                      )}
                    </div>
                    <div>
                      <label htmlFor="avatarInput">
                        <Button 
                          variant="outline" 
                          className="bg-secondary/50 cursor-pointer"
                          asChild
                        >
                          <span>Change Avatar</span>
                        </Button>
                      </label>
                      <input
                        id="avatarInput"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        JPG, PNG or GIF. Max 2MB.
                      </p>
                      {avatarImage && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Label htmlFor="avatarScale">Zoom</Label>
                            <span className="text-[11px]">Drag image to reposition</span>
                          </div>
                          <input
                            id="avatarScale"
                            type="range"
                            min="0.8"
                            max="1.8"
                            step="0.05"
                            value={avatarScale}
                            onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
                            className="w-52 accent-primary"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="bg-secondary/50"
                              onClick={() => {
                                setAvatarOffset({ x: 0, y: 0 });
                                setAvatarScale(1);
                              }}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-secondary/50"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-secondary/50"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          className="bg-secondary/50"
                          disabled
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="bg-secondary/50"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        type="button"
                        className="bg-secondary/50"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="gradient"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Network Yourself</CardTitle>
                  <CardDescription>
                    Share your profile links on your network tab
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveNetworkProfiles} className="space-y-4">
                    {/* LinkedIn */}
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-blue-600/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        LinkedIn Profile URL
                      </Label>
                      <Input
                        id="linkedin"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        type="url"
                      />
                    </div>

                    {/* GitHub */}
                    <div className="space-y-2">
                      <Label htmlFor="github" className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gray-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                        GitHub Profile URL
                      </Label>
                      <Input
                        id="github"
                        placeholder="https://github.com/yourprofile"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        type="url"
                      />
                    </div>

                    {/* Portfolio */}
                    <div className="space-y-2">
                      <Label htmlFor="portfolio" className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.606 7.995l-3.601 3.602v-3.602h3.601zm0 5.405v3.602l-3.601-3.602h3.601zm0 5.403l-3.601-3.602v3.602h3.601zm-5.404-5.403l-3.602 3.602h3.602v-3.602zM7.996 19.61l3.602-3.603h-3.602v3.603zM4.39 7.995h3.602v-3.602L4.39 7.995zm7.203 0h3.602v-3.602l-3.602 3.602zM4.39 19.61h3.602l-3.602-3.603v3.603z"/>
                          </svg>
                        </div>
                        Portfolio / Website URL
                      </Label>
                      <Input
                        id="portfolio"
                        placeholder="https://yourportfolio.com"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        type="url"
                      />
                    </div>

                    {/* Twitter */}
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-foreground/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </div>
                        X (Twitter) Profile URL
                      </Label>
                      <Input
                        id="twitter"
                        placeholder="https://x.com/yourprofile"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        type="url"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="gradient">
                        Save Network Links
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6 space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive updates via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified on your device
                        </p>
                        {pushPermissionStatus === "granted" && (
                          <p className="text-xs text-green-600 mt-1">✓ Enabled</p>
                        )}
                        {pushPermissionStatus === "denied" && (
                          <p className="text-xs text-orange-600 mt-1">⊘ Blocked in browser settings</p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={handlePushNotificationToggle}
                      disabled={isPushRequestingPermission}
                    />
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Interview Reminders</p>
                        <p className="text-sm text-muted-foreground">
                          24 hours before scheduled interviews
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={interviewReminders}
                      onCheckedChange={setInterviewReminders}
                    />
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Deadline Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          When application deadlines approach
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={deadlineAlerts}
                      onCheckedChange={setDeadlineAlerts}
                    />
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="mt-6 space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                  <CardDescription>
                    Manage your data and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Export Data (JSON)</p>
                        <p className="text-sm text-muted-foreground">
                          Validate with the email OTP, then download your data.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <Input
                        placeholder="Enter 6-digit OTP"
                        value={exportOtpInput}
                        onChange={(e) => setExportOtpInput(e.target.value)}
                        maxLength={6}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          type="button"
                          className="bg-secondary/50"
                          onClick={handleSendExportOtp}
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? "Sending..." : "Send OTP"}
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={handleVerifyExportOtp}
                        >
                          Verify
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        After verification, export your data as JSON.
                      </p>
                      <Button
                        variant="gradient"
                        type="button"
                        onClick={handleExportData}
                        disabled={isExporting || !exportOtpVerified}
                      >
                        {isExporting ? "Exporting..." : "Export Data"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">
                          {is2FAEnabled ? "Extra security is enabled" : "Add an extra layer of security"}
                        </p>
                      </div>
                    </div>
                    {is2FAEnabled ? (
                      <Button 
                        variant="outline" 
                        className="bg-secondary/50"
                        onClick={() => setShow2FADisable(true)}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="bg-secondary/50"
                        onClick={handleEnable2FA}
                        disabled={isSending2FACode}
                      >
                        {isSending2FACode ? "Sending..." : "Enable"}
                      </Button>
                    )}
                  </div>

                  {/* 2FA Setup Dialog */}
                  <AlertDialog open={show2FASetup} onOpenChange={setShow2FASetup}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Enable Two-Factor Authentication</AlertDialogTitle>
                        <AlertDialogDescription>
                          We've sent a 6-digit verification code to your email. Enter it below to enable 2FA.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="2fa-code">Verification Code</Label>
                        <Input
                          id="2fa-code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setTwoFactorCode("");
                          setShow2FASetup(false);
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          onClick={handleVerify2FASetup}
                          disabled={isVerifying2FA || twoFactorCode.length !== 6}
                        >
                          {isVerifying2FA ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & Enable"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* 2FA Disable Dialog */}
                  <AlertDialog open={show2FADisable} onOpenChange={setShow2FADisable}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter your password to disable two-factor authentication. This will make your account less secure.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="disable-2fa-password">Password</Label>
                        <Input
                          id="disable-2fa-password"
                          type="password"
                          placeholder="Enter your password"
                          value={disable2FAPassword}
                          onChange={(e) => setDisable2FAPassword(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setDisable2FAPassword("");
                          setShow2FADisable(false);
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={handleDisable2FA}
                          disabled={isDisabling2FA || !disable2FAPassword.trim()}
                        >
                          {isDisabling2FA ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Disabling...
                            </>
                          ) : (
                            "Disable 2FA"
                          )}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </p>
                      </div>
                    </div>
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                          <Label htmlFor="delete-password">Enter your password to confirm</Label>
                          <Input
                            id="delete-password"
                            type="password"
                            placeholder="Enter your password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletePassword("")}>
                            Cancel
                          </AlertDialogCancel>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting || !deletePassword.trim()}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              "Delete Account"
                            )}
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="bg-secondary/50 text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

export default Settings;
