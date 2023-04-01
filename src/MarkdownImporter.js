import * as remark from 'remark';
import remarkParse from 'remark-parse';

import { parseMarkdownToHeader } from './BlockTypeParsers/HeaderTypeParser';
import { parseMarkdownToParagraph } from './BlockTypeParsers/ParagraphTypeParser';
import { parseMarkdownToList } from './BlockTypeParsers/ListTypeParser';
import { parseMarkdownToDelimiter } from './BlockTypeParsers/DelimiterTypeParser';
import { parseMarkdownToCode } from './BlockTypeParsers/CodeTypeParser';
import { parseMarkdownToQuote } from './BlockTypeParsers/QuoteTypeParser';

export const editorData = [];

/**
 * Parse markdown to editor data blocks recursively
 * @param {String} content - markdown content
 * @return {Array} - parsed editor data blocks
 */
export async function parseToBlocks(content) {
  // parse markdown to editor data
  const parsedMarkdown = remark().use(remarkParse, { commonmark: true }).parse(content);
  // parse children recursively and return editor data blocks
  console.log(parsedMarkdown);
  function parseChildren(children) {
    const result = [];
    children.forEach((child) => {
      switch (child.type) {
        case 'heading':
          result.push(parseMarkdownToHeader(child));
          break;
        case 'paragraph':
          result.push(parseMarkdownToParagraph(child));
          break;
        case 'list':
          result.push(parseMarkdownToList(child));
          break;
        case 'thematicBreak':
          result.push(parseMarkdownToDelimiter());
          break;
        case 'code':
          result.push(parseMarkdownToCode(child));
          break;
        case 'blockquote':
          result.push(parseMarkdownToQuote(child));
          break;
        default:
          //result.push(parseMarkdownToParagraph(child));
          break;

      }
      if (child.children && child.type!=='list') {
        const childResult = parseChildren(child.children);
        result.push(...childResult);
      }
    });
    return result.filter((value) => Object.keys(value).length !== 0);
  }
  return parseChildren(parsedMarkdown.children);
}

/**
 * Markdown Import class
 */
export default class MarkdownImporter {
  /**
   * creates the Importer plugin
   * {editorData, api functions} - necessary to interact with the editor
   */
  constructor({ data, api, config, block }) {

    // default variables
    this.data = data;
    this.api = api;
    this.config = config || {};
    this.config.extensions = this.config.extensions || ['md', 'markdown', 'txt'];
    this.block = block;

    // plugin variables
    this.wrapper = null;
    this.settingsWrapper = null;

    this.fileUploadInput = null;
    this.fileUploadButton = null;

    this.stringUploadInput = null;
    this.stringUploadButton = null;

    this.settings = [
      /*
      {
        name: 'replaceContent',
        label: 'Replace current content',
        icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.28h2.25v.237h1.15-1.15zM1.9 8.455v-3.42c0-1.154.985-2.09 2.2-2.09h4.2v2.137H4.15v3.373H1.9zm0 2.137h2.25v3.325H8.3v2.138H4.1c-1.215 0-2.2-.936-2.2-2.09v-3.373zm15.05-2.137H14.7V5.082h-4.15V2.945h4.2c1.215 0 2.2.936 2.2 2.09v3.42z"/></svg>`
      }
      */
    ];
  }

  /**
   * @return Plugin data such as title and icon
   */
  static get toolbox() {
    return {
      title: 'Import Markdown',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(112, 118, 132)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-fileUploadInput"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
    };
  }

  /**
   * Paste handler for the plugin
   */
  static get pasteConfig() {
    return {
      files: {
        mimeTypes: ['text/*'],
        extensions: ['md', 'markdown', 'txt'] // You can specify extensions instead of mime-types
      }
    }
  }

