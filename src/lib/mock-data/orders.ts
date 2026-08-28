import type { Order } from '@/types/catalog';

export const orders: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'GO-2026-08421',
    date: '2026-08-05T10:20:00Z',
    status: 'out-for-delivery',
    total: 2489.5,
    itemCount: 6,
    eta: 'Today, by 6:00 PM',
    vendorName: 'TechNova Distribution',
    trackingNumber: 'GO-TRK-88421905',
    carrier: 'GoOrder Logistics',
    items: [
      {
        name: 'TechNova ProBook 14" Business Laptop',
        image:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&auto=format&fit=crop',
        quantity: 2,
        price: 1099.0,
      },
      {
        name: 'TechNova UltraWide 34" QHD Monitor',
        image:
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=200&auto=format&fit=crop',
        quantity: 1,
        price: 449.0,
      },
    ],
    timeline: [
      {
        status: 'confirmed',
        label: 'Order confirmed',
        timestamp: '2026-08-05T10:22:00Z',
        description: 'Payment verified and order confirmed with vendor.',
      },
      {
        status: 'processing',
        label: 'Processing',
        timestamp: '2026-08-05T14:00:00Z',
        description: 'Vendor is preparing your items for shipment.',
      },
      {
        status: 'packed',
        label: 'Packed',
        timestamp: '2026-08-05T18:30:00Z',
        description: 'Items packed and ready for pickup at the warehouse.',
      },
      {
        status: 'shipped',
        label: 'Shipped',
        timestamp: '2026-08-06T09:15:00Z',
        description: 'Package handed to carrier, tracking active.',
      },
      {
        status: 'out-for-delivery',
        label: 'Out for delivery',
        timestamp: '2026-08-10T07:40:00Z',
        description: 'Driver is en route to your delivery address.',
      },
      {
        status: 'delivered',
        label: 'Delivered',
        timestamp: null,
        description: 'Awaiting delivery confirmation.',
      },
    ],
  },
  {
    id: 'ord_2',
    orderNumber: 'GO-2026-08117',
    date: '2026-07-28T09:00:00Z',
    status: 'delivered',
    total: 640.75,
    itemCount: 12,
    eta: 'Delivered Aug 2',
    vendorName: 'FreshStock Wholesale',
    trackingNumber: 'GO-TRK-81176623',
    carrier: 'GoOrder Logistics',
    items: [
      {
        name: 'FreshStock Premium Arabica Coffee (5 lb Bulk Bag)',
        image:
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=200&auto=format&fit=crop',
        quantity: 8,
        price: 42.5,
      },
    ],
    timeline: [
      {
        status: 'confirmed',
        label: 'Order confirmed',
        timestamp: '2026-07-28T09:05:00Z',
        description: 'Payment verified and order confirmed with vendor.',
      },
      {
        status: 'processing',
        label: 'Processing',
        timestamp: '2026-07-28T13:00:00Z',
        description: 'Vendor prepared your items for shipment.',
      },
      {
        status: 'packed',
        label: 'Packed',
        timestamp: '2026-07-28T17:15:00Z',
        description: 'Items packed and ready for pickup at the warehouse.',
      },
      {
        status: 'shipped',
        label: 'Shipped',
        timestamp: '2026-07-29T08:00:00Z',
        description: 'Package handed to carrier, tracking active.',
      },
      {
        status: 'out-for-delivery',
        label: 'Out for delivery',
        timestamp: '2026-08-02T08:00:00Z',
        description: 'Driver was en route to delivery address.',
      },
      {
        status: 'delivered',
        label: 'Delivered',
        timestamp: '2026-08-02T11:42:00Z',
        description: 'Delivered and signed for by front desk.',
      },
    ],
  },
  {
    id: 'ord_3',
    orderNumber: 'GO-2026-07988',
    date: '2026-07-20T15:30:00Z',
    status: 'processing',
    total: 1180.0,
    itemCount: 3,
    eta: 'Aug 14 - Aug 16',
    vendorName: 'Apex Office Solutions',
    trackingNumber: 'GO-TRK-79885147',
    carrier: 'GoOrder Logistics',
    items: [
      {
        name: 'ApexRiseForm Electric Standing Desk',
        image:
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=200&auto=format&fit=crop',
        quantity: 2,
        price: 449.0,
      },
      {
        name: 'ApexErgoFlex Mesh Office Chair',
        image:
          'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=200&auto=format&fit=crop',
        quantity: 1,
        price: 249.0,
      },
    ],
    timeline: [
      {
        status: 'confirmed',
        label: 'Order confirmed',
        timestamp: '2026-07-20T15:35:00Z',
        description: 'Payment verified and order confirmed with vendor.',
      },
      {
        status: 'processing',
        label: 'Processing',
        timestamp: '2026-07-21T09:00:00Z',
        description: 'Vendor is preparing your items for shipment.',
      },
      {
        status: 'packed',
        label: 'Packed',
        timestamp: null,
        description: 'Awaiting packing at the warehouse.',
      },
      { status: 'shipped', label: 'Shipped', timestamp: null, description: 'Awaiting shipment.' },
      {
        status: 'out-for-delivery',
        label: 'Out for delivery',
        timestamp: null,
        description: 'Pending shipment.',
      },
      {
        status: 'delivered',
        label: 'Delivered',
        timestamp: null,
        description: 'Pending delivery.',
      },
    ],
  },
];

export function getOrderByNumber(orderNumber: string): Order | undefined {
  return orders.find((order) => order.orderNumber === orderNumber);
}
