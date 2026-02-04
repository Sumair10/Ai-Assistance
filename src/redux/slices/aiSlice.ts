import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type AiState = {
  loading: boolean;
  error: string | null;
};

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    loading: false,
    error: null,
  } as AiState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export default aiSlice.reducer;
