// api/callback.js
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Paystack callback API is running' });
});

// Paystack verification endpoint
app.get('/verify-payment', async (req, res) => {
  const { reference } = req.query;
  
  if (!reference) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Payment Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1 class="error">Error: Missing Reference</h1>
          <p>No payment reference was provided.</p>
          <p>Please return to SwiftMsg and try again.</p>
        </body>
      </html>
    `);
  }
  
  // Display success page with reference code
  res.send(`
    <html>
      <head>
        <title>Payment Successful</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
          .success { color: green; }
          .code { background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; margin: 20px auto; max-width: 400px; }
          .instructions { max-width: 600px; margin: 20px auto; text-align: left; }
          ol { padding-left: 20px; }
        </style>
      </head>
      <body>
        <h1 class="success">Payment Successful!</h1>
        <p>Your payment has been processed successfully.</p>
        <p>Your payment reference code is:</p>
        <div class="code">${reference}</div>
        
        <div class="instructions">
          <h3>Next Steps:</h3>
          <ol>
            <li>Copy the reference code above</li>
            <li>Return to the SwiftMsg extension</li>
            <li>Go to the "Verify Payment" section</li>
            <li>Paste the reference code and click "Verify"</li>
          </ol>
        </div>
        
        <p>Thank you for upgrading to Premium!</p>
      </body>
    </html>
  `);
});

// Paystack webhook endpoint
app.post('/webhook', (req, res) => {
  // In a production environment, you should validate the webhook signature
  // For now, we just log the event and return success
  console.log('Webhook received:', req.body);
  res.status(200).send('Webhook received');
});

// Status endpoint to check if the API is running
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Paystack callback API is running' });
});

// For serverless environment, we need to export the Express app
module.exports = app;