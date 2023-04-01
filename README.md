# editorjs-md-parser
Editor.js markdown parser with dinamically import/export functions.\
Forked from https://github.com/stejul/editorjs-markdown-parser, and converted from yarn into an npm package.

##### Additional capabilities and changes:
- [x] Refactored functions to enable parsering without upload/download files.
- [x] Textarea input for markdown insert from string
- [x] Paste support for .md and .txt files (with drag and drop)
- [x] Recoursive function for markdown to blocks
- [x] Config options import/export with callbacks
- [\] Support inline attributes for strong, emphasis, links (work in progress)


## Usage

- Load up the bundled file (dist/bundle.js) in you document or import from npm package:

```bash
// from npm package installed with `npm i editorjs-md-parser`
import MDParser from 'editorjs-md-parser';
import MDImporter from 'editorjs-md-parser';
```

- Add the file Importer/Exporter to the EditorJS tools:

```js
const editor = new EditorJS({
    autofocuse: true,
    tools: {
      markdownParser: {
          class: MDParser,
          config: {
              filename: 'test',
              timestamp: true,
              callback: (blocksData) => { console.log("Callback MDParser", blocksData) }
          },
      },

      markdownImporter: {
          class: MDImporter,
          config: {
              append: true,
              extensions: ['md', 'txt'],
              callback: (blocksData) => { console.log("Callback MDImporter", blocksData) }
          },
      }
    },
};
```

***The Plugin can now be used in the Editor-Toolbar with file upload/download***

Also, to parse a string dinamically without file upload/download, you can use the **new functions**:

```js
//parse markdown string input and load into editor
MDImporter.parseFromMarkdown(content:string):void
//parse editor content json and return a markdown string output
MDParser.parseToMarkdown():string
```

## Developing

To install npm packages and build, from this project root folder, run:

```
npm install
npm run build
```

A fresh new /dev/bundle.js file will be created.

## Contributing

Same from original repo, 
contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add some NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## Acknowledgements

Thanks to https://github.com/stejul for his original great parser script, this is just a little change!
