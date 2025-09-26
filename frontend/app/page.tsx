"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
  PlayIcon,
  CloudIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/outline"
import { MainNav } from "@/components/navigation/main-nav"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/dashboard")
  }

  const handleWatchDemo = () => {
    // Could open a modal or navigate to demo page
    console.log("Watch demo clicked")
  }

  const handleConnectWallet = () => {
    router.push("/blockchain")
  }

  const handleExploreRewards = () => {
    router.push("/portfolio")
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-climate-gradient"></div>
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live on Blockchain • Join 12,543+ Climate Reporters</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              Decentralized
              <br />
              <span className="text-transparent bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text">
                Climate Reporting
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed">
              Earn rewards for sharing weather data with our global community-validated climate reporting platform
            </p>

            <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
              Join thousands of climate reporters worldwide and contribute to the future of decentralized weather data
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="bg-white text-primary hover:text-white/90 hover:border hover:border-white/80 text-lg px-8 py-4 h-14 rounded-xl font-semibold shadow-modern-lg hover:px-11 hover:bg-primary/20"
                onClick={handleGetStarted}
              >
                <ArrowRightIcon className="w-5 h-5 mr-2" />
                Start Earning Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white hover:border hover:border-primary hover:px-11 hover:text-primary text-lg px-8 py-4 h-14 rounded-xl font-semibold bg-white/5 backdrop-blur-sm"
                onClick={handleWatchDemo}
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { value: "12,543", label: "Total Reports", icon: ChartBarIcon },
                { value: "1,234", label: "Active Validators", icon: UserGroupIcon },
                { value: "245,680", label: "Total Rewards (CLT)", icon: CurrencyDollarIcon },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-white/80" />
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold">
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Three Simple Steps to
              <br />
              <span className="text-climate-gradient">Start Earning</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join a global community of climate reporters and earn rewards for contributing valuable weather data to
              our decentralized network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: ChartBarIcon,
                title: "Report Weather Data",
                description: "Submit real-time weather observations",
                detail:
                  "Share accurate weather data from your location and get rewarded with CLT tokens for every validated report",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: CheckCircleIcon,
                title: "Community Validation",
                description: "Earn by validating other reports",
                detail:
                  "Review and validate weather reports from other users to ensure data accuracy and earn additional rewards",
                color: "bg-secondary/10 text-secondary",
              },
              {
                icon: UserGroupIcon,
                title: "DAO Governance",
                description: "Shape the platform's future",
                detail: "Participate in decentralized governance to vote on platform improvements and policy changes",
                color: "bg-accent-teal/10 text-accent-teal",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-modern-lg hover:border hover:border-primary/80 transition-all duration-300 border-0 shadow-modern rounded-2xl overflow-hidden"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4 font-medium">{feature.description}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-semibold">
              Getting Started
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready in Minutes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the climate reporting revolution with our simple onboarding process
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Stake BDAG",
                  description: "Stake BDAG tokens to become a verified reporter",
                  icon: ShieldCheckIcon,
                },
                {
                  step: "02",
                  title: "Submit Reports",
                  description: "Share weather data from your location",
                  icon: CloudIcon,
                },
                {
                  step: "03",
                  title: "Get Validated",
                  description: "Community validates your reports for accuracy",
                  icon: CheckCircleIcon,
                },
                { step: "04", title: "Earn CLT", description: "Receive CLT tokens as rewards", icon: BoltIcon },
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-modern">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-modern-gradient"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Start Your
              <br />
              Climate Journey?
            </h2>
            <p className="text-xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
              Join thousands of climate reporters worldwide and start earning rewards for your weather observations
              today
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button
                size="lg"
                className="bg-white text-primary hover:text-white hover:border hover:border-white text-lg px-10 py-4 h-16 rounded-xl font-semibold shadow-modern-lg hover:px-11 hover:bg-primary/20"
                onClick={handleConnectWallet}
              >
                <GlobeAltIcon className="w-6 h-6 mr-3" />
                Connect Wallet & Start
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white text-lg px-10 py-4 hover:px-11 h-16 rounded-xl font-semibold bg-white/5 backdrop-blur-sm hover:text-primary"
                onClick={handleExploreRewards}
              >
                <CurrencyDollarIcon className="w-6 h-6 mr-3" />
                Explore Rewards
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { badge: "Live", value: "24/7", label: "Data Collection" },
                { badge: "Global", value: "150+", label: "Countries" },
                { badge: "Secure", value: "100%", label: "Blockchain" },
                { badge: "Rewards", value: "Daily", label: "Payouts" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs font-semibold">
                    {stat.badge}
                  </Badge>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-white/80 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground">
              &copy; 2025 ClimaLink. All rights reserved. Built for a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
