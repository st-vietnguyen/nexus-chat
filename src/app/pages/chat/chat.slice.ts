import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  selectedRoomId: string | null;
}

const initialState: ChatState = {
  selectedRoomId: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedRoomId: (state, action: PayloadAction<string | null>) => {
      state.selectedRoomId = action.payload;
    },
  },
});

export const { setSelectedRoomId } = chatSlice.actions;
export default chatSlice.reducer;
