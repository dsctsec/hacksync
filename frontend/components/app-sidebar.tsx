"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCommandMenu } from "@/components/command-menu-provider"
import {
  Home,
  PenSquare,
  Calendar,
  ImageIcon,
  Sparkles,
  BarChart3,
  Inbox,
  Users,
  Megaphone,
  Radio,
  Layout,
  Settings,
  ChevronDown,
  Search,
  Palette,
  MessageSquare,
  Video,
  FileText,
  AlertTriangle,
  Target,
  EyeIcon,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Create", href: "/create", icon: PenSquare },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Media Library", href: "/media", icon: ImageIcon },
]

const aiSidebarItems = [
  { title: "NestGPT", href: "/ai", icon: Sparkles },
  { title: "Veo Studio", href: "/veo", icon: Video },
  { title: "Canvas Studio", href: "/canvas", icon: Palette },
  { title: "Anti-Campaign", href: "/anti-campaign", icon: AlertTriangle },
]

const engageNavItems = [
  { title: "Inbox", href: "/inbox", icon: Inbox },
  { title: "Listening", href: "/listening", icon: Radio },
]

const analyzeNavItems = [
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Competitor Analysis", href: "/competitor-analysis", icon: EyeIcon },
  { title: "Ads Manager", href: "/ads", icon: Megaphone },
  { title: "Saved Plans", href: "/plans", icon: FileText },
]

const manageNavItems = [
  { title: "CRM", href: "/crm", icon: MessageSquare },
  { title: "Team", href: "/team", icon: Users },
  { title: "Whiteboard", href: "/whiteboard", icon: Layout },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpen } = useCommandMenu()

  return (
    <Sidebar className="[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">SocialNest</span>
        </div>
        <div className="px-2 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-transparent"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-muted-foreground">Search...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground sm:flex">
              <span className="text-[10px] translate-y-[0.5px] translate-x-[1px]">⌘</span>K
            </kbd>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ai Studio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiSidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Engage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {engageNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analyze</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyzeNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/*<SidebarFooter className="border-t border-sidebar-border">

      </SidebarFooter>*/}
      <SidebarRail />
    </Sidebar>
  )
}
