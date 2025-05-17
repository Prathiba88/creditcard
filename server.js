const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const port = 3000;

// Twilio credentials
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(bodyParser.json());
app.use(express.static('public'));

// 🧠 In-memory store to track spent amounts per card
const userSpending = {
  "card-1234": 0 // sample default
};

// ✅ Card limit constant
const CARD_LIMIT = 100000; // 💡 changed from 500000 to 100000

// ✅ Route: Validate card via SMS
app.post('/validateCard', (req, res) => {
  const { cardHolderName, mobileNumber } = req.body;

  const message = `Hello ${cardHolderName}, your card is validated and your card number is valid.`;
  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber,
    })
    .then(() => res.json({ success: true, message: 'Validation message sent successfully!' }))
    .catch(err => res.json({ success: false, message: err.message }));
});

// ✅ Route: Send transaction summary via SMS
app.post('/sendTransactionMessage', (req, res) => {
  const { cardHolderName, mobileNumber, creditCardNumber, totalInterest, totalAmount } = req.body;

  if (!creditCardNumber || creditCardNumber.length < 4) {
    return res.json({ success: false, message: 'Invalid credit card number.' });
  }

  const last4 = creditCardNumber.slice(-4);
  const message = `Hello ${cardHolderName}, your card ending in ${last4}: Interest = ₹${totalInterest}, Total = ₹${totalAmount}.`;

  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber,
    })
    .then(() => res.json({ success: true, message: 'Transaction message sent successfully!' }))
    .catch(err => res.json({ success: false, message: err.message }));
});

// ✅ Route: Send purchase SMS (per item/category)
app.post('/sendPurchaseSMS', (req, res) => {
  const { cardHolderName, mobileNumber, item, price, spentAmount, remainingAmount } = req.body;

  const message = `Hi ${cardHolderName}, you purchased ${item} for ₹${price}. Total spent: ₹${spentAmount}. Remaining balance: ₹${remainingAmount}.`;

  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber,
    })
    .then(() => res.json({ success: true }))
    .catch(err => res.json({ success: false, message: err.message }));
});

// ✅ NEW: Get current spent amount from backend
app.get('/getSpentAmount', (req, res) => {
  const card = req.query.card || "card-1234";
  const spent = userSpending[card] || 0;
  res.json({ spentAmount: spent });
});

// ✅ NEW: Update spent amount in backend
app.post('/updateSpentAmount', (req, res) => {
  const { card, amount } = req.body;
  if (!card || typeof amount !== 'number') {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }
  userSpending[card] = amount;
  res.json({ success: true });
});

// ✅ ✅ NEW: Purchase route with limit check and notification
app.post('/purchase', (req, res) => {
  const { card, amount } = req.body;
  if (!card || typeof amount !== 'number') {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const spent = userSpending[card] || 0;
  const remaining = CARD_LIMIT - spent;

  if (amount > remaining) {
    return res.status(403).json({
      success: false,
      message: "Your card limit is over. You can't make this purchase."
    });
  }

  userSpending[card] = spent + amount;
  return res.json({
    success: true,
    message: "Purchase successful!",
    newSpent: userSpending[card],
    remaining: CARD_LIMIT - userSpending[card]
  });
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
