import * as React from 'react';
import PropTypes from 'prop-types';
import { getCurrentUserProfile, getAllUserProfiles } from '../../../services';

const UserContext = React.createContext();

/*
function userReducer(state, action) {
  //#PROD logger.log("UserContext.jsx userReducer action.payload -> ", action.payload)
  switch (action.type) {
    case 'SET_USER':
      const { user, isAuthenticated } = action.payload;
      //#PROD logger.log("UserContext.jsx useReducer isAuthenticated -> ", isAuthenticated);
      return { ...state, user: { ...user, isAuthenticated } };
    case 'SET_PROFILES':
      return { ...state, profiles: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
*/
function userReducer(state, action) {
  let user;
  let isAuthenticated;

  //#PROD logger.log("UserContext.jsx userReducer action.payload -> ", action.payload)
  switch (action.type) {
    case 'SET_USER':
      user = action.payload.user;
      isAuthenticated = action.payload.isAuthenticated;
      //#PROD logger.log("UserContext.jsx useReducer isAuthenticated -> ", isAuthenticated);
      return { ...state, user: { ...user, isAuthenticated } };
    case 'SET_PROFILES':
      return { ...state, profiles: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}


function UserProvider({ children }) {
  const [state, dispatch] = React.useReducer(userReducer, {
    user: {},
    profiles: [],
  });

  const { user, profiles } = state;

  const getUserProfile = React.useCallback(
    async (userId) => {
      if (!profiles) {
        dispatch({ type: 'SET_PROFILES', payload: await getAllUserProfiles() });
      }
      return profiles.find((u) => u.userId === userId);
    },
    [profiles]
  );

  const updateAllUserProfiles = React.useCallback(async () => {
    dispatch({ type: 'SET_PROFILES', payload: await getAllUserProfiles() });
  }, []);

  // React.useEffect(() => {
  //   (async () => {
  //     dispatch({ type: 'SET_USER', payload: await getCurrentUserProfile() });
  //     dispatch({ type: 'SET_PROFILES', payload: await getAllUserProfiles() });
  //   })();
  // }, []);

  React.useEffect(() => {
    (async () => {
      const user = await getCurrentUserProfile();
      const isAuthenticated = true; // Set isAuthenticated to true when user is logged in
      dispatch({ type: 'SET_USER', payload: { user, isAuthenticated } });
      dispatch({ type: 'SET_PROFILES', payload: await getAllUserProfiles() });
    })();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        profiles,
        setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
        getUserProfile,
        updateAllUserProfiles,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}


function useUser() {
  const context = React.useContext(UserContext);
  return context || { user: {}, profiles: [], isAuthenticated: false, setUser: () => {}, getUserProfile: () => {}, updateAllUserProfiles: () => {} };
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { UserProvider, useUser };
