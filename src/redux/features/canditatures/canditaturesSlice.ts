import type { CanditatureResponse } from '../../../types/canditatures';
import { createSlice } from '@reduxjs/toolkit';

interface CanditaturesState {
  myCandidatures: CanditatureResponse[];
  subjectCandidatures: Record<string, CanditatureResponse[]>;
}

const initialState: CanditaturesState = {
  myCandidatures: [],
  subjectCandidatures: {},
};

const canditaturesSlice = createSlice({
  name: 'canditatures',
  initialState,
  reducers: {
    setMyCandidatures(state, action) {
      state.myCandidatures = action.payload;
    },
    setSubjectCandidatures(state, action) {
      const { subjectId, candidatures } = action.payload;
      state.subjectCandidatures[subjectId] = candidatures;
    },
    resetCanditatures(state) {
      state.myCandidatures = [];
      state.subjectCandidatures = {};
    },
  },
});

export const { setMyCandidatures, setSubjectCandidatures, resetCanditatures } = canditaturesSlice.actions;
export default canditaturesSlice.reducer;
