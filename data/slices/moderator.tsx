import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ModPerm } from '../../utils/other'

interface ModeratorState {
  authorized?: boolean
  permissions?: ModPerm[]
  retryPath?: string
}

const initialState = {} as ModeratorState

export const moderatorSlice = createSlice({
  name: "moderator",
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<ModPerm[]>) => {
      state.authorized = true
      state.permissions = [...action.payload]
      state.retryPath = undefined
    },
    fail: (state, action: PayloadAction<string | undefined>) => {
      state.authorized = false
      if (action.payload !== undefined) state.retryPath = action.payload
    },
    signOut: state => {
      state.authorized = false
      state.permissions = undefined
      state.retryPath = undefined
    },
  }
})

export const { signIn, fail, signOut } = moderatorSlice.actions

export default moderatorSlice.reducer
