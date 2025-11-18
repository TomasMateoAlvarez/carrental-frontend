const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Agregar scripts de build optimizados para Vercel
packageJson.scripts = {
  ...packageJson.scripts,
  "build": "vite build",
  "build:vercel": "npm run build",
  "preview": "vite preview",
  "vercel-build": "npm run build"
};

// Configurar engines (opcional)
packageJson.engines = {
  "node": ">=18.0.0",
  "npm": ">=8.0.0"
};

// Optimizaciones para build
if (!packageJson.browserslist) {
  packageJson.browserslist = {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  };
}

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ package.json optimizado para Vercel');
