'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Script from 'next/script';

export default function SubscriptionPage() {
    const { data: session } = useSession();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const response = await fetch('/api/user/subscription');
            if (response.ok) {
                const data = await response.json();
                setSubscription(data);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planType) => {
        setUpgradeLoading(true);
        try {
            const response = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Payment response:', data);

                if (data.development) {
                    // Development mode - subscription upgraded directly
                    alert('✅ Subscription upgraded successfully! (Development Mode)');
                    fetchSubscription(); // Refresh data
                } else if (data.orderId && data.key) {
                    // Production mode - Initialize Razorpay
                    const options = {
                        key: data.key,
                        amount: data.amount,
                        currency: data.currency,
                        order_id: data.orderId,
                        name: 'BlogMaster',
                        description: `${planType} Plan Subscription`,
                        theme: {
                            color: '#EAB308' // Yellow color
                        },
                        handler: function (response) {
                            // Payment successful
                            alert('✅ Payment Successful! Your subscription has been upgraded.');
                            fetchSubscription(); // Refresh data
                        },
                        prefill: {
                            email: session?.user?.email || '',
                            name: session?.user?.name || ''
                        },
                        modal: {
                            ondismiss: function () {
                                console.log('Payment modal closed');
                            }
                        }
                    };

                    // Check if Razorpay is loaded
                    if (typeof window.Razorpay !== 'undefined') {
                        const rzp = new window.Razorpay(options);
                        rzp.open();
                    } else {
                        // Fallback: Load Razorpay script and then open
                        const script = document.createElement('script');
                        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                        script.onload = () => {
                            const rzp = new window.Razorpay(options);
                            rzp.open();
                        };
                        document.body.appendChild(script);
                    }
                } else {
                    alert('❌ Invalid payment response received');
                }
            } else {
                const errorData = await response.json();
                alert('❌ Failed to upgrade: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('❌ Error occurred while upgrading subscription');
        } finally {
            setUpgradeLoading(false);
        }
    }; if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-yellow-500 text-xl">Loading subscription...</div>
            </div>
        );
    }

    const isExpired = subscription && new Date() > new Date(subscription.endDate);
    const daysLeft = subscription ? Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Subscription</h1>
            </div>

            {/* Current Subscription */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
                {subscription ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-white">
                                    {subscription.planType} Plan
                                    {subscription.planType === 'FREE' && ' 🆓'}
                                    {subscription.planType === 'PAID_MONTHLY' && ' 💎'}
                                    {subscription.planType === 'CUSTOM_30DAYS' && ' ⚡'}
                                </h3>
                                <p className="text-gray-400">
                                    Status:
                                    <span className={`ml-1 font-medium ${subscription.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {subscription.status}
                                    </span>
                                    {isExpired && <span className="text-red-500 ml-2">(Expired)</span>}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-medium">
                                    {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Expires: {new Date(subscription.endDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg">
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">Domains Allowed</p>
                                <p className="text-white text-xl font-bold">{subscription.domainsAllowed}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">Blogs per Domain</p>
                                <p className="text-white text-xl font-bold">{subscription.blogsPerDomain}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">Current Domains</p>
                                <p className="text-white text-xl font-bold">{subscription.currentDomains}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">No subscription found.</p>
                )}
            </div>

            {/* Available Plans */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">Available Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* FREE Plan */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">FREE Plan</h3>
                            <p className="text-3xl font-bold text-yellow-500 mb-4">₹0</p>
                            <p className="text-gray-400 text-sm mb-4">Perfect for getting started</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                1 Domain
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                5 Blogs per domain
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                1 Year validity
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                Basic support
                            </li>
                        </ul>
                        <button
                            disabled={subscription?.planType === 'FREE'}
                            className="w-full bg-gray-600 text-gray-400 py-2 px-4 rounded-lg cursor-not-allowed"
                        >
                            {subscription?.planType === 'FREE' ? 'Current Plan' : 'Downgrade Not Available'}
                        </button>
                    </div>

                    {/* PAID_MONTHLY Plan */}
                    <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500 relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                                POPULAR
                            </span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">PAID Monthly</h3>
                            <p className="text-3xl font-bold text-yellow-500 mb-4">₹49<span className="text-sm">/month</span></p>
                            <p className="text-gray-400 text-sm mb-4">Best for growing businesses</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                3 Domains
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                20 Blogs per domain
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                28-day billing cycles
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                Priority support
                            </li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade('PAID_MONTHLY')}
                            disabled={upgradeLoading || subscription?.planType === 'PAID_MONTHLY'}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            {subscription?.planType === 'PAID_MONTHLY' ? 'Current Plan' :
                                upgradeLoading ? 'Processing...' : 'Upgrade Now'}
                        </button>
                    </div>

                    {/* CUSTOM_30DAYS Plan */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white mb-2">Custom 30 Days</h3>
                            <p className="text-3xl font-bold text-yellow-500 mb-4">Custom</p>
                            <p className="text-gray-400 text-sm mb-4">For specific projects</p>
                        </div>
                        <ul className="space-y-2 mb-6">
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                Custom domains
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                30 Blogs total
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                30 Days validity
                            </li>
                            <li className="flex items-center text-gray-300">
                                <span className="text-green-500 mr-2">✓</span>
                                Custom support
                            </li>
                        </ul>
                        <button
                            onClick={() => handleUpgrade('CUSTOM_30DAYS')}
                            disabled={upgradeLoading || subscription?.planType === 'CUSTOM_30DAYS'}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            {subscription?.planType === 'CUSTOM_30DAYS' ? 'Current Plan' :
                                upgradeLoading ? 'Processing...' : 'Contact Us'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Billing History</h2>
                <div className="text-center py-8">
                    <span className="text-6xl">📄</span>
                    <p className="text-gray-400 mt-2">No billing history available</p>
                    <p className="text-gray-500 text-sm">Payment history will appear here</p>
                </div>
            </div>

            {/* Load Razorpay Script for Production */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />
        </div>
    );
}