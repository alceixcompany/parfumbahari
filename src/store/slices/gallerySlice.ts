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
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  imageUrl: string;
  thumbnailUrl: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface GalleryCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface GalleryState {
  items: GalleryItem[];
  categories: GalleryCategory[];
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
  isUploading: boolean;
}

const initialState: GalleryState = {
  items: [],
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
  isUploading: false,
};

// Async thunks
export const fetchGalleryCategories = createAsyncThunk(
  'gallery/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categoriesRef = collection(db, 'gallery_categories');
      const q = query(categoriesRef, where('isActive', '==', true), orderBy('order'));
      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryCategory[];
      return categories;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchGalleryItems = createAsyncThunk(
  'gallery/fetchItems',
  async (categoryId: string | undefined, { rejectWithValue }) => {
    try {
      const itemsRef = collection(db, 'gallery_items');
      let q = query(itemsRef, where('isActive', '==', true), orderBy('order'));

      if (categoryId) {
        q = query(itemsRef, where('categoryId', '==', categoryId), where('isActive', '==', true), orderBy('order'));
      }

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];
      return items;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const addGalleryItem = createAsyncThunk(
  'gallery/addItem',
  async (itemData: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'gallery_items'), {
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...itemData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateGalleryItem = createAsyncThunk(
  'gallery/updateItem',
  async ({ id, data }: { id: string; data: Partial<GalleryItem> }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, 'gallery_items', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteGalleryItem = createAsyncThunk(
  'gallery/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'gallery_items', id));
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchGalleryCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGalleryCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchGalleryCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch items
    builder
      .addCase(fetchGalleryItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGalleryItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchGalleryItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add item
    builder
      .addCase(addGalleryItem.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(addGalleryItem.fulfilled, (state, action) => {
        state.isUploading = false;
        state.items.push(action.payload as GalleryItem);
      })
      .addCase(addGalleryItem.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      });

    // Update item
    builder
      .addCase(updateGalleryItem.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.items.findIndex(item => item.id === id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...data };
        }
      });

    // Delete item
    builder
      .addCase(deleteGalleryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { setSelectedCategory, clearError, setUploading } = gallerySlice.actions;
export default gallerySlice.reducer;
