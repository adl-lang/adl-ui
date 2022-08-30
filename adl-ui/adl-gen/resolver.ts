/* @generated from adl */
import { declResolver, ScopedDecl } from "./runtime/adl";
import { _AST_MAP as sys_adlast } from "./sys/adlast";
import { _AST_MAP as sys_annotations } from "./sys/annotations";
import { _AST_MAP as sys_dynamic } from "./sys/dynamic";
import { _AST_MAP as sys_types } from "./sys/types";

export const ADL: { [key: string]: ScopedDecl } = {
  ...sys_adlast,
  ...sys_annotations,
  ...sys_dynamic,
  ...sys_types,
};

export const RESOLVER = declResolver(ADL);
