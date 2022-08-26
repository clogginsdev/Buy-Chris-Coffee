const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import createHandler from "next-connect"

const handler = createHandler()

handler.get(async (req, res) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.query.amount * 100,
        currency: 'usd',
        payment_method_types: ['card'],
    });

    res.json(paymentIntent)
})


export default handler