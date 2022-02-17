export function ChangelistContextProvider({ cubeID, setOpenCollapse, initialChanges, noSave, ...props }: {
    [x: string]: any;
    cubeID: any;
    setOpenCollapse: any;
    initialChanges: any;
    noSave: any;
}): JSX.Element;
export namespace ChangelistContextProvider {
    namespace propTypes {
        const cubeID: PropTypes.Validator<string>;
        const setOpenCollapse: PropTypes.Validator<(...args: any[]) => any>;
        const initialChanges: PropTypes.Requireable<PropTypes.InferProps<{}>[]>;
        const noSave: PropTypes.Requireable<boolean>;
    }
    namespace defaultProps {
        const initialChanges_1: any[];
        export { initialChanges_1 as initialChanges };
        const noSave_1: boolean;
        export { noSave_1 as noSave };
    }
}
export default ChangelistContext;
import PropTypes from "prop-types";
declare const ChangelistContext: React.Context<{}>;
import React from "react";
//# sourceMappingURL=ChangelistContext.d.ts.map