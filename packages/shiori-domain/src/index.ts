export {
  normalizeTagsText,
  normalizeTagsArray,
  validateCreate,
  validateUpdate,
  isEffectivelyEmpty,
  makeDedupeKey,
} from "./validators/LogValidator.js";

export type { SubmitValue } from "./validators/LogValidator.js";

export { validateContentBlocks } from "./validators/contentBlocksValidator.js";
