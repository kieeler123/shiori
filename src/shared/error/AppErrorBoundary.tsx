import React from "react";
import ErrorNotice from "./ErrorNotice";
import { logError } from "./logError";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    void logError({
      category: "render",
      action: "render",
      page: typeof window !== "undefined" ? window.location.pathname : "",
      error,
      meta: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorNotice
          title="화면을 표시하는 중 문제가 발생했습니다"
          message="페이지를 새로고침한 뒤 다시 시도해주세요."
        />
      );
    }

    return this.props.children;
  }
}
