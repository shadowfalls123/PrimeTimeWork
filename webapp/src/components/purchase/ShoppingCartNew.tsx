import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ArrowRight,
  Package,
  Tag,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

interface CartItem {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  duration: string;
  examCount: number;
  image?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const ShoppingCartNew: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get cart state from Redux (assuming it exists)
  const { items, total } = useSelector((state: any) => state.cart as CartState);
  
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const handleRemoveItem = (itemId: string) => {
    // Dispatch remove action
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    dispatch({ 
      type: 'UPDATE_CART_QUANTITY', 
      payload: { id: itemId, quantity: newQuantity } 
    });
  };

  const handleApplyPromo = () => {
    // Simple promo code logic
    if (promoCode.toLowerCase() === 'save10') {
      setDiscount(total * 0.1);
    } else if (promoCode.toLowerCase() === 'welcome20') {
      setDiscount(total * 0.2);
    } else {
      setDiscount(0);
      alert('Invalid promo code');
    }
  };

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    
    setIsLoading(true);
    
    // Navigate to checkout with cart data
    navigate('/checkout', { 
      state: { 
        items, 
        subtotal: total, 
        discount, 
        finalTotal: total - discount 
      } 
    });
  };

  const subtotal = total;
  const finalTotal = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="container-padding content-max-width py-8">
        <div className="text-center py-12">
          <div className="p-4 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any exam packages to your cart yet.
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/searchpack')}
          >
            <Package className="h-4 w-4 mr-2" />
            Browse Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-padding content-max-width py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <ShoppingCart className="h-6 w-6 text-sage-600" />
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
        <p className="text-gray-600">
          {items.length} item{items.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Item Image Placeholder */}
                  <div className="w-20 h-20 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="h-8 w-8 text-sage-600" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{item.examCount} exams</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{item.duration}</span>
                      </div>
                      <Badge variant="outline" size="sm">
                        {item.category}
                      </Badge>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="text-sm text-gray-500 line-through">
                        ${(item.originalPrice * item.quantity).toFixed(2)}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} each
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Promo Code */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-sage-600" />
                <h3 className="text-lg font-semibold">Promo Code</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage-500 focus:border-sage-500"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyPromo}
                  disabled={!promoCode.trim()}
                >
                  Apply
                </Button>
              </div>
              {discount > 0 && (
                <div className="text-sm text-green-600">
                  ✓ Promo code applied! You saved ${discount.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Order Summary</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={handleProceedToCheckout}
                disabled={isLoading}
                loading={isLoading}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/searchpack')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-sage-50 border-sage-200">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-sage-700">
                  <p className="font-medium mb-1">🔒 Secure Checkout</p>
                  <p>Your payment information is encrypted and secure.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartNew;