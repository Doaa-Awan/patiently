import fs from 'fs';
import postcss from 'postcss';
import tailwindPlugin from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

const input = 'src/index.css';
const output = 'src/tw-generated.css';

(async () => {
  try {
    const css = fs.readFileSync(input, 'utf8');
    const result = await postcss([tailwindPlugin(), autoprefixer()]).process(css, {
      from: input,
      to: output,
    });
    fs.writeFileSync(output, result.css);
    console.log('Wrote', output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
