import React from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Handle the error here, for example, log it to the console
    console.error(error, info);
    // Set the state to indicate that an error has occurred
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // Render the fallback UI here, for example, a friendly error message
      return <h1>Something went wrong.</h1>;
    }
    // Render the children components as normal
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};


export default ErrorBoundary;
