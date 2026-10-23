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

interface ServiceArea {
  id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ServiceAreasState {
  items: ServiceArea[];
  currentArea: ServiceArea | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    isActive: boolean | null;
  };
}

const initialState: ServiceAreasState = {
  items: [],
  currentArea: null,
  isLoading: false,
  error: null,
  filters: {
    isActive: null,
  },
};

// Async thunks
export const fetchServiceAreas = createAsyncThunk(
  'serviceAreas/fetchServiceAreas',
  async (filters: Partial<ServiceAreasState['filters']> = {}, { rejectWithValue }) => {
    try {
      let q: CollectionReference | Query = collection(db, 'hizmet_bolgeleri');

      // Apply filters
      if (filters?.isActive !== null && filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
      }

      // Apply ordering
      q = query(q, orderBy('order', 'asc'));

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceArea[];

      return items;
    } catch (error) {
      console.error('Error fetching service areas:', error);
      return rejectWithValue('Hizmet bölgeleri yüklenirken hata oluştu');
    }
  }
);

export const fetchServiceAreaBySlug = createAsyncThunk(
  'serviceAreas/fetchServiceAreaBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, 'hizmet_bolgeleri'),
        where('slug', '==', slug),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return rejectWithValue('Hizmet bölgesi bulunamadı');
      }

      const area = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as ServiceArea;
      return area;
    } catch (error) {
      console.error('Error fetching service area by slug:', error);
      return rejectWithValue('Hizmet bölgesi yüklenirken hata oluştu');
    }
  }
);

export const addServiceArea = createAsyncThunk(
  'serviceAreas/addServiceArea',
  async (areaData: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const newArea = {
        ...areaData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'hizmet_bolgeleri'), newArea);
      const addedArea = { id: docRef.id, ...newArea };

      return addedArea;
    } catch (error) {
      console.error('Error adding service area:', error);
      return rejectWithValue('Hizmet bölgesi eklenirken hata oluştu');
    }
  }
);

export const updateServiceArea = createAsyncThunk(
  'serviceAreas/updateServiceArea',
  async ({ id, ...areaData }: Partial<ServiceArea> & { id: string }, { rejectWithValue }) => {
    try {
      const updateData = {
        ...areaData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'hizmet_bolgeleri', id), updateData);

      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating service area:', error);
      return rejectWithValue('Hizmet bölgesi güncellenirken hata oluştu');
    }
  }
);

export const deleteServiceArea = createAsyncThunk(
  'serviceAreas/deleteServiceArea',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'hizmet_bolgeleri', id));
      return id;
    } catch (error) {
      console.error('Error deleting service area:', error);
      return rejectWithValue('Hizmet bölgesi silinirken hata oluştu');
    }
  }
);

const serviceAreasSlice = createSlice({
  name: 'serviceAreas',
  initialState,
  reducers: {
    setCurrentArea: (state, action: PayloadAction<ServiceArea | null>) => {
      state.currentArea = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<ServiceAreasState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // fetchServiceAreas
    builder
      .addCase(fetchServiceAreas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceAreas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchServiceAreas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchServiceAreaBySlug
    builder
      .addCase(fetchServiceAreaBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceAreaBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentArea = action.payload;
        state.error = null;
      })
      .addCase(fetchServiceAreaBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // addServiceArea
    builder
      .addCase(addServiceArea.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });

    // updateServiceArea
    builder
      .addCase(updateServiceArea.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        if (state.currentArea?.id === action.payload.id) {
          state.currentArea = { ...state.currentArea, ...action.payload };
        }
      });

    // deleteServiceArea
    builder
      .addCase(deleteServiceArea.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentArea?.id === action.payload) {
          state.currentArea = null;
        }
      });
  },
});

export const { setCurrentArea, clearError, setFilters } = serviceAreasSlice.actions;
export default serviceAreasSlice.reducer;
