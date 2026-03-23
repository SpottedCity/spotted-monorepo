import { Report } from '@/constants/map-data';
import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import { Popup } from 'react-leaflet';

interface ReportPopupProps {
  report: Report;
}

export default function ReportPopup({ report }: ReportPopupProps) {
  return (
    <Popup minWidth={220} maxWidth={280}>
      {/*
       * We use the standard HTML <img> tag here instead of Expo's <Image> component.
       * React-Leaflet renders popups into a separate, standard browser DOM node,
       * which bypasses the React Native layout enine.
       * Expo's <Image> relies on React Native Web's complex ecosystem, which breaks inside this Leaflet environment.
       */}
      <img
        src={report.imageUrl}
        alt={report.title}
        style={{
          width: '100%',
          height: 200,
          objectFit: 'cover',
          borderRadius: SIZES.radius_lg
        }}
      />

      <h3
        style={{ margin: 0, marginTop: SIZES.lg, fontSize: SIZES.body_lg, color: Colors.primary }}
      >
        {report.title}
      </h3>
      <span
        style={{
          fontSize: SIZES.body_sm,
          color: Colors.textMuted,
          display: 'block',
          marginBottom: SIZES.sm
        }}
      >
        Dodano: {report.createdAt}
      </span>
      <p style={{ margin: 0, fontSize: SIZES.body_md, color: Colors.textMuted, lineHeight: 1.4 }}>
        {report.description}
      </p>

      <div
        style={{
          padding: `${SIZES.md}px 0px 0px 0px`,
          display: 'flex',
          gap: SIZES.sm,
          marginTop: SIZES.md,
          borderTop: `1px solid ${Colors.border}`
        }}
      >
        <button
          style={{
            flex: 1,
            padding: `${SIZES.sm}px 0`,
            borderRadius: SIZES.radius_pill,
            border: '1.5px solid #86EFAC',
            backgroundColor: '#DCFCE7',
            color: '#166534',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: SIZES.body_md,
            transition: 'all 0.2s'
          }}
          onClick={() => console.log('Ale kliknięcie :O', report.id)}
        >
          👍 {report.upvotes}
        </button>
        <button
          style={{
            flex: 1,
            padding: `${SIZES.sm}px 0`,
            borderRadius: SIZES.radius_pill,
            border: '1.5px solid #FCA5A5',
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: SIZES.body_md,
            transition: 'all 0.2s'
          }}
        >
          👎 {report.downvotes}
        </button>
      </div>
    </Popup>
  );
}
