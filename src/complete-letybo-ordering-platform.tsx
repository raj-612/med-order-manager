'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Star, Clock, TrendingDown } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface VolumePricing {
  vials: number;
  pricePerVial: number;
  discount: number;
}

interface CommitmentLevel {
  vials: number;
  pricePerVial: number;
  description: string;
  savings: number;
}

interface User {
  // Define the structure of your user object here
  // For example:
  id: string;
  name: string;
  // Add other relevant fields
}

interface ComponentProps {
  user: User;
}

export default function Component({ user }: ComponentProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(6);
  const [commitmentLevel, setCommitmentLevel] = useState<CommitmentLevel | null>(null);
  const [initialOrder, setInitialOrder] = useState(6);
  const [showCommitmentOptions, setShowCommitmentOptions] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const listPrice = 400;

  const volumePricing: VolumePricing[] = [
    { vials: 6, pricePerVial: 375, discount: 6 },
    { vials: 12, pricePerVial: 350, discount: 13 },
    { vials: 24, pricePerVial: 325, discount: 19 },
    { vials: 36, pricePerVial: 290, discount: 28 },
    { vials: 54, pricePerVial: 275, discount: 31 },
    { vials: 102, pricePerVial: 250, discount: 38 }
  ];

  const commitmentLevels: CommitmentLevel[] = [
    { 
      vials: 36,
      pricePerVial: 290,
      description: "Best for growing practices",
      savings: 3960
    },
    {
      vials: 54,
      pricePerVial: 275,
      description: "Perfect for established practices",
      savings: 6750
    },
    {
      vials: 102,
      pricePerVial: 250,
      description: "Ideal for high-volume practices",
      savings: 15300
    }
  ];

  const calculatePrice = (vials: number, isCommitment = false): number => {
    if (isCommitment && commitmentLevel) {
      return commitmentLevel.pricePerVial;
    }
    const tier = [...volumePricing]
      .reverse()
      .find(tier => vials >= tier.vials) || volumePricing[0];
    return tier.pricePerVial;
  };

  const calculateSavings = (quantity: number, pricePerVial: number): number => {
    const standardCost = quantity * listPrice;
    const actualCost = quantity * pricePerVial;
    return standardCost - actualCost;
  };

  const handleVolumeSelect = (vials: number) => {
    setSelectedQuantity(vials);
    setCommitmentLevel(null);
    setShowCommitmentOptions(false);
  };

  const handleVolumeOrderChange = (value: number[]) => {
    setSelectedQuantity(value[0]);
    setCommitmentLevel(null);
    setShowCommitmentOptions(false);
  };

  const handleSelectCommitment = (level: CommitmentLevel) => {
    setCommitmentLevel(level);
    setShowCommitmentOptions(true);
    setInitialOrder(6);
  };

  const handleInitialOrderChange = (value: number[]) => {
    setInitialOrder(value[0]);
  };

  const handlePlaceOrder = () => {
    setShowOrderSummary(true);
  };

  const orderSummary = () => {
    const quantity = showCommitmentOptions ? initialOrder : selectedQuantity;
    const pricePerVial = calculatePrice(selectedQuantity, showCommitmentOptions);
    const totalPrice = showCommitmentOptions && commitmentLevel
      ? initialOrder * commitmentLevel.pricePerVial
      : selectedQuantity * pricePerVial;
    const totalSavings = calculateSavings(quantity, pricePerVial);

    return `
      Quantity: ${quantity} vials
      Price per Vial: $${pricePerVial}
      Total Price: $${totalPrice.toLocaleString()}
      Total Savings: $${totalSavings.toLocaleString()}
      ${commitmentLevel ? `Commitment Plan: ${commitmentLevel.vials} Vials Plan` : 'Volume Pricing'}
    `;
  };

  return (
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground py-8 px-6">
        <CardTitle className="text-2xl font-bold">Letybo® Ordering for {user.name}</CardTitle>
        <CardDescription className="text-primary-foreground/75">
          Choose your preferred pricing structure
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4">Volume Pricing</h3>
          <div className="grid grid-cols-6 gap-2 mb-4">
            {volumePricing.map((tier) => (
              <Button
                key={tier.vials}
                variant="outline"
                className={`p-2 h-auto flex flex-col items-center transition-all ${
                  selectedQuantity >= tier.vials ? 
                  'bg-primary/10 border-primary text-primary' : 
                  'hover:bg-primary/5 hover:border-primary/50'
                }`}
                onClick={() => handleVolumeSelect(tier.vials)}
              >
                <div className="font-bold">{tier.vials}</div>
                <div className="text-current font-semibold">${tier.pricePerVial}</div>
                <Badge variant="secondary" className={`text-xs mt-1 ${
                  selectedQuantity >= tier.vials ? 
                  'bg-primary/20' : 'bg-muted'
                }`}>
                  {tier.discount}% off
                </Badge>
              </Button>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm font-medium mb-2">
              <label>Fine-tune Quantity:</label>
              <span className="text-primary">{selectedQuantity} vials selected</span>
            </div>
            <Slider
              min={6}
              max={102}
              step={6}
              value={[selectedQuantity]}
              onValueChange={handleVolumeOrderChange}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Minimum: 6 vials</span>
              <span>Maximum: 102 vials</span>
            </div>
          </div>
        </div>

        <div className="bg-accent rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">Partnership Plans</h3>
            </div>
            <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
          </div>
          
          <div className="space-y-4">
            {commitmentLevels.map((level) => (
              <Card 
                key={level.vials}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  commitmentLevel === level ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectCommitment(level)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{level.vials} Vials Plan</h4>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <TrendingDown className="h-4 w-4" />
                        Save ${level.savings.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                        <Clock className="h-4 w-4" />
                        4-month commitment
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ${level.pricePerVial}
                      </div>
                      <div className="text-sm text-muted-foreground">per vial</div>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        {((listPrice - level.pricePerVial) / listPrice * 100).toFixed(0)}% Off
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {showCommitmentOptions && commitmentLevel && (
            <div className="mt-4 bg-background rounded-lg p-4 border border-primary/20">
              <h4 className="font-bold mb-4">Select Initial Order Quantity</h4>
              <Slider
                min={6}
                max={commitmentLevel.vials}
                step={6}
                value={[initialOrder]}
                onValueChange={handleInitialOrderChange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span>Minimum: 6 vials</span>
                <span>Maximum: {commitmentLevel.vials} vials</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 bg-accent p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Initial Order</div>
                  <div className="text-lg font-bold text-primary">{initialOrder}</div>
                  <div className="text-xs text-muted-foreground">vials</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Remaining</div>
                  <div className="text-lg font-bold text-primary">
                    {commitmentLevel.vials - initialOrder}
                  </div>
                  <div className="text-xs text-muted-foreground">vials</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Period</div>
                  <div className="text-lg font-bold text-primary">4</div>
                  <div className="text-xs text-muted-foreground">months</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <Card className="bg-muted">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Quantity</div>
                <div className="text-xl font-bold">
                  {showCommitmentOptions ? initialOrder : selectedQuantity} vials
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Price per Vial</div>
                <div className="text-xl font-bold">
                  ${calculatePrice(selectedQuantity, showCommitmentOptions)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Price</div>
                <div className="text-xl font-bold text-primary">
                  ${(showCommitmentOptions && commitmentLevel ? 
                    initialOrder * commitmentLevel.pricePerVial : 
                    selectedQuantity * calculatePrice(selectedQuantity)
                  ).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Savings</div>
                <div className="text-xl font-bold text-green-600">
                  ${calculateSavings(
                    showCommitmentOptions ? initialOrder : selectedQuantity,
                    calculatePrice(selectedQuantity, showCommitmentOptions)
                  ).toLocaleString()}
                </div>
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handlePlaceOrder}>
              Place Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={showOrderSummary} onOpenChange={setShowOrderSummary}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Order Summary</AlertDialogTitle>
              <AlertDialogDescription>
                <pre className="whitespace-pre-wrap">{orderSummary()}</pre>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
