import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status?: 'online' | 'offline';
}

interface FriendsState {
  friends: Friend[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  status: 'idle',
  error: null
};

// Async thunk để fetch danh sách bạn bè
export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (userId: string, thunkAPI) => {
    try {
      // // Thay thế bằng API call thực tế
      // const response = await fetch(`/api/friends?userId=${userId}`);
      // if (!response.ok) throw new Error('Failed to fetch friends');
      // return await response.json();
      console.log("CHECK USER ID", userId);
      return [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '/avatars/john.jpg',
          status: 'online'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: '/avatars/jane.jpg',
          status: 'offline'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          avatar: '/avatars/bob.jpg',
          status: 'online'
        }
      ] as Friend[];
    } catch (error: any) {
      return [] as Friend[];
    }
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    updateFriendStatus: (state, action) => {
      const { id, status } = action.payload;
      const friend = state.friends.find(f => f.id === id);
      if (friend) friend.status = status;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.friends = action.payload as Friend[];
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const { updateFriendStatus } = friendsSlice.actions;

// Selectors
export const selectAllFriends = (state: RootState) => state.friend.friends;
export const selectFriendsStatus = (state: RootState) => state.friend.status;
export const selectFriendsError = (state: RootState) => state.friend.error;

export default friendsSlice.reducer;