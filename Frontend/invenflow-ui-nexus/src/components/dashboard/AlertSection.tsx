import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: "warning" | "critical" | "success";
  timestamp: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    title: "Low Stock Alert",
    message: 'Product "Wireless Keyboard K380" is running low on stock.',
    type: "warning",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    title: "Price Change Alert",
    message: 'Supplier increased prices for 8 items in "Electronics" category.',
    type: "critical",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    title: "Restock Complete",
    message: "Order #38291 has been received and added to inventory.",
    type: "success",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    title: "Low Stock Alert",
    message: 'Product "USB-C Charging Cable" is running low on stock.',
    type: "warning",
    timestamp: "1 day ago",
  },
];

export const AlertSection = () => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
      case "critical":
        return (
          <AlertTriangle
            className={`h-5 w-5 ${
              type === "warning" ? "text-yellow-500" : "text-red-500"
            }`}
          />
        );
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "warning":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
          >
            Warning
          </Badge>
        );
      case "critical":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
          >
            Critical
          </Badge>
        );
      case "success":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
          >
            Success
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          <Button variant="ghost" size="sm" className="text-sm">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="mr-3 mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  {getAlertBadge(alert.type)}
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertSection;
