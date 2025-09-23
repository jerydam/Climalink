import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentTextIcon, CheckCircleIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"

const actions = [
  {
    title: "Submit New Report",
    description: "Share weather data from your location",
    icon: DocumentTextIcon,
    href: "/submit",
    variant: "default" as const,
  },
  {
    title: "Validate Reports",
    description: "Review and validate community reports",
    icon: CheckCircleIcon,
    href: "/validate",
    variant: "secondary" as const,
  },
  {
    title: "Create Proposal",
    description: "Propose changes to the platform",
    icon: UserGroupIcon,
    href: "/dao/create",
    variant: "outline" as const,
  },
  {
    title: "Stake More BDAG",
    description: "Increase your staking rewards",
    icon: CurrencyDollarIcon,
    href: "/portfolio/stake",
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-center space-x-2 w-full">
                  <action.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
