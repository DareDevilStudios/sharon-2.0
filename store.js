import { configureStore } from '@reduxjs/toolkit'
import counterSlice from './slice/counterSlice'

export default configureStore({
  reducer: {
    home: counterSlice,
  },
})