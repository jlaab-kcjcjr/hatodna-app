// Demo only. Once the backend exists, a real code is sent by SMS.
export const DEMO_OTP = '123456';

export const ORDER_STEPS = [
  { short: 'Placed', label: 'Order placed' },
  { short: 'Preparing', label: 'Store is preparing your order' },
  { short: 'On the way', label: 'Rider is on the way' },
  { short: 'Delivered', label: 'Delivered' },
];

const STEP_MS = 5000;

// Demo only: an order moves one step forward every 5 seconds after it's placed,
// so progress continues even after a page refresh. Later, the backend sends real updates.
export function statusOf(order, now = Date.now()) {
  return Math.min(Math.floor((now - order.createdAt) / STEP_MS), ORDER_STEPS.length - 1);
}