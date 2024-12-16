// counterReducer.js
import { BIKE_TYPE, LOGIN } from "./counterActionTypes";

const initialState = {
  loggedIn: false,
  Biketype: 'Petrol',
  phone: ''
};

const counterReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        loggedIn: action.payload.loggedIn,
        phone: action.payload.phone
      };
    case BIKE_TYPE:
      return {
        ...state,
        Biketype: action.payload
      };
    default:
      return state;
  }
};

export default counterReducer;
