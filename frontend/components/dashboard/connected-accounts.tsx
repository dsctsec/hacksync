"use client"
import { API_ENDPOINTS, API_FETCH_OPTIONS } from '@/lib/api-config'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BlueSky, Reddit, X } from "../brand-icons"
import { Plus, Check, Linkedin, Loader2, Facebook, Instagram } from "lucide-react"
import { useToast } from "@/hooks/use-toast"



export function ConnectedAccounts() {
  const { toast } = useToast()
  const [twitterStatus, setTwitterStatus] = useState<{ connected: boolean; username?: string }>({ connected: false })
  const [isCheckingTwitter, setIsCheckingTwitter] = useState(true)
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false)
  const [isDisconnectingTwitter, setIsDisconnectingTwitter] = useState(false)

  useEffect(() => {
    checkTwitterConnection()
  }, [])

  const checkTwitterConnection = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.twitter.status, {
        ...API_FETCH_OPTIONS
      })
      const data = await response.json()
      setTwitterStatus(data)
    } catch (error) {
      console.error('Error checking Twitter connection:', error)
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
      console.error('Error disconnecting Twitter:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect Twitter",
        variant: "destructive"
      })
    } finally {
      setIsDisconnectingTwitter(false)
    }
  }

  const socialPlatforms = [
    {
      name: "Twitter/X",
      icon: <X className="w-4 h-4" />,
      connected: twitterStatus.connected,
      followers: twitterStatus.username ? `@${twitterStatus.username}` : null,
      status: twitterStatus.connected ? "active" : "disconnected",
      isLoading: isCheckingTwitter,
      isConnecting: isConnectingTwitter,
      isDisconnecting: isDisconnectingTwitter,
      onConnect: handleTwitterConnect,
      onDisconnect: handleTwitterDisconnect,
      comingSoon: false,
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-4 h-4" />,
      connected: true,
      followers: "3.8K",
      status: "active",
      comingSoon: false,
    },
    {
      name: "Reddit",
      icon: <Reddit className="w-4 h-4" />,
      connected: true,
      followers: "12.4K",
      status: "active",
      comingSoon: false,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4" />,
      connected: false,
      followers: null,
      status: "disconnected",
      comingSoon: false,
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-4 h-4" />,
      connected: false,
      followers: null,
      status: "disconnected",
      comingSoon: false,
    },
    {
      name: "Bluesky",
      icon: <BlueSky className="w-4 h-4"/>,
      connected: false,
      followers: null,
      status: "disconnected",
      comingSoon: false,
    },
  ]

  return (
    <Card className="bg-card ">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Social Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 -mt-2">
          {socialPlatforms.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 p-1.5 items-center justify-center rounded-md bg-background text-sm font-medium">
                  {platform.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{platform.name}</p>

                </div>
              </div>

              {platform.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : platform.connected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-success/20 text-success border-0">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>

                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={platform.onConnect}
                  disabled={platform.comingSoon || platform.isConnecting}
                >
                  {platform.isConnecting ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-6 bg-white border-border rounded-sm w-full">
          <Plus className="h-4 w-4 mr-2" />
          Connect more account
        </Button>
      </CardContent>
    </Card>

  )
}
