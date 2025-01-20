import { Engine, type Expression, type Program, type Variable } from "php-parser";
import type { Code, SfcBlock, VueLanguagePlugin } from "@vue/language-core";
import { isArray, isAssign, isBoolean, isCall, isExpressionStatement, isNullKeyword, isNumber, isString, isVariable } from "./ast";
import { injectCodesEndOfCtx } from "./utils";

const plugin: VueLanguagePlugin = () => {
    let engine: Engine | undefined;
    const caches = new Map<string, {
        content: string;
        codes: Code[];
    }>();

    return {
        version: 2.1,
        resolveEmbeddedCode(fileName, sfc, embeddedFile) {
            if (!embeddedFile.id.startsWith("script_")) {
                return;
            }

            const blocks = sfc.customBlocks.filter((block) => block.type === "php");
            if (!blocks.length) {
                return;
            }

            injectCodesEndOfCtx(embeddedFile.content, () => {
                engine ??= new Engine({
                    parser: {
                        suppressErrors: true
                    },
                    ast: {
                        withPositions: true
                    }
                });

                return blocks.flatMap((block) => {
                    let cache = caches.get(fileName);
                    if (!cache) {
                        caches.set(fileName, cache = {
                            content: "",
                            codes: []
                        });
                    }

                    if (cache.content !== block.content) {
                        cache.content = block.content;
                        const ast = engine!.parseEval(block.content);
                        cache.codes = [...generateVariablesType(block, ast)];
                    }
                    return cache.codes;
                });
            });
        }
    };
};

module.exports = plugin;

function* generateVariablesType(block: SfcBlock, ast: Program): Generator<Code> {
    const variables = collectVariables(ast);
    yield ` & { `;
    for (const [name, { offset, type }] of variables) {
        yield [
            name,
            block.name,
            offset,
            {
                navigation: true
            }
        ];
        yield `: ${type}; `;
    }
    yield `}`;
}

function collectVariables(ast: Program) {
    const variables = new Map<string, {
        offset: number;
        type: string;
    }>();
    const exports: string[] = [];

    for (const node of ast.children) {
        if (isExpressionStatement(node)) {
            const exp = node.expression;
            if (isAssign(exp)) {
                const { left, right } = exp;
                const type = getExpressionType(right);
                if (isVariable(left)) {
                    walkVariable(left, type);
                }
            }
            else if (isVariable(exp)) {
                walkVariable(exp);
            }
            else if (isCall(exp) && typeof exp.what.name === "string" && exp.what.name === "export") {
                const args = exp.arguments;
                for (const arg of args) {
                    if (isVariable(arg) && typeof arg.name === "string") {
                        exports.push(arg.name);
                    }
                }
            }
        }
    }

    return variables.entries().filter(([name]) => exports.includes(name));

    function walkVariable(node: Variable, type: string = "unknown") {
        const { name, loc } = node;
        if (typeof name === "string" && loc) {
            if (variables.has(name)) {
                return;
            }
            variables.set(name, {
                offset: loc.start.offset + 1,
                type
            });
        }
    }
}

function getExpressionType(exp: Expression) {
    if (isString(exp)) {
        return "string";
    }
    else if (isNumber(exp)) {
        return "number";
    }
    else if (isBoolean(exp)) {
        return "boolean";
    }
    else if (isNullKeyword(exp)) {
        return "null";
    }
    else if (isArray(exp)) {
        return "unknown[]";
    }
    else {
        return "unknown";
    }
}