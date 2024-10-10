import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  { files: ["**/*.js"], rules: { semi: ["error", "always"] }, languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
];
