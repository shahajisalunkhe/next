'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    setLoading(true);
    const token = localStorage.getItem('vionara_token');
    if (!token) {
      setError('Please log in to view your cart.');
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (itemId) => {
    const token = localStorage.getItem('vionara_token');
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.cart.items);
      }
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  if (loading) return <div className="p-8 text-center">Loading cart...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 border-b pb-4">Your Shopping Cart</h2>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Your cart is empty. <Link href="/products" className="text-blue-600 hover:underline">Explore products!</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold">₹{item.product.price * item.quantity}</span>
                  <button 
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 text-sm hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="mt-8 pt-6 border-t flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-yellow-700">₹{calculateTotal()}</span>
            </div>
            
            <button className="w-full mt-6 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
