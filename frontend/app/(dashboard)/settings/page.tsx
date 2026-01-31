"use client"
import { API_ENDPOINTS, API_FETCH_OPTIONS } from '@/lib/api-config'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Globe, Lock, Palette, User, CreditCard, Link, Check, Loader2, Facebook, Instagram, Linkedin } from "lucide-react"
import { BlueSky, Reddit, X } from "@/components/brand-icons"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [twitterStatus, setTwitterStatus] = useState<{ connected: boolean; username?: string }>({ connected: false })
  const [isCheckingTwitter, setIsCheckingTwitter] = useState(true)
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false)
  const [isDisconnectingTwitter, setIsDisconnectingTwitter] = useState(false)

  useEffect(() => {
    // Only check Twitter connection once on mount
    checkTwitterConnection()
  }, [])

  const checkTwitterConnection = async () => {
    setIsCheckingTwitter(true)
    try {
      const response = await fetch(API_ENDPOINTS.twitter.status, {
        ...API_FETCH_OPTIONS
      })
      const data = await response.json()

      setTwitterStatus(data)
    } catch (error) {

    } finally {
      setIsCheckingTwitter(false)
    }
  }

  const handleTwitterConnect = () => {
    // Redirect directly to backend auth endpoint
    // This ensures the session cookie is set properly before Twitter redirects back
    window.location.href = API_ENDPOINTS.twitter.auth
  }

  const handleTwitterDisconnect = async () => {
    setIsDisconnectingTwitter(true)
    try {
      const response = await fetch(API_ENDPOINTS.twitter.disconnect, {
        method: 'POST',
        ...API_FETCH_OPTIONS
      })
      const data = await response.json()

      if (data.success) {
        setTwitterStatus({ connected: false })
        toast({
          title: "Disconnected",
          description: "Twitter account has been disconnected"
        })
      }
    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to disconnect Twitter",
        variant: "destructive"
      })
    } finally {
      setIsDisconnectingTwitter(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">YY</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Avatar</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Yasnshuman Yadav" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="yanshuman2005@gmail.com" type="email" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input defaultValue="Ettara Inc." className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="utc-8">
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="utc+0">UTC</SelectItem>
                      <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Connected Accounts</CardTitle>
              <CardDescription>Manage your social media connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Twitter/X */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-background text-sm">
                    <X className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-medium">Twitter/X</span>
                    {twitterStatus.connected && (
                      <p className="text-xs text-muted-foreground">@{twitterStatus.username || "connected"}</p>
                    )}
                  </div>
                </div>
                {isCheckingTwitter ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : twitterStatus.connected ? (
                  <Badge variant="secondary" className="bg-success/20 text-success border-0">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleTwitterConnect}>
                    <Link className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>

              {/* Facebook - Connected */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-background text-sm">
                    <Facebook className="w-4 h-4 text-[#1877F2]" />
                  </span>
                  <div>
                    <span className="font-medium">Facebook</span>
                    <p className="text-xs text-muted-foreground">SocialNest Business Page</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success border-0">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>

              {/* Reddit - Connected */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-background text-sm">
                    <Reddit className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-medium">Reddit</span>
                    <p className="text-xs text-muted-foreground">u/socialnest_dev</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success border-0">
                  <Check className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              </div>

              {/* Other platforms - Disconnected with Connect Button */}
              {[
                { name: "LinkedIn", icon: <Linkedin className="w-4 h-4 text-[#0A66C2]" /> },
                { name: "Instagram", icon: <Instagram className="w-4 h-4 text-[#E4405F]" /> },
                { name: "Bluesky", icon: <BlueSky className="w-4 h-4" /> },
              ].map((account) => (
                <div key={account.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded bg-background text-sm">
                      {account.icon}
                    </span>
                    <span className="font-medium">{account.name}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Link className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" className="bg-secondary/50" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" className="bg-secondary/50" />
                </div>
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Email Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "New messages", description: "Get notified when you receive a new message" },
                { label: "Mentions", description: "Get notified when someone mentions your brand" },
                { label: "Post published", description: "Confirmation when scheduled posts are published" },
                { label: "Weekly report", description: "Receive a weekly analytics summary" },
                { label: "Team activity", description: "Get notified about team member actions" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Push Notifications</CardTitle>
              <CardDescription>Manage browser notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Desktop notifications", description: "Show notifications on your desktop" },
                { label: "Sound", description: "Play a sound when you receive a notification" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>Customize the appearance of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Color Mode</Label>
                <Select defaultValue="dark">
                  <SelectTrigger className="bg-secondary/50 w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sidebar</Label>
                <Select defaultValue="expanded">
                  <SelectTrigger className="bg-secondary/50 w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expanded">Expanded</SelectItem>
                    <SelectItem value="collapsed">Collapsed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language & Region
              </CardTitle>
              <CardDescription>Set your language and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Pro Plan</h3>
                  <Badge className="bg-primary text-primary-foreground">Active</Badge>
                </div>
                <p className="text-2xl font-bold">
                  $49<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Next billing date: February 15, 2026</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="ghost" className="text-destructive">
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 rounded bg-background flex items-center justify-center font-bold">VISA</div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
              <Button variant="outline">Add Payment Method</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
