import React, { useState } from 'react';
import PropTypes from 'prop-types';
//import { Auth } from 'aws-amplify';
import { Hub } from '@aws-amplify/core';

function AuthGroupWrapper({ requiredGroups, children }) {
  const [userGroups, setUserGroups] = useState([]);

  React.useEffect(() => {
    (async () => {
      const user = await Hub.currentAuthenticatedUser();
      setUserGroups(user.signInUserSession.accessToken.payload['cognito:groups']);
    })();
  }, [requiredGroups]);

  const shouldRender = () => {
    if (!userGroups) {
      return false;
    }
    const intersectingGroups = userGroups.filter((g) => requiredGroups.includes(g));
    return (intersectingGroups.length > 0);
  };

  return (
    <>
      { shouldRender() && children }
    </>
  );
}

AuthGroupWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  requiredGroups: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AuthGroupWrapper;
