import { configureStore } from '@reduxjs/toolkit';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage';

import counterReducer from './Counter/counterReducer';

// Configuration for redux-persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  
};

// Create the persisted reducer
const persistedReducer = persistReducer(persistConfig, counterReducer);

// Configure the Redux store
const store = configureStore({
  reducer: {
    counter: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [REHYDRATE, PAUSE,FLUSH, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
