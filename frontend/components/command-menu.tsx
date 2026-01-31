'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
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
  Palette,
  MessageSquare,
  Video,
  Eye,
  FileText,
  Hash,
  TrendingUp,
  Bell,
  HelpCircle,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  const runCommand = React.useCallback((command: () => void) => {
    onOpenChange(false)
    command()
  }, [onOpenChange])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Main">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/dashboard'))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/create'))}
          >
            <PenSquare className="mr-2 h-4 w-4" />
            <span>Create Post</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/calendar'))}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/media'))}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            <span>Media Library</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="AI Studio">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/ai'))}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <span>NestGPT</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/canvas'))}
          >
            <Palette className="mr-2 h-4 w-4" />
            <span>Canvas Studio</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/veo'))}
          >
            <Video className="mr-2 h-4 w-4" />
            <span>Veo Studio</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Engage">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/inbox'))}
          >
            <Inbox className="mr-2 h-4 w-4" />
            <span>Inbox</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/listening'))}
          >
            <Radio className="mr-2 h-4 w-4" />
            <span>Listening</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Analyze">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/analytics'))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/competitor-analysis'))}
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>Competitor Analysis</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/ads'))}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            <span>Ads Manager</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Manage">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/crm'))}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>CRM</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/team'))}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/whiteboard'))}
          >
            <Layout className="mr-2 h-4 w-4" />
            <span>Whiteboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/settings'))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/create?type=post'))}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>New Post</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/create?type=story'))}
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>New Story</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/analytics?view=trending'))}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>View Trending</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/inbox?filter=unread'))}
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>View Unread Messages</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          <CommandItem
            onSelect={() => runCommand(() => window.open('https://docs.socialnest.com', '_blank'))}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
