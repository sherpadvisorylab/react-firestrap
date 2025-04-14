const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const componentsDir = path.join(__dirname, '../src/components');
const readmeFilePath = path.join(__dirname, '../README.md');

function getComponentList(dir) {
    const files = fs.readdirSync(dir);
    return files.filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));
}

function extractProps(componentPath) {
    const source = fs.readFileSync(componentPath, 'utf-8');
    const sourceFile = ts.createSourceFile(componentPath, source, ts.ScriptTarget.Latest, true);

    let propsInfo = '';

    ts.forEachChild(sourceFile, (node) => {
        console.log(node);
        // Cerca funzioni e componenti a freccia con props tipizzate
        if (ts.isVariableDeclaration(node) && node.initializer && node.initializer.parameters) {
            const params = node.initializer.parameters;

            params.forEach(param => {
                if (param.type && ts.isTypeLiteralNode(param.type)) {
                    propsInfo += `### Props:\n| Prop | Tipo |\n| ---- | ---- |\n`;
                    param.type.members.forEach(member => {
                        const propName = member.name.escapedText;
                        const propType = member.type.getText(sourceFile);
                        propsInfo += `| ${propName} | ${propType} |\n`;
                    });
                }
            });
        }
    });

    return propsInfo;
}

function updateReadme(components) {
    const readmeContent = fs.readFileSync(readmeFilePath, 'utf-8');

    let newSection = `
## Componenti Disponibili

Ecco un elenco dei componenti disponibili in questo progetto, insieme alle loro props:

`;

    components.forEach(component => {
        const componentName = component.replace(/\.(tsx|ts)$/, '');
        const componentPath = path.join(componentsDir, component);
        const props = extractProps(componentPath);

        newSection += `### ${componentName}\n\n${props || 'Questo componente non ha props definite.'}\n\n`;
    });

    const updatedReadmeContent = readmeContent.replace(
        /## Componenti Disponibili[\s\S]*?(?=\n## |$)/,
        newSection
    );

    fs.writeFileSync(readmeFilePath, updatedReadmeContent, 'utf-8');
    console.log('README.md aggiornato con successo!');
}

const components = getComponentList(componentsDir);
updateReadme(components);
