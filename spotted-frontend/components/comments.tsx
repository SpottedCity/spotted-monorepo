import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { apiClient } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { SIZES } from '@/constants/sizes';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '@/context/auth-context';

interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/comments/post/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/comments', {
        content: newComment.trim(),
        postId: postId
      });
      setNewComment('');
      fetchComments(); // Refresh list
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się dodać komentarza.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    Alert.alert('Usuń komentarz', 'Czy na pewno chcesz usunąć ten komentarz?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/comments/${commentId}`);
            fetchComments();
          } catch (error) {
            console.error(error);
            Alert.alert('Błąd', 'Nie udało się usunąć komentarza.');
          }
        }
      }
    ]);
  };

  if (isLoading) return <ActivityIndicator size="small" color={Colors.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Komentarze ({comments.length})</Text>

      {/* List of comments */}
      <View style={styles.list}>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <View style={styles.authorInfo}>
                {comment.author.avatar ? (
                  <Image source={{ uri: comment.author.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Feather name="user" size={12} color={Colors.white} />
                  </View>
                )}
                <Text style={styles.authorName}>
                  {comment.author.firstName} {comment.author.lastName}
                </Text>
              </View>
              {user?.id === comment.author.id && (
                <Pressable onPress={() => handleDelete(comment.id)}>
                  <Feather name="trash-2" size={14} color={Colors.error} />
                </Pressable>
              )}
            </View>
            <Text style={styles.content}>{comment.content}</Text>
            <Text style={styles.date}>
              {new Date(comment.createdAt).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        ))}
      </View>

      {/* Input area */}
      {user ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Dodaj komentarz..."
            placeholderTextColor={Colors.textMuted}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <Pressable
            style={[
              styles.submitButton,
              (!newComment.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Feather name="send" size={16} color={Colors.white} />
            )}
          </Pressable>
        </View>
      ) : (
        <Text style={styles.loginPrompt}>Zaloguj się, aby dodać komentarz.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.lg,
    width: '100%'
  },
  header: {
    fontSize: SIZES.body_md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: SIZES.sm
  },
  list: {
    marginBottom: SIZES.md
  },
  commentItem: {
    backgroundColor: Colors.surface,
    padding: SIZES.sm,
    borderRadius: SIZES.radius_md,
    marginBottom: SIZES.sm
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  authorName: {
    fontSize: SIZES.body_sm,
    fontWeight: '600',
    color: Colors.primary
  },
  content: {
    fontSize: SIZES.body_md,
    color: Colors.text,
    marginBottom: 4
  },
  date: {
    fontSize: 10,
    color: Colors.textMuted
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: SIZES.radius_md,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 100,
    color: Colors.text
  },
  submitButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.sm
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  loginPrompt: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: SIZES.sm
  }
});
