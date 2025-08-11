"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodejsServiceFunction = void 0;
const lambda = require("aws-cdk-lib/aws-lambda");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
class NodejsServiceFunction extends aws_lambda_nodejs_1.NodejsFunction {
    constructor(scope, id, props) {
        var _a;
        const runtime = (_a = props.runtime) !== null && _a !== void 0 ? _a : lambda.Runtime.NODEJS_16_X;
        const handler = 'handler';
        const bundling = {
         externalModules: ['aws-sdk'],
//        externalModules: ['@aws-sdk/client-s3', '@aws-sdk/client-dynamodb', '@aws-sdk/client-lambda', '@aws-sdk/client-ses', '@aws-sdk/client-textract', '@aws-sdk/client-eventbridge', '@aws-sdk/client-cognito-identity-provider'],

        };
        super(scope, id, {
            ...props,
            runtime,
            handler,
            bundling,
        });
    }
}
exports.NodejsServiceFunction = NodejsServiceFunction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFtYmRhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLGlEQUFpRDtBQUNqRCxxRUFBb0Y7QUFLcEYsTUFBYSxxQkFBc0IsU0FBUSxrQ0FBYztJQUN2RCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWlDOztRQUN6RSxNQUFNLE9BQU8sR0FBRyxNQUFBLEtBQUssQ0FBQyxPQUFPLG1DQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQzVELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUMxQixNQUFNLFFBQVEsR0FBRztZQUNmLGVBQWUsRUFBRSxDQUFDLFNBQVMsQ0FBQztTQUM3QixDQUFDO1FBQ0YsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUU7WUFDZixHQUFHLEtBQUs7WUFDUixPQUFPO1lBQ1AsT0FBTztZQUNQLFFBQVE7U0FDVCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFkRCxzREFjQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBOb2RlanNGdW5jdGlvbiwgTm9kZWpzRnVuY3Rpb25Qcm9wcyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtbm9kZWpzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG50eXBlIE5vZGVqc1NlcnZpY2VGdW5jdGlvblByb3BzID0gTm9kZWpzRnVuY3Rpb25Qcm9wcztcblxuZXhwb3J0IGNsYXNzIE5vZGVqc1NlcnZpY2VGdW5jdGlvbiBleHRlbmRzIE5vZGVqc0Z1bmN0aW9uIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IE5vZGVqc1NlcnZpY2VGdW5jdGlvblByb3BzKSB7XG4gICAgY29uc3QgcnVudGltZSA9IHByb3BzLnJ1bnRpbWUgPz8gbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE0X1g7XG4gICAgY29uc3QgaGFuZGxlciA9ICdoYW5kbGVyJztcbiAgICBjb25zdCBidW5kbGluZyA9IHtcbiAgICAgIGV4dGVybmFsTW9kdWxlczogWydhd3Mtc2RrJ10sXG4gICAgfTtcbiAgICBzdXBlcihzY29wZSwgaWQsIHtcbiAgICAgIC4uLnByb3BzLFxuICAgICAgcnVudGltZSxcbiAgICAgIGhhbmRsZXIsXG4gICAgICBidW5kbGluZyxcbiAgICB9KTtcbiAgfVxufVxuIl19