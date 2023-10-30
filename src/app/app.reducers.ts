import { combineReducers } from 'redux';

import authReducer from '@app/core/auth/auth.reducers';

const appReducer = combineReducers({
  authReducer
});

export default appReducer;
