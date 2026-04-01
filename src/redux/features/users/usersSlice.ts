import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UsersState {
  selectedUserId: string | null;
  error: string | null;
}

const initialState: UsersState = {
  selectedUserId: null,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUserId(state, action: PayloadAction<string | null>) {
      state.selectedUserId = action.payload;
    },
    clearSelectedUserId(state) {
      state.selectedUserId = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { setSelectedUserId, clearSelectedUserId, setError, clearError } = usersSlice.actions;
export default usersSlice.reducer;
