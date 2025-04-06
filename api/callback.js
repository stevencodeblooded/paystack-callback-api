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

// Successful payment page
app.get('/verify-payment', async (req, res) => {
  const { reference, trxref } = req.query;
  
  // Use either reference or trxref parameter (Paystack may use either)
  const paymentRef = reference || trxref;
  
  if (!paymentRef) {
    return res.status(400).send(`
      <html>
        <head>
          <title>Payment Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .error { color: #e74c3c; font-weight: bold; }
            .container { background: #f9f9f9; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .btn { display: inline-block; background: #3498db; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Error: Missing Reference</h1>
            <p>No payment reference was provided.</p>
            <p>Please return to SwifMsg and try again.</p>
          </div>
        </body>
      </html>
    `);
  }
  
  // Display success page with reference code
  res.send(`
    <html>
      <head>
        <title>Payment Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            line-height: 1.6;
            color: #333;
          }
          .success { 
            color: #27ae60; 
            font-weight: bold;
            margin-bottom: 20px;
          }
          .code { 
            background: #f0f0f0; 
            padding: 15px; 
            border-radius: 6px; 
            font-family: monospace; 
            margin: 20px auto; 
            max-width: 400px; 
            font-size: 18px;
            border: 1px solid #ddd;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            user-select: all; /* Makes it easier to select the code */
          }
          .instructions { 
            background: #f9f9f9;
            border-left: 4px solid #3498db;
            max-width: 600px; 
            margin: 30px auto; 
            text-align: left;
            padding: 20px;
            border-radius: 4px;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          }
          ol { 
            padding-left: 20px; 
            margin-bottom: 0;
          }
          li {
            margin-bottom: 10px;
          }
          .copy-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
          }
          .copy-btn:hover {
            background: #2980b9;
          }
          .thank-you {
            margin-top: 30px;
            font-weight: bold;
            color: #27ae60;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">Payment Successful! 🎉</h1>
          <p>Your payment has been processed successfully.</p>
          <p>Your payment reference code is:</p>
          <div class="code" id="referenceCode">${paymentRef}</div>
          <button class="copy-btn" onclick="copyReferenceCode()">Copy Reference Code</button>
          
          <div class="instructions">
            <h3>Next Steps:</h3>
            <ol>
              <li>Copy the reference code above (or use the copy button)</li>
              <li>Return to the SwifMsg extension</li>
              <li>Go to the "Verify Payment" section</li>
              <li>Paste the reference code and click "Verify"</li>
            </ol>
          </div>
          
          <p class="thank-you">Thank you for upgrading to Premium!</p>
        </div>

        <script>
          function copyReferenceCode() {
            const refCode = document.getElementById('referenceCode').textContent;
            navigator.clipboard.writeText(refCode)
              .then(() => {
                const btn = document.querySelector('.copy-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => {
                  btn.textContent = 'Copy Reference Code';
                }, 2000);
              })
              .catch(err => {
                console.error('Failed to copy: ', err);
              });
          }
        </script>
      </body>
    </html>
  `);
});

// Failed payment page
app.get('/payment-failed', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Payment Failed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
            line-height: 1.6;
            color: #333;
          }
          .error { 
            color: #e74c3c; 
            font-weight: bold;
            margin-bottom: 20px;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
          }
          .btn {
            background: #3498db;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            display: inline-block;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">Payment Failed</h1>
          <p>We encountered an issue processing your payment.</p>
          <p>Possible reasons:</p>
          <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
            <li>Your card was declined</li>
            <li>The verification process encountered an error</li>
            <li>The payment was cancelled</li>
          </ul>
          <p>Please return to SwifMsg and try again with a different payment method.</p>
          <a href="javascript:window.close()" class="btn">Close Window</a>
        </div>
      </body>
    </html>
  `);
});

// Paystack webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  // Note: This is just a placeholder. The actual webhook handling happens in your main API
  res.status(200).send('Webhook received');
});

// Status endpoint to check if the API is running
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Paystack callback API is running' });
});

// For serverless environment, we need to export the Express app
module.exports = app;