import type { Code, VueLanguagePlugin } from "@vue/language-core";
import { injectCodesEndOfCtx } from "./utils";

type Data = Record<string, string>;

const HARD_DATA: Record<string, Data> = {
    "List.vue": {
        search: "import('vue').Ref<string | null>"
    },
    "Show.vue": {
        name: "import('vue').Ref<string | null>"
    }
};

const plugin: VueLanguagePlugin = () => {
    return {
        version: 2.1,
        resolveEmbeddedCode(fileName, _sfc, embeddedFile) {
            const name = fileName.split("/").at(-1)!;
            const data = HARD_DATA[name];
            if (data === void 0) {
                return;
            }
            if (!embeddedFile.id.startsWith("script_")) {
                return;
            }

            injectCodesEndOfCtx(embeddedFile.content, () => {
                return [...generateDataType(data)];
            });
        }
    };
};

module.exports = plugin;

function* generateDataType(data: Data): Generator<Code> {
    yield ` & { `;
    for (const [name, type] of Object.entries(data)) {
        yield `${name}: ${type}; `;
    }
    yield `}`;
}