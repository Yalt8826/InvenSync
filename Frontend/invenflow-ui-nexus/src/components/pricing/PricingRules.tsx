
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PricingRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  condition: string;
  adjustment: string;
  priority: number;
}

const pricingRules: PricingRule[] = [
  {
    id: '1',
    name: 'Bulk Purchase Discount',
    description: 'Apply 10% discount for orders over $1000',
    active: true,
    condition: 'Order Total > $1000',
    adjustment: '10% discount',
    priority: 1
  },
  {
    id: '2',
    name: 'Competitor Price Match',
    description: 'Automatically match competitor prices when lower',
    active: true,
    condition: 'Competitor Price < Our Price',
    adjustment: 'Match competitor price',
    priority: 2
  },
  {
    id: '3',
    name: 'Weekend Markup',
    description: 'Apply 5% markup on weekends for high-demand items',
    active: false,
    condition: 'Day is Saturday or Sunday AND Category is "Electronics"',
    adjustment: '5% markup',
    priority: 3
  },
  {
    id: '4',
    name: 'Supplier Price Increase',
    description: 'Increase prices by supplier cost increase percentage',
    active: true,
    condition: 'Supplier Cost Increases',
    adjustment: 'Match percentage increase',
    priority: 4
  }
];

export const PricingRules = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Dynamic Pricing Rules</CardTitle>
          <Button size="sm">Add Rule</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pricingRules.map((rule, index) => (
            <div key={rule.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className="font-medium">{rule.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="ml-2 bg-blue-100 text-blue-800"
                    >
                      Priority {rule.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-xs">
                      <span className="font-medium">Condition: </span>
                      <span className="text-muted-foreground">{rule.condition}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Adjustment: </span>
                      <span className="text-muted-foreground">{rule.adjustment}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={rule.active} />
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
              {index < pricingRules.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingRules;
