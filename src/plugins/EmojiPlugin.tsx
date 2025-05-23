import { $createEmojiNode } from '@/nodes/EmojiNode';
import { findEmoji } from '@/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { TextNode } from 'lexical';
import { useEffect } from 'react';

const EmojiPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const $textNodeTransform = (node: TextNode): void => {
    if (!node.isSimpleText() || node.hasFormat('code')) {
      return;
    }

    const text = node.getTextContent();

    const emojiMatch = findEmoji(text);
    if (emojiMatch === null) {
      return;
    }

    let targetNode;
    if (emojiMatch.position === 0) {
      [targetNode] = node.splitText(
        emojiMatch.position + emojiMatch.shortcode.length
      );
    } else {
      [, targetNode] = node.splitText(
        emojiMatch.position,
        emojiMatch.position + emojiMatch.shortcode.length
      );
    }

    const emojiNode = $createEmojiNode(emojiMatch.unifiedID);
    targetNode.replace(emojiNode);
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerNodeTransform(TextNode, $textNodeTransform)
    );
  }, [editor]);

  return null;
};

export default EmojiPlugin;
