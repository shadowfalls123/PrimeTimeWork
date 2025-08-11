import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { withAuthenticator } from '@aws-amplify/ui-react';
// import { useUser } from './Auth/UserContext';
import { useAuth } from "../common/Auth/AuthContext";
import PropTypes from 'prop-types';

const PrivateRoute = ({ children }) => {
  // const { user } = useUser();
  const { user } = useAuth();
  const navigate = useNavigate();

if (!user) {
  // not logged in so redirect to login page with the return url
  return <Navigate to="/login" state={{ from: navigate("/") }} />
}

// authorized so return child components
return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default withAuthenticator(PrivateRoute);


// import React from 'react';
// import { Route, Navigate } from 'react-router-dom';
// import { withAuthenticator } from '@aws-amplify/ui-react';
// import { useUser } from './UserContext';

// const PrivateRoute = ({ component: Component, ...rest }) => {
//   const { user } = useUser();
// ////#PROD logger.log("isAuthenticated in PrivateRoutes is -> ", isAuthenticated);
//   return (
//     <Route
//       {...rest}
//       render={(props) =>
//         user ? (
//           <Component {...props} />
//         ) : (
//           <Navigate to={{ pathname: '/login', state: { from: props.location } }} />
//         )
//       }
//     />
//   );
// };

// export default withAuthenticator(PrivateRoute);
