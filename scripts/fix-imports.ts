import { Project } from 'ts-morph';
import path from 'node:path';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
  skipAddingFilesFromTsConfig: true,
});

const distPath = path.resolve('dist');

project.addSourceFilesAtPaths(`${distPath}/**/*.js`);

for (const sourceFile of project.getSourceFiles()) {
  let changed = false;

  const statements = [
    ...sourceFile.getImportDeclarations(),
    ...sourceFile.getExportDeclarations().filter((e) => e.getModuleSpecifier()),
  ];

  statements.forEach((statement) => {
    const spec = statement.getModuleSpecifierValue();

    if (
      spec &&
      spec.startsWith('.') &&
      !spec.endsWith('.js') &&
      !spec.includes('?') &&
      !spec.includes('#')
    ) {
      statement.setModuleSpecifier(`${spec}.js`);
      changed = true;
    }
  });

  if (changed) sourceFile.saveSync();
}
