export function parseParagraphToMarkdown(blocks) {
  return `${blocks.text}\n`;
}

export function parseMarkdownToParagraph(blocks) {
  let paragraphData = {
    data: {
      text: '',
    },
    type: 'paragraph',
  };

  if (blocks.type === 'paragraph') {
    blocks.children.forEach((item) => {
      if (item.type === 'text') {
        paragraphData.data.text += item.value;
      }
      /*
      else if (item.type === 'image') {
        paragraphData = {
          data: {
            caption: item.title,
            stretched: false,
            url: item.url,
            withBackground: false,
            withBorder: false,
          },
          type: 'image',
        };
      }
      */
      else if (item.type === 'emphasis') {
        paragraphData.data.text += `<i>${item.children[0].value}<i>`;
      }
      else if (item.type === 'strong') {
        paragraphData.data.text += `<b>${item.children[0].value}<b>`;
      }
      else if (item.type === 'strongEmphasis') {
        paragraphData.data.text += `<b><i>${item.children[0].value}<i><b>`;
      }
      else if (item.type === 'link') {
        paragraphData.data.text += `<a href="${item.url}">${item.children[0].value}</a>`;
      }
      else if (item.type === 'inlineCode') {
        paragraphData.data.text += `<code class="inline-code">${item.value}</code>`;
      }
      

    });
  }
  return paragraphData;
}
