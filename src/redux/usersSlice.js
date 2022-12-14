import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import baseUrl from '../config'

// intial state before an actions are dispatched
const initialState = {
  users: [],
  status: 'idle', // idle, loading, succeeded, failed
  error: null,
}

// api call
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (token, { rejectWithValue }) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    try {
      const res = await axios.get(`${baseUrl}/api/users`, config)
      return [...res.data]
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// setting state
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsers: (state, action) => {
      state.users = []
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'users fetched '
        state.users = action.payload
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'error fetching users'
        state.error = action.payload.message
      })
  },
})

export const selectUsers = (state) => state.users.users
export const selectUsersStatus = (state) => state.users.status
export const selectUsersError = (state) => state.users.error

export const { resetUsers } = usersSlice.actions
export const usersReducer = usersSlice.reducer
