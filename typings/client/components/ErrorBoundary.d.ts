export default ErrorBoundary;
declare class ErrorBoundary extends React.Component<any, any, any> {
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
        stack: any;
    };
    constructor(props: any);
}
declare namespace ErrorBoundary {
    namespace propTypes {
        const children: PropTypes.Validator<PropTypes.ReactNodeLike>;
        const className: PropTypes.Requireable<string>;
    }
    namespace defaultProps {
        const className_1: any;
        export { className_1 as className };
    }
}
import React from "react";
import PropTypes from "prop-types";
//# sourceMappingURL=ErrorBoundary.d.ts.map