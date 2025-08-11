// store.js

import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialCartState = {
    items: [],
    totalPrice: 0,
  };

  const cartSlice = createSlice({
    name: 'cart',
    initialState: initialCartState,
    reducers: {
      addToCart: (state, action) => {
        const { title, itemId, itemCat, price } = action.payload;
        state.items.push({ title, itemId, itemCat, price });
        state.totalPrice += price;
      },

      // addToCart: (state, action) => {
      //   const { item, price } = action.payload;
      //   state.items.push(item);
      //   state.totalPrice += price;
      // },

      removeFromCart: (state, action) => {
        // remove the deleted item from the cart items
        state.items = state.items.filter(
          (item) => item.itemId !== action.payload.item.itemId
        );
        // update the total price
        state.totalPrice -= action.payload.price;
      },

      emptyCart: (state) => {
        // remove all items from the cart
        return {
          ...state,
          items: [], // Reset the items array to an empty array to clear the cart
          totalPrice: 0, // Reset the total price to 0 to clear the cart
          // Reset other cart-related state properties if needed
        };
      },
    },
  });

  
  //#PROD logger.log("In store");
 // //#PROD logger.log("In store item -> ", state.items);

 // Initial state for exam details slice
const initialExamDetailsState = {
  // Define initial state for exam details slice here
  // For example:
  exams: [],
  selectedExam: null,
};

// Reducer slice for managing exam details
const examDetailsSlice = createSlice({
  name: 'SET_SELECTED_EXAM_ID',
  initialState: initialExamDetailsState,
  reducers: {
    // Define reducers for managing exam details here
    // For example:
    setExams: (state, action) => {
      state.exams = action.payload;
    },
    selectExam: (state, action) => {
      state.selectedExam = action.payload;
    },
  },
});

// Extract actions from cartSlice and examDetailsSlice
export const { addToCart, removeFromCart, emptyCart } = cartSlice.actions;
export const { setExams, selectExam } = examDetailsSlice.actions;

// export default configureStore({
//   reducer: {
//     cart: cartSlice.reducer,
//     exam: examDetailsSlice.reducer,
//   },
// });

// Create the Redux store
const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    exam: examDetailsSlice.reducer,
  },
});

export default store;