  onPaste(event) {
    switch (event.type) {
      case 'file':
        /* We need to read file here as base64 string */
        const file = event.detail.file;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const content = loadEvent.target.result;
          return this.parse(content); // parse the markdown file
        };
        reader.readAsText(file, 'UTF-8'); // read the file as text
        break;
    }
  }

  /**
  * Function inserts an array into another array at a given index
  * @param {Array} target - the array to insert into
  * @param {Array} body - the array to insert
  * @param {Number} startIndex - the index to insert at
  * @return {Array} - the new array with the body inserted at the index
  */
  insertArray(target, body, startIndex) {
    let tail = target.splice(startIndex); // target is now [1,2] and the head
    return [].concat(target, body, tail);
  }

  /**
  * Function which parses markdown file to JSON which correspons the the editor structure
  */
  async parse(markdownData) {
    // clear the editor
    const data = await this.api.saver.save();
    if (!this.config.append)
      this.api.blocks.clear();
    var toBlocksData = await parseToBlocks(markdownData); // parse the markdown file to JSON
    var blocksData = (this.config.append) ? this.insertArray(data.blocks, toBlocksData, this.api.blocks.getCurrentBlockIndex()) : toBlocksData; 

    blocksData = blocksData.filter((item) => { if (item.type != 'markdownImporter') return item; });  // filter through array and remove empty objects

    // render the editor with imported markdown data
    this.api.blocks.render({
      blocks: blocksData, // filter through array and remove empty objects
    });

    // call the callback function
    if (this.config.callback) {
      this.config.callback({
        blocks: blocksData, // filter through array and remove empty objects
      });
    }
  }

  /**
   * Function which creates the plugin UI
   */
  async upload() {
    // empty the array before running the function again
    editorData.length = 0;
    this.fileUploadInput.onchange = (e) => {
      const file = e.target.files[0];
      console.log(e.target);
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result;
        console.log(content.replace(/(?<!`)`(?!`)([^`]+)`(?!`)(?<!`)/g, '<code>$1</code>'));
        return this.parse(content.replace(/(?<!`)`(?!`)([^`]+)`(?!`)(?<!`)/g, '<code>$1</code>'));
      };
      reader.readAsText(file, 'UTF-8');
    };
  }

  /**
   * Renders the plugin UI
   * @return {HTMLDivElement} wrapper - the plugin UI
   */
  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('cdx-block');

    this.stringUploadInput = document.createElement('textarea');
    this.stringUploadInput.value = this.data && this.data.filename ? this.data.filename : '';
    this.stringUploadInput.classList.add('cdx-input');


    this.wrapper.appendChild(this.stringUploadInput);

    this.stringUploadButton = document.createElement('button');
    this.stringUploadButton.classList.add('cdx-button');
    this.stringUploadButton.innerHTML = 'Load Markdown';
    this.stringUploadButton.onclick = () => {
      if (this.stringUploadInput.value !== '')
        return this.parse(this.stringUploadInput.value);
      else
        this.api.blocks.delete(this.api.blocks.getCurrentBlockIndex());
    };
    this.wrapper.appendChild(this.stringUploadButton);

    let divider = document.createElement('div');
    divider.innerHTML = '<small>OR</small>';
    divider.classList.add('cdx-block__divider');
    this.wrapper.appendChild(divider);

    this.fileUploadInput = (!this.fileUploadInput) ? document.createElement('input') : this.fileUploadInput;
    this.fileUploadInput.hidden = true;
    this.fileUploadInput.type = 'file';
    this.fileUploadInput.id = 'file-upload';
    this.fileUploadInput.name = 'files[]';
    this.fileUploadInput.classList.add('cdx-button');
    this.wrapper.appendChild(this.fileUploadInput);
    this.fileUploadButton = document.createElement('button');
    this.fileUploadButton.classList.add('cdx-button');
    this.fileUploadButton.innerHTML = 'Upload Markdown .md file';
    this.fileUploadButton.onclick = () => {
      this.fileUploadInput.click();
    };
    this.wrapper.appendChild(this.fileUploadButton);

    this.upload();
    return this.wrapper;
  }

  /**
   * Renders the plugin settings
   * @return {HTMLDivElement} settingsWrapper - the plugin settings
   */
  renderSettings() {
    this.settingsWrapper = document.createElement('div');
    this.settings.forEach(tune => {
      let settingWrapper = document.createElement('div');
      settingWrapper.classList.add('ce-popover__item');

      let button = document.createElement('div');
      button.classList.add('ce-popover__item-icon');
      button.innerHTML = tune.icon;
      settingWrapper.appendChild(button);

      let label = document.createElement('div');
      label.classList.add('ce-popover__item-label');
      label.innerHTML = tune.label;
      settingWrapper.appendChild(label);

      this.settingsWrapper.appendChild(settingWrapper);
    });

    return this.settingsWrapper;
  }

  /**
   * Saves the plugin data into JSON format (used as placeholder for UI)
   * @return {Object} data - the plugin data
   */
  save() {
    return {
      message: 'Uploading Markdown',
    };
  }
}
