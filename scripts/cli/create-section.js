#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sectionName = process.argv[2];

if (!sectionName) {
    console.error('❌  Devi specificare il nome della sezione. Esempio: node create-section.js Hero');
    process.exit(1);
}

const sectionFileName = `${sectionName}.js`;
const targetDir = path.join(__dirname, 'src', 'templates', 'sections');
const targetPath = path.join(targetDir, sectionFileName);

if (fs.existsSync(targetPath)) {
    console.error(`❌  La sezione "${sectionName}" esiste già.`);
    process.exit(1);
}

const content = `
// ${sectionName}.js - generato con create-section

const ${sectionName}Model = [
  { name: 'title', type: 'text', label: 'Titolo' }
];

function ${sectionName}EditorLayout({ fields }) {
  return (
    <div className="${sectionName.toLowerCase()}-editor">
      <FormFields fields={fields} />
    </div>
  );
}

function ${sectionName}HtmlLayout({ fields }) {
  return (
    <div className="${sectionName.toLowerCase()}-html">
      <StaticFields fields={fields} />
    </div>
  );
}

export function ${sectionName}Editor() {
  return (
    <Form model={${sectionName}Model}>
      {(fields) => <${sectionName}EditorLayout fields={fields} />}
    </Form>
  );
}

export function ${sectionName}Html() {
  return (
    <StaticRenderer model={${sectionName}Model}>
      {(fields) => <${sectionName}HtmlLayout fields={fields} />}
    </StaticRenderer>
  );
}
`;

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(targetPath, content.trimStart());

console.log(`✅  Sezione "${sectionName}" creata in: ${targetPath}`);
