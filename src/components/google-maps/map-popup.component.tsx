import { MapShop } from './google-maps.component';

interface Props {
  shop: MapShop;
}

export default function MapPopup({ shop }: Props) {
  const servicesText = (shop.shop_services ?? []).map(s => s.title).join(', ');
  const rating = shop.rating ?? 4.2;
  const reviewCount = shop.reviewCount ?? 0;

  return (
    <div
      style={{
        width: '260px',
        fontFamily: 'inherit',
        padding: 0,
      }}
    >
      <h3
        style={{
          margin: '0 0 4px',
          fontSize: '15px',
          fontWeight: 700,
          color: '#1e293b',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {shop.name}
      </h3>

      {servicesText && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '12px',
            color: '#8b95a5',
            lineHeight: 1.3,
          }}
        >
          {servicesText}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: '#1e293b',
            fontWeight: 500,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fe6300"
            strokeWidth="1.8"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {rating} ({reviewCount} reviews)
        </span>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: '#1e293b',
            fontWeight: 500,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fe6300"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {shop.city}, {shop.state}
        </span>
      </div>
    </div>
  );
}
