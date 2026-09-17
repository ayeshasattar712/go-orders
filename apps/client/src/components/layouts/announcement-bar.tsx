const messages = [
  'Free shipping on orders over $500',
  'Bulk pricing for verified businesses',
  '24/7 support for procurement teams',
  'Pay by bank transfer or online',
];

export function AnnouncementBar() {
  const track = [...messages, ...messages];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden py-2 text-xs font-medium">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
        {track.map((message, index) => (
          <span key={`${message}-${index}`}>{message}</span>
        ))}
      </div>
    </div>
  );
}
