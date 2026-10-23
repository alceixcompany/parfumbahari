import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactReducer from './slices/contactSlice';
import galleryReducer from './slices/gallerySlice';
import newsReducer from './slices/newsSlice';
import serviceAreasReducer from './slices/serviceAreasSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contact: contactReducer,
    gallery: galleryReducer,
    news: newsReducer,
    serviceAreas: serviceAreasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
