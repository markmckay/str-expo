import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Book, Play, Clock, Star } from 'lucide-react-native';
import { logger } from '@/utils/logger';

interface BookItem {
  id: string;
  title: string;
  author: string;
  duration: string;
  progress: number;
  rating: number;
  coverUrl: string;
}

const SAMPLE_BOOKS: BookItem[] = [
  {
    id: '1',
    title: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    duration: '3h 12m',
    progress: 0,
    rating: 4.5,
    coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'
  },
  {
    id: '2',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    duration: '4h 49m',
    progress: 0.3,
    rating: 4.2,
    coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    duration: '12h 17m',
    progress: 0.7,
    rating: 4.8,
    coverUrl: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&fit=crop'
  }
];

export default function LibraryScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = logger.startTimer('LibraryScreen_Load');
    logger.info('Screen', 'Library screen mounted');
    logger.logUserAction('screen_view', 'Library', { booksCount: SAMPLE_BOOKS.length });
    
    timer();
    
    return () => {
      logger.info('Screen', 'Library screen unmounted');
    };
  }, []);

  const handleBookPress = (book: BookItem) => {
    logger.logUserAction('book_select', 'Library', { 
      bookId: book.id, 
      bookTitle: book.title,
      progress: book.progress 
    });
    
    if (book.id === '1') {
      logger.logNavigation('Library', 'AliceReader', { bookId: book.id });
      router.push('/alice-reader');
    } else {
      logger.logNavigation('Library', 'Player', { bookId: book.id });
      router.push('/player');
    }
  };

  const handlePlaySample = () => {
    logger.logUserAction('play_sample', 'Library');
    logger.logNavigation('Library', 'Player', { type: 'sample' });
    router.push('/player');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color="#FFD700" fill="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half\" size={12} color="#FFD700" fill="#FFD700" style={{ opacity: 0.5 }} />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} color="#E0E0E0" />);
    }
    
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Library</Text>
        <Text style={styles.subtitle}>Continue your journey</Text>
      </View>

      <TouchableOpacity style={styles.sampleButton} onPress={handlePlaySample}>
        <Play size={20} color="#FFFFFF" />
        <Text style={styles.sampleButtonText}>Play Sample Audio</Text>
      </TouchableOpacity>

      <ScrollView style={styles.booksList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Books</Text>
        
        {SAMPLE_BOOKS.map((book) => (
          <TouchableOpacity
            key={book.id}
            style={styles.bookItem}
            onPress={() => handleBookPress(book)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />
            
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {book.author}
              </Text>
              
              <View style={styles.bookMeta}>
                <View style={styles.ratingContainer}>
                  {renderStars(book.rating)}
                  <Text style={styles.ratingText}>{book.rating}</Text>
                </View>
                
                <View style={styles.durationContainer}>
                  <Clock size={12} color="#8E8E93" />
                  <Text style={styles.durationText}>{book.duration}</Text>
                </View>
              </View>
              
              {book.progress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${book.progress * 100}%` }]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(book.progress * 100)}% complete
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.playButton}>
              <Play size={16} color="#007AFF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sampleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  booksList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 20,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E5EA',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});