'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('vionara_token');
      if (!token) return router.push('/login');

      try {
        const res = await fetch('/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.cart) {
          setCartItems(data.cart.items);
        }
      } catch (err) {
        setError('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const clearCart = async (token) => {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    const token = localStorage.getItem('vionara_token');
    const amount = calculateTotal();

    try {
      // 1. Create standard order in database
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          items: cartItems.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.product.price })),
          totalAmount: amount,
          shippingAddress: { street: "123 Test St", city: "Mumbai" }, // Hardcoded for demo
          paymentMethod: 'razorpay'
        })
      });
      
      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error('Failed to create internal order');
      }

      // 2. Mock Razorpay Flow (Since /api/payment/create-order is not strictly built in nextjs yet)
      // Normally here you would fetch your Razorpay Orders API for the 'rzp_order_id'
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_dummykey123", // Replace with real key
        amount: amount * 100, // Amount is in currency subunits (paise)
        currency: "INR",
        name: "Vionara Jewellery",
        description: "Test Transaction",
        handler: async function (response) {
          alert('Payment Successful! Payment ID: ' + response.razorpay_payment_id);
          // 3. Clear Cart
          await clearCart(token);
          // 4. Redirect
          router.push('/dashboard');
        },
        prefill: {
          name: "Test User",
          email: "user@example.com",
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
      });
      
      rzp.open();

    } catch (err) {
      alert('Checkout Failed: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading checkout...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      {/* Load Razorpay SDK onto page securely */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold mb-6 border-b pb-4">Checkout</h2>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Your cart is empty.</div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Order Summary</h3>
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b">
                  <span>{item.quantity} x {item.product.name}</span>
                  <span className="font-medium">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
              
              <div className="pt-4 flex justify-between items-center">
                <span className="text-xl font-bold">Total to Pay</span>
                <span className="text-2xl font-bold text-yellow-700">₹{calculateTotal()}</span>
              </div>
              
              <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Pay with Razorpay'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
