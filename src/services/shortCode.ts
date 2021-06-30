import ReactDOM from 'react-dom';
import { createUuid } from '../utils/common';
import React from 'react';

interface ShortCodeProps {
  [key: string]: string;
}

class ShortCodeService {
  name: string;
  propNames: Array<string>;
  propsMap: Map<string, ShortCodeProps>;

  constructor(name: string, propNames?: Array<string>) {
    this.name = name;
    this.propNames = propNames || [];
    this.propsMap = new Map();
  }

  getShortCodeRegex() {
    if (this.propNames.length === 0) {
      return new RegExp(`\\[${this.name}\\]`, 'gi');
    }

    const propsRegexPartItems = this.propNames
        .map((propName) => `(?<${propName}>${propName}=".*?")`);

    let propsRegexPart = "";
    propsRegexPartItems.forEach((propsRegexPartItem, ind) => {
      propsRegexPart += '(\\s' + (ind === 0 ? '*' : '') +propsRegexPartItem + ')*';
    });

    return new RegExp(`\\[${this.name}\\s(?<props>${propsRegexPart})\\]`, 'gi');
  }

  getShortCodeMatches(content: string) {
    return content.match(this.getShortCodeRegex()) || [];
  }

  getPropsRegex() {
    const propNamesPart = this.propNames.join('|');
    return new RegExp(`(?:${propNamesPart})=".*?"`, 'gi');
  }

  getShortCodeProps(shortCode: string): ShortCodeProps {
    const propsRegex = this.getPropsRegex();
    const propsMatches = shortCode.match(propsRegex) || [];
    const props: ShortCodeProps = {};

    propsMatches.forEach((propMatch) => {
      const separator = '=';
      const index = propMatch.indexOf(separator);
      const propName = propMatch.slice(0, index);
      const propValue = propMatch.slice(index + separator.length);

      // trim double quotes
      props[propName] = propValue.slice(1, -1);
    });

    return props;
  }

  getShortCodeElement(shortCode: string): string {
    const props = this.getShortCodeProps(shortCode);
    const shortCodeUuid = createUuid();

    this.propsMap.set(shortCodeUuid, props);

    const propsAttrs = Object.entries(props)
      .map(([propName, propValue]) => {
        return `data-prop-${propName}="${propValue}"`;
      })
      .join(' ');

    return `<div id="${shortCodeUuid}" data-short-code="${this.name}" ${propsAttrs}></div>`;
  }

  getShortCodePropsByUuid<Props extends ShortCodeProps>(
    uuid: string
  ): Props | null {
    return (this.propsMap.get(uuid) as Props) || null;
  }

  getShortCodePropsByElement<Props extends ShortCodeProps>(
    element: Element
  ): Props | null {
    const uuid = element.getAttribute('id');

    if (!uuid) return null;

    return this.getShortCodePropsByUuid<Props>(uuid);
  }

  replaceShortCodeByElement(content: string): string {
    const shortCodes = this.getShortCodeMatches(content);
    let replacedContent = content;

    shortCodes.forEach((shortCode) => {
      const element = this.getShortCodeElement(shortCode);

      replacedContent = replacedContent.replace(shortCode, element);
    });

    return replacedContent;
  }

  queryShortCodeElements(): NodeListOf<Element> {
    return document.querySelectorAll(`[data-short-code="${this.name}"]`);
  }

  renderComponent<Props extends ShortCodeProps>(
    ShortCodeComponent: React.ComponentType<Props>
  ) {
    const elements = this.queryShortCodeElements();

    elements.forEach((container) => {
      const props = this.getShortCodePropsByElement<Props>(container);

      if (props) {
        const shortCodeReactElement = React.createElement(
          ShortCodeComponent,
          props
        );
        ReactDOM.render(shortCodeReactElement, container);
      }
    });
  }
}

export default ShortCodeService;
