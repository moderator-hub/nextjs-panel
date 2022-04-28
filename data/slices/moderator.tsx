import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ModPerm {
  id: number
  name: string
}

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
    fail: (state, action: PayloadAction<string>) => {
      state.authorized = false
      state.retryPath = action.payload
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
