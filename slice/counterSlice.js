import { createSlice } from '@reduxjs/toolkit'


export const counterSlice = createSlice({
  name: 'parkbench',
  initialState: {
    value: "0",
    url: 'parkbench',
    home_url: [],
    image_url_dup: [],
    image_url: [],
  },
  reducers: {
    all_images: (state, action) => {
        state.image_url_dup = [...state.image_url_dup, action.payload]
        state.image_url = state.image_url_dup
    },
    addUrl: (state, action) => {
      state.home_url = [...state.home_url, action.payload]
      console.log(state.home_url)
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
    urlChange: (state, action) => {
      state.url = action.payload
    },
    initialSet: (state) => {
      state.image_url_dup = []
      state.image_url = []
    }
  },
})

// Action creators are generated for each case reducer function
export const { all_images, addUrl, incrementByAmount, urlChange, initialSet } = counterSlice.actions

export default counterSlice.reducer