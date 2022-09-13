/* @generated from adl */
import { declResolver, ScopedDecl } from "./runtime/adl";
import { _AST_MAP as common } from "./common";
import { _AST_MAP as common_db } from "./common/db";
import { _AST_MAP as common_strings } from "./common/strings";
import { _AST_MAP as common_tabular } from "./common/tabular";
import { _AST_MAP as common_ui } from "./common/ui";
import { _AST_MAP as examples } from "./examples";
import { _AST_MAP as sys_adlast } from "./sys/adlast";
import { _AST_MAP as sys_annotations } from "./sys/annotations";
import { _AST_MAP as sys_dynamic } from "./sys/dynamic";
import { _AST_MAP as sys_types } from "./sys/types";

export const ADL: { [key: string]: ScopedDecl } = {
  ...common,
  ...common_db,
  ...common_strings,
  ...common_tabular,
  ...common_ui,
  ...examples,
  ...sys_adlast,
  ...sys_annotations,
  ...sys_dynamic,
  ...sys_types,
};

export const RESOLVER = declResolver(ADL);
