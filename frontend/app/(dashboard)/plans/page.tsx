"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MarketingPlanViewer } from '@/components/ai/marketing-plan-viewer'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Search,
  Trash2,
  Eye,
  Calendar,
  Building2,
  Loader2
} from 'lucide-react'

interface MarketingPlan {
  _id: string
  title: string
  plan: string
  brandName?: string
  campaignName?: string
  collectedInfo?: any
  createdAt: string
  updatedAt: string
}

export default function PlansPage() {
  const { toast } = useToast()
  const [plans, setPlans] = useState<MarketingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<MarketingPlan | null>(null)
  const [showViewer, setShowViewer] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setIsLoading(true)
    try {
      const apiBase = typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api')
        : ''
      
      const response = await fetch(`${apiBase}/marketing-plans`)
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.plans || [])
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load plans',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    try {
      const apiBase = typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api')
        : ''
      
      const response = await fetch(`${apiBase}/marketing-plans/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Plan deleted successfully',
        })
        loadPlans()
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete plan',
        variant: 'destructive'
      })
    }
  }

  const handleView = (plan: MarketingPlan) => {
    setSelectedPlan(plan)
    setShowViewer(true)
  }

  const filteredPlans = plans.filter(plan =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.campaignName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Saved Marketing Plans
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your saved marketing plans
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Plans List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card className="flex items-center justify-center h-full">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Plans Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Save your first marketing plan from the AI chat'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{plan.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleView(plan)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(plan._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {plan.brandName && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{plan.brandName}</span>
                      </div>
                    )}
                    {plan.campaignName && (
                      <Badge variant="secondary">{plan.campaignName}</Badge>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(plan.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => handleView(plan)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Plan Viewer Dialog */}
      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedPlan?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedPlan && (
              <MarketingPlanViewer
                plan={selectedPlan.plan}
                brandName={selectedPlan.brandName}
                campaignName={selectedPlan.campaignName}
                collectedInfo={selectedPlan.collectedInfo}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

