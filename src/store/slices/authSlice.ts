import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  isStaticAdmin?: boolean;
  isDatabaseAdmin?: boolean;
  setupMessage?: string;
  setupError?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isAuthenticated: boolean;
  hasDatabaseAdmins: boolean;
}

// LocalStorage key for auth persistence
const AUTH_STORAGE_KEY = 'parfum_bahari_auth_state';

// Helper functions for localStorage
const saveAuthToStorage = (user: User | null) => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user,
        timestamp: new Date().toISOString()
      }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving auth to localStorage:', error);
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  successMessage: null,
  isAuthenticated: false,
  hasDatabaseAdmins: false,
};

// Veritabanı admin ile giriş
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firebase kimliği doğrulandıktan sonra Next.js admin rotaları için
      // güvenli, httpOnly sunucu oturumunu aç.
      const sessionResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: await user.getIdToken() }),
      });
      const sessionData = await sessionResponse.json();
      if (!sessionResponse.ok) throw new Error(sessionData.message || 'Yönetici oturumu açılamadı.');

      const userData = sessionData.user as User;

      return userData;
    } catch (error) {
      await signOut(auth).catch(() => undefined);
      await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Şifre değiştirme
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const user = state.auth.user;

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // Statik admin için şifre değiştirme desteklenmiyor
      if (user.isStaticAdmin) {
        throw new Error('Statik admin için şifre değiştirme desteklenmiyor');
      }

      // Veritabanı admin için şifre değiştirme
      if (user.isDatabaseAdmin) {
        const { updatePassword, reauthenticateWithCredential, EmailAuthProvider } = await import('firebase/auth');

        // Önce kullanıcıyı yeniden doğrula
        const credential = EmailAuthProvider.credential(user.email || '', currentPassword);
        await reauthenticateWithCredential(auth.currentUser!, credential);

        // Firebase Auth'da şifreyi güncelle
        await updatePassword(auth.currentUser!, newPassword);

        return { success: true };
      }

      throw new Error('Desteklenmeyen kullanıcı tipi');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      if (auth.currentUser) await signOut(auth);
      return null;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async (_, { rejectWithValue }) => {
    try {
      await auth.authStateReady();
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: await firebaseUser.getIdToken() }),
      });
      const data = await response.json();
      if (!response.ok) {
        await signOut(auth);
        await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
        throw new Error(data.message || 'Yönetici oturumu doğrulanamadı.');
      }
      return data.user as User;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Oturum doğrulanamadı.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
      saveAuthToStorage(action.payload); // Save to localStorage
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setHasDatabaseAdmins: (state, action: PayloadAction<boolean>) => {
      state.hasDatabaseAdmins = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Database admin login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        saveAuthToStorage(action.payload); // Save to localStorage
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = 'Şifreniz başarıyla güncellendi!';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.successMessage = null;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        saveAuthToStorage(null); // Save to localStorage
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.error = null;
      });

    // Check auth state
    builder
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
        saveAuthToStorage(action.payload);
      })
      .addCase(checkAuthState.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        saveAuthToStorage(null);
      });
  },
});

export const { setUser, clearError, clearSuccessMessage, setLoading, setHasDatabaseAdmins } = authSlice.actions;
export default authSlice.reducer;
