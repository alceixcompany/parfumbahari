import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Query,
  CollectionReference
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NewsItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  content: string;
  imageUrl?: string;
  slug: string;
  isActive: boolean;
  featured: boolean;
  category?: string;
  tags: string[];
  author?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NewsState {
  items: NewsItem[];
  currentNews: NewsItem | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    featured: boolean | null;
    isActive: boolean | null;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: NewsState = {
  items: [],
  currentNews: null,
  isLoading: false,
  error: null,
  filters: {
    category: null,
    featured: null,
    isActive: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  },
};

// Async thunks
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async ({ page = 1, limit = 10, filters = {} }: { page?: number; limit?: number; filters?: Partial<NewsState['filters']> }, { rejectWithValue }) => {
    try {
      let q: CollectionReference | Query = collection(db, 'haberler');

      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.featured !== null) {
        q = query(q, where('featured', '==', filters.featured));
      }
      if (filters.isActive !== null) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      // Apply ordering and pagination
      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsItem[];

      return {
        items,
        pagination: {
          page,
          limit,
          total: items.length,
          hasMore: items.length === limit,
        },
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchNewsBySlug = createAsyncThunk(
  'news/fetchNewsBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const q = query(collection(db, 'haberler'), where('slug', '==', slug), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Haber bulunamadı');
      }

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as NewsItem;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchFeaturedNews = createAsyncThunk(
  'news/fetchFeaturedNews',
  async (_, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, 'haberler'),
        where('featured', '==', true),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NewsItem[];

      return items;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addNews = createAsyncThunk(
  'news/addNews',
  async (newsData: Omit<NewsItem, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'haberler'), {
        ...newsData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const newNews = { id: docRef.id, ...newsData } as NewsItem;
      return newNews;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateNews = createAsyncThunk(
  'news/updateNews',
  async ({ id, data }: { id: string; data: Partial<NewsItem> }, { rejectWithValue }) => {
    try {
      const newsRef = doc(db, 'haberler', id);
      await updateDoc(newsRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      return { id, data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'haberler', id));
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<NewsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentNews: (state) => {
      state.currentNews = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: true,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch news
    builder
      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        const { items, pagination } = action.payload;

        if (pagination.page === 1) {
          state.items = items;
        } else {
          state.items = [...state.items, ...items];
        }

        state.pagination = pagination;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch by slug
    builder
      .addCase(fetchNewsBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNewsBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentNews = action.payload;
      })
      .addCase(fetchNewsBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch featured
    builder
      .addCase(fetchFeaturedNews.fulfilled, (state, action) => {
        // Featured haberleri ana listeye ekle/güncelle
        const featuredItems = action.payload;
        featuredItems.forEach(featured => {
          const index = state.items.findIndex(item => item.id === featured.id);
          if (index !== -1) {
            state.items[index] = featured;
          } else {
            state.items.unshift(featured);
          }
        });
      });

    // Add news
    builder
      .addCase(addNews.fulfilled, (state, action) => {
        state.items.unshift(action.payload as NewsItem);
      });

    // Update news
    builder
      .addCase(updateNews.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.items.findIndex(item => item.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...data };
        }

        if (state.currentNews && state.currentNews.id === id) {
          state.currentNews = { ...state.currentNews, ...data };
        }
      });

    // Delete news
    builder
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentNews && state.currentNews.id === action.payload) {
          state.currentNews = null;
        }
      });
  },
});

export const { setFilters, clearCurrentNews, clearError, resetPagination } = newsSlice.actions;
export default newsSlice.reducer;
