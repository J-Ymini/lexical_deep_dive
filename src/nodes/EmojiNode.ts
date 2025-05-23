import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from 'lexical';

import { TextNode } from 'lexical';

export type SerializedEmojiNode = Spread<
  {
    unifiedID: string;
  },
  SerializedTextNode
>;

const BASE_EMOJI_URI =
  '/node_modules/emoji-datasource-facebook/img/facebook/64';

export class EmojiNode extends TextNode {
  __unifiedID: string;

  constructor(unifiedID: string, key?: NodeKey) {
    const unicodeEmoji = String.fromCodePoint(
      ...unifiedID.split('-').map((v) => parseInt(v, 16))
    );
    super(unicodeEmoji, key);

    this.__unifiedID = unifiedID.toLowerCase();
  }

  static getType(): string {
    return 'emoji';
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__unifiedID, node.__key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement('span');
    dom.className = 'emoji-node';
    dom.style.backgroundImage = `url('${BASE_EMOJI_URI}/${this.__unifiedID}.png')`;
    dom.innerText = this.__text;
    return dom;
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    return $createEmojiNode(serializedNode.unifiedID);
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      unifiedID: this.__unifiedID,
    };
  }
}

export const $createEmojiNode = (unifiedID: string): EmojiNode => {
  const node = new EmojiNode(unifiedID).setMode('token');

  return node;
};

export const $isEmojiNode = (node: LexicalNode): node is EmojiNode => {
  return node instanceof EmojiNode;
};
