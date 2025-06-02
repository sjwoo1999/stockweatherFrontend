// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ⭐⭐ 여기에 새로운 설정 객체를 추가합니다. ⭐⭐
  {
    // 특정 파일에만 적용하려면 files 속성을 추가할 수 있습니다.
    // 예를 들어, '**/*.ts', '**/*.tsx'
    rules: {
      // @typescript-eslint/no-unused-vars 규칙을 재정의합니다.
      "@typescript-eslint/no-unused-vars": [
        "warn", // 또는 "error", 경고 수준
        {
          "argsIgnorePattern": "^_",       // 함수 인자 중 '_'로 시작하는 것은 무시
          "varsIgnorePattern": "^_",       // 일반 변수 중 '_'로 시작하는 것은 무시
          "caughtErrorsIgnorePattern": "^_" // catch 블록의 에러 변수 중 '_'로 시작하는 것은 무시
        }
      ]
    }
  }
];

export default eslintConfig;