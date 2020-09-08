import React from 'react';
import { Nullish } from '../typings/common';

const NEW_LINE_REGEXP = /(\r\n|\r|\n)/g;

/**
 * Reference:
 * https://github.com/yosuke-furukawa/react-nl2br/blob/master/index.js
 */
export function nl2br(text: Nullish<string>): React.ReactNodeArray | null {
  if (!text) return null;

  return text.split(NEW_LINE_REGEXP).map((line, index) => {
    if (line.match(NEW_LINE_REGEXP)) {
      return React.createElement('br', { key: index });
    }
    return line;
  });
}
