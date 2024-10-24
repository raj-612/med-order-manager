import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Star, Clock, TrendingDown, ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';

const LetyboOrderingPlatform = () => {
  const [selectedQuantity, setSelectedQuantity] = useState(6);
  const [commitmentLevel, setCommitmentLevel] = useState(null);
  const [initialOrder, setInitialOrder] = useState(6);
  const [showCommitmentOptions, setShowCommitmentOptions] = useState(false);

  const listPrice = 400;

  const volumePricing = [
    { vials: 6, pricePerVial: 375, discount: 6 },
    { vials: 12, pricePerVial: 350, discount: 13 },
    { vials: 24, pricePerVial: 325, discount: 19 },
    { vials: 36, pricePerVial: 290, discount: 28 },
    { vials: 54, pricePerVial: 275, discount: 31 },
    { vials: 102, pricePerVial: 250, discount: 38 }
  ];

  const commitmentLevels = [
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

  const calculatePrice = (vials, isCommitment = false) => {
    if (isCommitment && commitmentLevel) {
      return commitmentLevel.pricePerVial;
    }
    const tier = [...volumePricing]
      .reverse()
      .find(tier => vials >= tier.vials) || volumePricing[0];
    return tier.pricePerVial;
  };

  const calculateSavings = (quantity, pricePerVial) => {
    const standardCost = quantity * listPrice;
    const actualCost = quantity * pricePerVial;
    return standardCost - actualCost;
  };

  const handleSelectCommitment = (level) => {
    setCommitmentLevel(level);
    setShowCommitmentOptions(true);
    setInitialOrder(6);
  };

  const handleVolumeOrderChange = (value) => {
    setSelectedQuantity(value[0]);
    setCommitmentLevel(null);
    setShowCommitmentOptions(false);
  };

  const handleInitialOrderChange = (value) => {
    setInitialOrder(value[0]);
  };

  return (
    <Card className="w-[600px] shadow-lg overflow-hidden">
      <CardHeader className="bg-royal-blue text-white py-8 px-6">
        <CardTitle className="text-2xl font-bold">Letybo® Ordering</CardTitle>
        <CardDescription className="text-blue-100">
          Choose your preferred pricing structure
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Partnership Pricing */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-royal-blue" />
              <h3 className="text-lg font-bold">Partnership Pricing</h3>
            </div>
            <Badge className="bg-royal-blue text-white">Best Value</Badge>
          </div>
          
          <div className="space-y-4">
            {commitmentLevels.map((level) => (
              <Card 
                key={level.vials}
                className={`cursor-pointer hover:shadow-md transition-all ${
                  commitmentLevel === level ? 'ring-2 ring-royal-blue' : ''
                }`}
                onClick={() => handleSelectCommitment(level)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{level.vials} Vials Plan</h4>
                      <p className="text-sm text-gray-600">{level.description}</p>
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <TrendingDown className="h-4 w-4" />
                        Save ${level.savings.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <Clock className="h-4 w-4" />
                        4-month commitment
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-royal-blue">
                        ${level.pricePerVial}
                      </div>
                      <div className="text-sm text-gray-600">per vial</div>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        {((listPrice - level.pricePerVial) / listPrice * 100).toFixed(0)}% Off
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {showCommitmentOptions && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-royal-blue/20">
              <h4 className="font-bold mb-4">Select Initial Order Quantity</h4>
              <Slider
                min={6}
                max={commitmentLevel.vials}
                step={6}
                value={[initialOrder]}
                onValueChange={handleInitialOrderChange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Minimum: 6 vials</span>
                <span>Maximum: {commitmentLevel.vials} vials</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Initial Order</div>
                  <div className="text-lg font-bold text-royal-blue">{initialOrder}</div>
                  <div className="text-xs text-gray-500">vials</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Remaining</div>
                  <div className="text-lg font-bold text-royal-blue">
                    {commitmentLevel.vials - initialOrder}
                  </div>
                  <div className="text-xs text-gray-500">vials</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Commitment Period</div>
                  <div className="text-lg font-bold text-royal-blue">4</div>
                  <div className="text-xs text-gray-500">months</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Volume Pricing */}
        {!showCommitmentOptions && (
          <div>
            <h3 className="text-lg font-bold mb-4">Standard Volume Pricing</h3>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {volumePricing.map((tier) => (
                <div 
                  key={tier.vials}
                  className={`p-2 text-center rounded transition-all ${
                    selectedQuantity >= tier.vials ? 
                    'bg-royal-blue/10 border border-royal-blue' : 'bg-gray-50'
                  }`}
                >
                  <div className="font-bold">{tier.vials}</div>
                  <div className="text-royal-blue">${tier.pricePerVial}</div>
                  <div className="text-xs text-gray-500">{tier.discount}% off</div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Select Quantity:</label>
              <Slider
                min={6}
                max={102}
                step={6}
                value={[selectedQuantity]}
                onValueChange={handleVolumeOrderChange}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>6 vials</span>
                <span>{selectedQuantity} vials selected</span>
                <span>102 vials</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Quantity</div>
                <div className="text-xl font-bold">
                  {showCommitmentOptions ? initialOrder : selectedQuantity} vials
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Price per Vial</div>
                <div className="text-xl font-bold">
                  ${calculatePrice(selectedQuantity, showCommitmentOptions)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Price</div>
                <div className="text-xl font-bold text-royal-blue">
                  ${(showCommitmentOptions ? 
                    initialOrder * commitmentLevel.pricePerVial : 
                    selectedQuantity * calculatePrice(selectedQuantity)
                  ).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Savings</div>
                <div className="text-xl font-bold text-green-600">
                  ${calculateSavings(
                    showCommitmentOptions ? initialOrder : selectedQuantity,
                    calculatePrice(selectedQuantity, showCommitmentOptions)
                  ).toLocaleString()}
                </div>
              </div>
            </div>
            <Button className="w-full bg-royal-blue hover:bg-royal-blue/90">
              Place Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default LetyboOrderingPlatform;
