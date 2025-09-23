import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { CurrencyDollarIcon, LockClosedIcon, DocumentTextIcon, TrophyIcon } from "@heroicons/react/24/outline"

const stats = [
  {
    title: "CLT Balance",
    value: "1,520",
    unit: "CLT",
    subtitle: "≈ $152",
    icon: CurrencyDollarIcon,
    color: "text-primary",
  },
  {
    title: "BDAG Staked",
    value: "100",
    unit: "BDAG",
    subtitle: "(Locked)",
    icon: LockClosedIcon,
    color: "text-secondary",
  },
  {
    title: "Reports Submitted",
    value: "23",
    unit: "",
    subtitle: "21 Valid",
    icon: DocumentTextIcon,
    color: "text-success",
  },
  {
    title: "Rewards Earned",
    value: "460",
    unit: "CLT",
    subtitle: "This Month",
    icon: TrophyIcon,
    color: "text-warning",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline space-x-1 mt-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.unit && <p className="text-sm font-medium text-muted-foreground">{stat.unit}</p>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </div>
              <div className={cn("p-3 rounded-full bg-muted/50", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
