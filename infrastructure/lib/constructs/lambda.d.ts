import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
type NodejsServiceFunctionProps = NodejsFunctionProps;
export declare class NodejsServiceFunction extends NodejsFunction {
    constructor(scope: Construct, id: string, props: NodejsServiceFunctionProps);
}
export {};
