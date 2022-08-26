import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import {
	useStripe,
	useElements,
	PaymentElement,
} from "@stripe/react-stripe-js";

import fetchApi from "@/modules/fetch";

export default function Homepage() {
	const [intent, setIntent] = useState(undefined);

	async function setupIntent(amount) {
		setIntent(await fetchApi(`intents?amount=${amount}`));
	}

	return (
		<div className='mt-16 w-[300px] mx-auto'>
			<div className='flex flex-col gap-2'>
				{intent ? (
					<PaymentForm {...{ intent }} />
				) : (
					<SelectAmount {...{ onIntent: setupIntent }} />
				)}
			</div>
		</div>
	);
}

function parseMoney(amount) {
	return `$${amount * 0.01}`;
}

function PaymentForm({ intent }) {
	const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
	return (
		<Elements
			stripe={stripePromise}
			options={{ clientSecret: intent.client_secret }}>
			You will be charged {parseMoney(intent.amount)}
			<CheckoutForm />
		</Elements>
	);
}

function SelectAmount({ onIntent = () => {} }) {
	const [amount, setAmount] = useState("1");
	return (
		<>
			<IntegerField value={amount} onChange={setAmount} />
			<div>
				<button
					onClick={() => onIntent(amount)}
					className='border border-blue-300 rounded-sm shadow-xl py-1 px-6 w-full bg-blue-500 text-white'>
					Buy me a coffee!
				</button>
			</div>
		</>
	);
}

function CheckoutForm({ onCharge = () => {} }) {
	const [paymentElement, setPaymentElement] = useState(undefined);
	const [busy, setBusy] = useState(false);
	const [ready, setReady] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const elements = useElements();
	const stripe = useStripe();

	useEffect(() => {
		if (!elements) return;
		setPaymentElement(elements.getElement(PaymentElement));
	}, [elements]);

	useEffect(() => {
		if (!paymentElement) return;
		paymentElement.on("change", (e) => setReady(e.complete));
		paymentElement.on("ready", () => setLoaded(true));
	}, [paymentElement]);

	async function charge() {
		setBusy(true);
		const { error } = await stripe.confirmPayment({
			elements,
			redirect: "if_required",
		});
		console.dir(error);
		onCharge(error);
	}

	return (
		<>
			<PaymentElement />
			<Button disabled={busy || !loaded || !ready} onClick={charge}>
				Pay now
			</Button>
		</>
	);
}

function Button({ children, disabled = false, ...rest }) {
	const disabledClassName = "bg-gray-300 text-bg-gray-700";
	const defaultClassName =
		"border border-blue-400 bg-blue-500 text-white py-1 px-6";
	return (
		<button
			className={`${disabled ? disabledClassName : defaultClassName}`}
			disabled={disabled}
			{...rest}>
			{children}
		</button>
	);
}

function IntegerField({ value, onChange = () => {} }) {
	return (
		<TextField
			value={value}
			onChange={(val) => {
				const number = parseInt(val.replace(/[^0-9]/g, ""));
				onChange(number > 0 ? number : 1);
			}}
		/>
	);
}

function TextField({ value, onChange = () => {} }) {
	return (
		<input
			type='text'
			className='bg-white border p-2 w-full'
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}
