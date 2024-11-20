import { configureStore } from "@reduxjs/toolkit";
import sdkReducer from "./features/sdkSlice";
import conversationsReducer from './features/converstationSlice';


export const store = configureStore({
    reducer: {
        sdk: sdkReducer,
        conversations: conversationsReducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})