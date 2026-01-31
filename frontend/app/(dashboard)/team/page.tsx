"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserPlus, MoreHorizontal, Mail, Shield, Pencil, Trash2, Check, Clock } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  status: "active" | "pending"
  lastActive?: string
}

const teamMembers: TeamMember[] = [
  { id: "1", name: "Yanshuman Yadav", email: "yanshuman.yadav@gmail.com", role: "admin", status: "active", lastActive: "Just now" },
  { id: "2", name: "Vaibhav Sharma", email: "vaiibhav@gmail.com", role: "editor", status: "active", lastActive: "Just Now" },
  {
    id: "3",
    name: "Vinayak Mohanty",
    email: "vinayak.mohanty@gmail.com",
    role: "editor",
    status: "active",
  },
  { id: "4", name: "Devansh Nair", email: "devansh.nair@gmail.com", role: "viewer", status: "active" },
]

const rolePermissions = {
  admin: ["Full access to all features", "Manage team members", "Billing and account settings"],
  editor: ["Create and edit posts", "Access analytics", "Manage inbox"],
  viewer: ["View posts and analytics", "Comment on drafts", "Limited inbox access"],
}

export default function TeamPage() {
  const [members, setMembers] = useState(teamMembers)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor")

  const handleInvite = () => {
    if (inviteEmail) {
      const newMember: TeamMember = {
        id: Math.random().toString(36).substr(2, 9),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        status: "pending",
      }
      setMembers([...members, newMember])
      setInviteEmail("")
    }
  }

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  const handleRoleChange = (id: string, role: "admin" | "editor" | "viewer") => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role } : m)))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Invite members and manage roles</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your workspace</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "editor" | "viewer")}>
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  {rolePermissions[inviteRole].map((perm, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-primary" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleInvite} disabled={!inviteEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Team Members</CardTitle>
          <CardDescription>{members.length} members in your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      {member.status === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {member.lastActive && (
                    <span className="text-sm text-muted-foreground hidden md:block">{member.lastActive}</span>
                  )}
                  <Select
                    value={member.role}
                    onValueChange={(v) => handleRoleChange(member.id, v as "admin" | "editor" | "viewer")}
                  >
                    <SelectTrigger className="w-[120px] bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleRemove(member.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Workflows */}
      {/*<Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Approval Workflows</CardTitle>
          <CardDescription>Configure content approval requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require approval for publishing</p>
              <p className="text-sm text-muted-foreground">Editors must get admin approval before publishing</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notify on new drafts</p>
              <p className="text-sm text-muted-foreground">Get notified when team members create new drafts</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-assign reviewers</p>
              <p className="text-sm text-muted-foreground">Automatically assign admins to review new content</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>*/}

      {/* Role Permissions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Role Permissions</CardTitle>
          <CardDescription>Overview of what each role can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {(["admin", "editor", "viewer"] as const).map((role) => (
              <div key={role} className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="font-medium capitalize">{role}</p>
                </div>
                <ul className="space-y-2">
                  {rolePermissions[role].map((perm, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
