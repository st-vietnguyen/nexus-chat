import ACTION_TYPES from '@app/core/constants/types';

export const signIn = (account: object) => ({
  type: ACTION_TYPES.SIGN_IN,
  payload: account
});

export const signInSuccess = (payload) => ({
  type: ACTION_TYPES.SIGN_IN_SUCCESS,
  payload
});

export const signInError = (payload) => ({
  type: ACTION_TYPES.SIGN_IN_ERROR,
  payload
});
