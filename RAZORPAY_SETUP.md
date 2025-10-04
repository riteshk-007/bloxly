# 🔧 Razorpay Test Mode Setup

## Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Test Keys (Get from https://dashboard.razorpay.com/app/api-keys)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Webhook secret for production
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Test Mode Configuration

### 1. Development Mode (No Razorpay needed)
- If no Razorpay keys are provided, app runs in development mode
- Payments are simulated and subscriptions are activated directly
- Perfect for testing without real payment setup

### 2. Razorpay Test Mode
- Get test keys from [Razorpay Dashboard](https://dashboard.razorpay.com/app/api-keys)
- Test keys start with `rzp_test_`
- Use test card numbers for testing

## Test Card Numbers

```
Successful Payments:
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

Failed Payments:
- Card: 4000 0000 0000 0002
- Expiry: Any future date  
- CVV: Any 3 digits
```

## Testing Flow

1. **Select Plan** → Payment popup opens
2. **Enter Test Card** → Payment processes
3. **Success/Failure** → User gets feedback
4. **Subscription Updated** → Dashboard reflects changes

## Pricing (Test Mode)

- **Paid Monthly**: ₹19 (for testing)
- **Custom 30 Days**: ₹30 (for testing)

*Production prices can be updated in `/api/payment/create/route.js`*

## Security Features

✅ **User Authentication** - All APIs check session
✅ **Domain Filtering** - Users see only their data
✅ **Payment Verification** - Signature validation
✅ **Error Handling** - Proper success/failure messages

## Usage Instructions

1. **Start Development**: `npm run dev`
2. **Login**: Create account or use existing
3. **Test Payment**: Go to subscription page
4. **Verify**: Check dashboard for updated limits