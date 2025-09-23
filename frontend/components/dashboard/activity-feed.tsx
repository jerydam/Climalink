import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircleIcon, DocumentTextIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"

const activities = [
  {
    id: 1,
    type: "validation",
    message: "Your report #1234 was validated",
    reward: "+20 CLT",
    time: "2 hours ago",
    icon: CheckCircleIcon,
    color: "text-success",
  },
  {
    id: 2,
    type: "report",
    message: "You submitted report for Miami, FL",
    reward: null,
    time: "4 hours ago",
    icon: DocumentTextIcon,
    color: "text-primary",
  },
  {
    id: 3,
    type: "vote",
    message: "You voted on Proposal #56",
    reward: null,
    time: "1 day ago",
    icon: UserGroupIcon,
    color: "text-secondary",
  },
  {
    id: 4,
    type: "reward",
    message: "Earned 40 CLT from validations",
    reward: "+40 CLT",
    time: "2 days ago",
    icon: CurrencyDollarIcon,
    color: "text-warning",
  },
]

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={cn("p-2 rounded-full bg-muted/50", activity.color)}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.message}</p>
                  {activity.reward && (
                    <Badge variant="secondary" className="ml-2">
                      {activity.reward}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
