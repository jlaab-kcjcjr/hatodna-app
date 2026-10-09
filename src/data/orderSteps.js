// The normal path of an order, in order.
export const ORDER_STEPS = [
  { status: 'placed', short: 'Placed', label: 'Waiting for the store to accept' },
  { status: 'preparing', short: 'Preparing', label: 'Store is preparing your order' },
  { status: 'ready', short: 'Ready', label: 'Ready, a rider is picking it up' },
  { status: 'on_the_way', short: 'On the way', label: 'Rider is on the way' },
  { status: 'delivered', short: 'Delivered', label: 'Delivered' },
];

// Orders that stopped before delivery.
export const STOPPED = {
  declined: { short: 'Declined', label: 'The store declined this order' },
  cancelled: { short: 'Cancelled', label: 'You cancelled this order' },
};

export const stepIndex = (status) => ORDER_STEPS.findIndex((s) => s.status === status);

export function shortStatus(status) {
  return STOPPED[status]?.short ?? ORDER_STEPS[stepIndex(status)]?.short ?? status;
}