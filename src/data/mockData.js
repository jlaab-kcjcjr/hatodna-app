// Sample data so the app works before the backend exists.
// Later, this gets replaced by API calls to your server.

export const CATEGORIES = ['All', 'Food', 'Grocery', 'Pharmacy', 'Pabili'];

export const STORES = [
  {
    id: 's1',
    name: 'Tiya Nena Carinderia',
    category: 'Food',
    town: 'Legazpi City',
    eta: '25-35 min',
    deliveryFee: 49,
    isOpen: true,
    products: [
      { id: 'p1', name: 'Bicol Express with rice', price: 95 },
      { id: 'p2', name: 'Laing with rice', price: 85 },
      { id: 'p3', name: 'Pinangat (2 pcs)', price: 70 },
      { id: 'p4', name: 'Sili ice cream', price: 60 },
    ],
  },
  {
    id: 's2',
    name: 'Daraga Pili Treats',
    category: 'Food',
    town: 'Daraga',
    eta: '30-40 min',
    deliveryFee: 59,
    isOpen: true,
    products: [
      { id: 'p5', name: 'Pili tart (box of 6)', price: 180 },
      { id: 'p6', name: 'Mazapan de pili', price: 120 },
      { id: 'p7', name: 'Candied pili nuts', price: 150 },
    ],
  },
  {
    id: 's3',
    name: 'Albay Fresh Mart',
    category: 'Grocery',
    town: 'Legazpi City',
    eta: '35-50 min',
    deliveryFee: 69,
    isOpen: true,
    products: [
      { id: 'p8', name: 'Rice 5kg', price: 290 },
      { id: 'p9', name: 'Coconut milk 400ml', price: 45 },
      { id: 'p10', name: 'Eggs (1 dozen)', price: 110 },
    ],
  },
  {
    id: 's4',
    name: 'Botika sa Tabaco',
    category: 'Pharmacy',
    town: 'Tabaco City',
    eta: '40-55 min',
    deliveryFee: 79,
    isOpen: false,
    products: [
      { id: 'p11', name: 'Paracetamol 500mg (10 tabs)', price: 45 },
      { id: 'p12', name: 'Face masks (box)', price: 120 },
    ],
  },
];