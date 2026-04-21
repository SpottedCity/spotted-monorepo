import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/constants/api';
import { SIZES } from '@/constants/sizes';
import { Colors } from '@/constants/theme';
import React, { useState } from 'react';
import { Popup } from 'react-leaflet';
import Feather from '@expo/vector-icons/Feather';
import Comments from './comments';

export interface PostReport {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  imageUrl: string | null;
  author: {
    id: string;
    firstName: string;
    avatar: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
}

interface ReportPopupProps {
  report: PostReport;
  onPostDeleted?: () => void;
}

export default function ReportPopup({ report, onPostDeleted }: ReportPopupProps) {
  const [upvotes, setUpvotes] = useState(report.upvotes);
  const [downvotes, setDownvotes] = useState(report.downvotes);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userVote, setUserVote] = useState<number>(0);

  const { user } = useAuth();
  const isAuthor = user?.id === report.author.id;

  const handleDelete = async () => {
    if (isDeleting || !isAuthor) return;

    if (window.confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) {
      setIsDeleting(true);
      try {
        await apiClient.delete(`/posts/${report.id}`);
        if (onPostDeleted) onPostDeleted();
      } catch (error) {
        console.error('Błąd usuwania:', error);
        alert('Nie udało się usunąć zgłoszenia.');
        setIsDeleting(false);
      }
    }
  };

  const handleVote = async (value: number) => {
    if (isVoting) return;

    const prevUp = upvotes;
    const prevDown = downvotes;
    const prevVote = userVote;

    setIsVoting(true);

    if (userVote === value) {
      if (value === 1) setUpvotes((prev) => prev - 1);
      if (value === -1) setDownvotes((prev) => prev - 1);
      setUserVote(0);
    } else {
      if (value === 1) {
        setUpvotes((prev) => prev + 1);
        if (userVote === -1) setDownvotes((prev) => prev - 1);
      }
      if (value === -1) {
        setDownvotes((prev) => prev + 1);
        if (userVote === 1) setUpvotes((prev) => prev - 1);
      }
      setUserVote(value);
    }

    try {
      await apiClient.post(`/votes/post/${report.id}`, { value });
    } catch (error) {
      console.error('Błąd głosowania:', error);
      setUpvotes(prevUp);
      setDownvotes(prevDown);
      setUserVote(prevVote);
    } finally {
      setIsVoting(false);
    }
  };

  const formattedDate = new Date(report.createdAt).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Popup minWidth={220} maxWidth={280}>
      {/* Report Image */}
      {report.imageUrl && (
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
      )}

      {/* Title with category information */}
      <h3
        style={{
          margin: 0,
          marginTop: report.imageUrl ? SIZES.lg : 0,
          fontSize: SIZES.body_lg,
          color: Colors.primary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{report.title}</span>
        {isAuthor && (
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: isDeleting ? 0.5 : 1,
              marginTop: '4px'
            }}
            title="Usuń swoje zgłoszenie"
          >
            <Feather name="trash-2" size={16} color={Colors.error} />
          </button>
        )}
      </h3>

      {/* Metadata */}
      <span
        style={{
          fontSize: SIZES.body_sm,
          color: Colors.textMuted,
          display: 'block',
          marginBottom: SIZES.sm,
          marginTop: 4
        }}
      >
        <strong style={{ color: Colors.textMuted }}>[{report.category.name}]</strong> • Dodano:{' '}
        {formattedDate}
        <br />
        Autor: {report.author.firstName}
      </span>

      <p style={{ margin: 0, fontSize: SIZES.body_md, color: Colors.textMuted, lineHeight: 1.4 }}>
        {report.description}
      </p>

      {/* Buttons */}
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
            transition: 'all 0.2s',
            opacity: isVoting ? 0.7 : 1
          }}
          onClick={() => handleVote(1)}
        >
          👍 {upvotes}
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
            transition: 'all 0.2s',
            opacity: isVoting ? 0.7 : 1
          }}
          onClick={() => handleVote(-1)}
        >
          👎 {downvotes}
        </button>
      </div>

      <Comments postId={report.id} />
    </Popup>
  );
}
