'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('vionara_token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem('vionara_token');
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-semibold mb-6">Welcome Back!</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-4">
            <span className="text-gray-500 font-medium">Name:</span>
            <span className="font-semibold text-gray-900">{user.name}</span>
          </div>
          
          <div className="flex justify-between border-b pb-4">
            <span className="text-gray-500 font-medium">Email:</span>
            <span className="font-semibold text-gray-900">{user.email}</span>
          </div>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('vionara_token');
            router.push('/login');
          }}
          className="mt-8 bg-red-50 text-red-600 px-6 py-2 rounded border border-red-100 hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
