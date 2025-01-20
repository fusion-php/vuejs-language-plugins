import type { Array, Assign, Boolean, Call, ExpressionStatement, Node, NullKeyword, Number, String, Variable } from "php-parser";

export function isAssign(node: Node): node is Assign {
    return node.kind === "assign";
}

export function isCall(node: Node): node is Call {
    return node.kind === "call";
}

export function isExpressionStatement(node: Node): node is ExpressionStatement {
    return node.kind === "expressionstatement";
}

export function isVariable(node: Node): node is Variable {
    return node.kind === "variable";
}

export function isString(node: Node): node is String {
    return node.kind === "string";
}

export function isNumber(node: Node): node is Number {
    return node.kind === "number";
}

export function isBoolean(node: Node): node is Boolean {
    return node.kind === "boolean";
}

export function isNullKeyword(node: Node): node is NullKeyword {
    return node.kind === "nullkeyword";
}

export function isArray(node: Node): node is Array {
    return node.kind === "array";
}