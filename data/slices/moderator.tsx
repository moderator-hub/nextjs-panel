import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ModPerm, ModeratorData } from '../../utils/other'

interface ModeratorState {
  authorized?: boolean
  permissions?: ModPerm[]
  locale: string
  mode: string
  retryPath?: string
}

const initialState = { locale: "en", mode: "dark" } as ModeratorState

export const moderatorSlice = createSlice({
  name: "moderator",
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<ModeratorData>) => {
      console.log(action.payload)
      state.authorized = true
      state.retryPath = undefined
      state.permissions = [...action.payload.permissions]
      state.locale = action.payload.locale
      state.mode = action.payload.mode
    },
    fail: (state, action: PayloadAction<string | undefined>) => {
      state.authorized = false
      if (action.payload !== undefined) state.retryPath = action.payload
    },
    signOut: state => {
      state.authorized = false
      state.retryPath = undefined
      state.permissions = undefined
    },
  }
})

export const { signIn, fail, signOut } = moderatorSlice.actions

export default moderatorSlice.reducer
