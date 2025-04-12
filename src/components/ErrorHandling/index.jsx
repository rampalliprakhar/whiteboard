import { Component } from "react";
import { withRouter } from "next/router";

class ErrorHandling extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught: ', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
        this.props.router.push('/error');
        return null;
    }
    return this.props.children;
  }
}

export default withRouter(ErrorHandling);