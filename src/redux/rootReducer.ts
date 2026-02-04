import {combineReducers} from '@reduxjs/toolkit';
import wizardSlice from './slices/wizardSlice';
import uiSlice from './slices/uiSlice';
import aiSlice from './slices/aiSlice';

const rootReducer = combineReducers({
  wizard: wizardSlice,
  ui: uiSlice,
  ai: aiSlice,
});

export default rootReducer;
