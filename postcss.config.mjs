/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // CHANGE: We use the standard name, not the @ package
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;