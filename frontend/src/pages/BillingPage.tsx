import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals getting started",
    current: true,
    features: [
      "1 Workspace",
      "3 Projects",
      "Unlimited Tasks",
      "Up to 5 Members",
      "Basic Integrations",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    period: "/user/month",
    description: "For growing teams that need more",
    current: false,
    features: [
      "Unlimited Workspaces",
      "Unlimited Projects",
      "Unlimited Tasks",
      "Unlimited Members",
      "Advanced Analytics",
      "Priority Support",
      "Custom Fields",
      "API Access",
    ],
  },
];

export default function BillingPage() {
  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Subscription & Billing</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose the plan that works for your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border-border relative ${!plan.current ? "ring-2 ring-primary shadow-lg" : ""}`}
            >
              {!plan.current && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                  Recommended
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.current ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  variant={plan.current ? "outline" : "default"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : "Upgrade to Pro"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
