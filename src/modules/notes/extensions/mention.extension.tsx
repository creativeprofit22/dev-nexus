/**
 * Mention Extension Configuration
 * Configures Tiptap mention extension with project autocomplete
 */

import { ReactRenderer } from "@tiptap/react";
import Mention from "@tiptap/extension-mention";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  MentionList,
  type MentionListRef,
} from "../components/NoteEditor/MentionList";
import type { MentionSuggestion } from "../hooks/useMentionSuggestions";

export interface MentionNodeAttrs {
  id: string;
  label: string;
  type: string;
}

/**
 * Creates mention extension with suggestions callback
 * @param getSuggestions - Function to fetch suggestions based on query
 */
export function createMentionExtension(
  getSuggestions: (query: string) => MentionSuggestion[]
) {
  const suggestion: Partial<SuggestionOptions<MentionSuggestion>> = {
    char: "@",
    items: ({ query }) => getSuggestions(query),
    render: () => {
      let component: ReactRenderer | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: SuggestionProps<MentionSuggestion>) => {
          component = new ReactRenderer(MentionList, {
            props: {
              items: props.query ? getSuggestions(props.query) : [],
              command: (item: MentionSuggestion) => {
                props.command({
                  id: item.id,
                  label: item.label,
                  type: item.type,
                });
              },
            },
            editor: props.editor,
          });

          if (!props.clientRect || !component) return;

          popup = tippy("body", {
            getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },

        onUpdate(props: SuggestionProps<MentionSuggestion>) {
          component?.updateProps({
            items: props.query ? getSuggestions(props.query) : [],
            command: (item: MentionSuggestion) => {
              props.command({
                id: item.id,
                label: item.label,
                type: item.type,
              });
            },
          });

          if (!props.clientRect) return;

          popup?.[0]?.setProps({
            getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
          });
        },

        onKeyDown(props: { event: KeyboardEvent }) {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }

          const ref = component?.ref as MentionListRef | null;
          return ref?.onKeyDown(props) ?? false;
        },

        onExit() {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
  };

  return Mention.configure({
    HTMLAttributes: {
      class: "mention",
    },
    suggestion,
  }).extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        type: {
          default: "project",
          parseHTML: (element) =>
            element.getAttribute("data-mention-type") || "project",
          renderHTML: (attributes) => ({
            "data-mention-type": attributes.type || "project",
          }),
        },
      };
    },
    renderHTML({ node, HTMLAttributes }) {
      return [
        "span",
        {
          ...HTMLAttributes,
          "data-mention-id": node.attrs.id,
          "data-mention-type": node.attrs.type || "project",
          class: "mention",
        },
        `@${node.attrs.label || ""}`,
      ];
    },
  });
}
