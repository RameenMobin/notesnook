import { Node, mergeAttributes } from "@tiptap/core";
import { inputRules } from "prosemirror-inputrules";
import { makeInlineMathInputRule, REGEX_INLINE_MATH_DOLLARS, mathPlugin, } from "./plugin";
export const MathInline = Node.create({
    name: "mathInline",
    group: "inline math",
    content: "text*",
    inline: true,
    atom: true,
    code: true,
    parseHTML() {
        return [
            {
                tag: "span[class*='math-inline']", // important!,
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            "span",
            mergeAttributes({ class: "math-inline math-node" }, HTMLAttributes),
            0,
        ];
    },
    addCommands() {
        return {
            insertMathInline: () => ({ chain, tr }) => {
                const { $from } = tr.selection;
                return chain()
                    .insertContent({ type: this.name, attrs: {} })
                    .setNodeSelection($from.pos)
                    .run();
            },
        };
    },
    addProseMirrorPlugins() {
        const inputRulePlugin = inputRules({
            rules: [makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, this.type)],
        });
        return [mathPlugin, inputRulePlugin];
    },
});
