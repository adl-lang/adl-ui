import { FieldFns } from "./fields/type";

import { getFormLabelFromAnnotation, getTableViewFromAnnotation } from "./adl-annotations";
import { enumField, maybeField, nullableField, adlPrimitiveFieldFns } from "./fields/adl";
import {
  Expr,
  FieldPredicate,
  makeExprLike,
  makeTableView,
  SortDirection,
  SortField,
  TableView
} from "@/adl-gen/common/tabular";
import { ATypeExpr, DeclResolver, ScopedDecl } from "@/adl-gen/runtime/adl";
import { isEnum } from "@/adl-gen/runtime/utils";
import * as adlast from "@/adl-gen/sys/adlast";
import * as adltree from "./adl-tree";
import { CustomContext, fieldLabel } from "./veditor/adlfactory";

// This file contains various helper functions for dealing
// with adl table data.

// API cleanup TODOS
// - get rid of CI param
// - merge headerCell & tableCell in factory interface, & get rid of onClick

export interface CellPopup<CI> {
  loc: CellLoc<CI>;
  render(): JSX.Element;
}

type CustomFieldFn = (ctx: CustomContext) => FieldFns<unknown> | null;

export type TableSection = "header" | "body";

/** CI - type representing the column index, e.g. if you want string vs int */
export interface CellLoc<CI> {
  section: TableSection;

  /** Starts at zero */
  rowi: number;

  coli: CI;
}

export type CellContent = null | {
  value: JSX.Element | string; // TODO(dan/timd) consider removing the 'string' option
  style: { [key: string]: string } | null;
};

export function cellContent(value: string | JSX.Element): CellContent {
  return { value, style: null };
}

export interface Column<T, CI> {
  id: CI;
  header: CellContent;
  content(item: T, i: number): CellContent;
}

export interface TableFactory {
  table(headerCells: JSX.Element[], rows: JSX.Element[]): JSX.Element;
  tableRow(i: number, cells: JSX.Element[], style: string): JSX.Element;

  headerCell(i: number, content: CellContent, popupContent: JSX.Element | null): JSX.Element;
  tableCell(
    i: number,
    onClick: () => void,
    content: CellContent,
    popupContent: JSX.Element | null
  ): JSX.Element;
}

export interface AdlColumn<T> {
  fieldname: string;
  label: string;
  defaultVisible: boolean;
  column: Column<T, string>;
  fieldfns: FieldFns<T>; // TODO(timd) generalize this to an arbitrary editor
  adlTree: adltree.AdlTree;
}

export interface AdlTableInfo {
  columns: AdlColumn<unknown>[];
  columnsByFieldName: { [key: string]: AdlColumn<unknown> };
  defaultView: TableView;
}

// Type to capture a value along with it's corresponding id.
export interface WithId<I, T> {
  id: I;
  value: T;
}

// Derive column information from an adl structure
export function getAdlTableInfo<T>(
  declResolver: DeclResolver,
  typeExpr: ATypeExpr<T>,
  customFields?: CustomFieldFn
): AdlTableInfo {
  const adlStruct = adltree.createAdlTree(typeExpr.value, declResolver).details();

  if (adlStruct.kind !== "struct") {
    throw new Error("AdlTable only implemented for struct types");
  }

  const scopedDecl = {
    moduleName: adlStruct.moduleName,
    decl: adlStruct.astDecl
  };

  const columns: AdlColumn<unknown>[] = [];

  const view = getTableViewFromAnnotation(declResolver, adlStruct.astDecl);

  adlStruct.fields.forEach(f => {
    const fieldfns = getFieldFns(declResolver, scopedDecl, f.astField, f.adlTree, customFields);
    if (fieldfns !== null) {
      const fieldfnsT: FieldFns<unknown> = fieldfns;
      const defaultVisible = view ? view.columns.indexOf(f.astField.name) !== -1 : true;
      const label =
        getFormLabelFromAnnotation(declResolver, f.astField) || fieldLabel(f.astField.name);

      // A column containing multi line strings
      const content = (item: {[key : string] : unknown}): CellContent => {
        const text = fieldfnsT.toText(item[f.astField.name]);
        // show max 40 characters of the first line
        const s = text;
        let line0 = s.split("\n")[0].substr(0, 40);
        if (line0.length < s.length) {
          line0 = line0 + "...";
        }
        return cellContent(line0);
      };

      columns.push({
        fieldname: f.astField.name,
        adlTree: f.adlTree,
        label,
        defaultVisible,
        fieldfns: fieldfnsT,
        column: {
          id: f.astField.name,
          header: cellContent(label),
          content
        }
      });
    }
  });

  const defaultView =
    view ||
    makeTableView({
      columns: columns.map(c => c.fieldname)
    });

  const columnsByFieldName : {[key: string] : AdlColumn<unknown>}= {};
  columns.forEach(c => {
    columnsByFieldName[c.fieldname] = c;
  });

  return { columns, columnsByFieldName, defaultView };
}

export function getFieldFns(
  declResolver: DeclResolver,
  scopedDecl: ScopedDecl | null,
  field: adlast.Field | null,
  t: adltree.AdlTree,
  customFields?: CustomFieldFn
): FieldFns<unknown> | null {
  if (customFields) {
    const typeExpr = t.typeExpr;
    const fieldfns = customFields({ declResolver, scopedDecl, field, typeExpr });
    if (fieldfns) {
      return fieldfns;
    }
  }
  const fdetails = t.details();
  if (fdetails.kind === "typedef") {
    return getFieldFns(declResolver, scopedDecl, field, fdetails.adlTree, customFields);
  } else if (fdetails.kind === "newtype") {
      return getFieldFns(declResolver, scopedDecl, field, fdetails.adlTree, customFields);
  } else if (fdetails.kind === "primitive") {
    return adlPrimitiveFieldFns(fdetails.ptype);
  } else if (fdetails.kind === "nullable") {
    const fieldfns = getFieldFns(declResolver, scopedDecl, field, fdetails.param, customFields);
    if (fieldfns === null) {
      return null;
    }
    return nullableField(fieldfns);
  } else if (
    fdetails.kind === "union" &&
    fdetails.moduleName === "sys.types" &&
    fdetails.astDecl.name === "Maybe"
  ) {
    const t2 = adltree.createAdlTree(t.typeExpr.parameters[0], declResolver);
    const fieldfns = getFieldFns(declResolver, scopedDecl, field, t2, customFields);
    if (fieldfns === null) {
      return null;
    }
    return maybeField(fieldfns);
  } else if (
    fdetails.kind === "union" &&
    fdetails.astDecl.type_.kind === "union_" &&
    isEnum(fdetails.astDecl.type_.value)
  ) {
    return enumField(fdetails.astDecl, fdetails.astDecl.type_.value);
  }
  return null;
}

function exprToString(expr: Expr): string {
  switch (expr.kind) {
    case "string":
    case "instant":
    case "date":
      return `'${expr.value}'`;
    case "int":
    case "bool":
      return `${expr.value}`;
    case "field":
      return expr.value;
    case "concat":
      return `concat(${expr.value.map(exprToString).join(", ")})`;
    case "currentDate":
      return "<current date>";
  }
}

function fieldPredicateToStringImpl(fp: FieldPredicate, prec: number): string {
  // prec is the operator precedence, and is use to decide when parentheses are required.
  let prec1: number = 4;
  switch (fp.kind) {
    case "or":
      prec1 = 1;
      break;
    case "and":
      prec1 = 2;
      break;
    case "not":
      prec1 = 3;
      break;
    default:
  }

  let expr = "?";

  switch (fp.kind) {
    case "equalTo":
      expr = `${exprToString(fp.value.expr1)} = ${exprToString(fp.value.expr2)}`
      break;
    case "greaterThan":
      expr = `${exprToString(fp.value.expr1)} > ${exprToString(fp.value.expr2)}`
      break;
    case "lessThan":
      expr = `${exprToString(fp.value.expr1)} < ${exprToString(fp.value.expr2)}`
      break;
    case "like":
      const op = fp.value.caseSensitive ? "like" : "ilike";
      expr = `${exprToString(fp.value.expr)} ${op} ${fp.value.pattern}`
      break;
    case "in":
      expr = `${exprToString(fp.value.expr)} in (${fp.value.exprs.map(exprToString).join(", ")})`;
      break;
    case "isnull":
      expr = `${exprToString(fp.value)} is null`;
      break;
    case "literal":
      expr = fp.value ? "true" : "false";
      break;
    case "not":
      expr = "not " + fieldPredicateToStringImpl(fp.value, prec1);
      break;
    case "and":
      expr = fp.value.map(v => fieldPredicateToStringImpl(v, prec1)).join(" and ");
      break;
    case "or":
      expr = fp.value.map(v => fieldPredicateToStringImpl(v, prec1)).join(" or ");
      break;
    default:
  }
  if (prec > prec1) {
    return "(" + expr + ")";
  }
  return expr;
}

export function fieldPredicateToString(fp: FieldPredicate): string {
  return fieldPredicateToStringImpl(fp, 0);
}

// Simplify a field predicate by eliminating redundant literal
// values.
export function simplifyFieldPredicate(fp: FieldPredicate): FieldPredicate {
  switch (fp.kind) {
    case "equalTo":
    case "greaterThan":
    case "lessThan":
    case "like":
    case "in":
    case "isnull":
    case "literal":
      return fp;
    case "not":
      const fp1 = simplifyFieldPredicate(fp.value);
      if (fp1.kind === "literal") {
        return { kind: "literal", value: !fp1.value };
      }
      return fp;
    case "and": {
      const clauses = fp.value
        .map(simplifyFieldPredicate)
        .filter(v => !(v.kind === "literal" && v.value));
      if (clauses.filter(v => v.kind === "literal" && v.value).length > 0) {
        return { kind: "literal", value: false };
      } else if (clauses.length === 0) {
        return { kind: "literal", value: true };
      } else {
        return { kind: "and", value: clauses };
      }
    }
    case "or": {
      const clauses = fp.value
        .map(simplifyFieldPredicate)
        .filter(v => !(v.kind === "literal" && v.value));
      if (clauses.filter(v => v.kind === "literal" && v.value).length > 0) {
        return { kind: "literal", value: true };
      } else if (clauses.length === 0) {
        return { kind: "literal", value: false };
      } else {
        return { kind: "or", value: clauses };
      }
    }
  }
}

/**
 * Translates, if possible, a filter predicate into a field choice filter whose UI is a set of checkboxes.
 * Returns the set of choices selected by the filter checkboxes, or an empty string if nothing was selected or
 * the predicate does not have a choice expression for the target field.
 */
export function getFieldChoiceFilter(filter: FieldPredicate, field: string): string[] {
  // Match an appropriate clause in a top level and expression
  if (filter.kind === "and") {
    for (const fp of filter.value) {
      if (fp.kind === "in" && fp.value.expr.kind === 'field' && fp.value.expr.value === field) {
        const result: string[] = [];
        for (const expr of fp.value.exprs) {
          if (expr.kind === 'string') {
            result.push(expr.value);
          } else {
            return [];
          }
        }
        return result;
      }
    }
  }
  return [];
}



/**
 * Augments an existing filter predicate with field choices made from a set of checkboxes in the UI.
 * If an existing choice filter exists it is replaced with the new selected values.  Existing predicate is augmented
 * by combining with the field choice filter through an AND.
 */
export function withFieldChoiceFilter(
  filter: FieldPredicate,
  field: string,
  values: string[]
): FieldPredicate {
  const inPredicate: FieldPredicate =
    values.length === 0
      ? { kind: "literal", value: true }
      : { kind: "in", value: { expr: { kind: "field", value: field }, exprs: values.map(value => ({ kind: "string", value })) } }
    ;

  // By default assume that we add a wrapping and clause
  let newfilter: FieldPredicate = { kind: "and", value: [filter, inPredicate] };

  if (filter.kind === "and") {
    // unless we have an existing and predicate, where we replace the appropriate clause
    const newAnds = filter.value.filter(fp => !(fp.kind === "in" && fp.value.expr.kind === 'field' && fp.value.expr.value === field));
    newAnds.push(inPredicate);
    newfilter = { kind: "and", value: newAnds };
  } else if (filter.kind === "literal") {
    // unless we have a literal, in which case we replace it with and predicate
    newfilter = { kind: "and", value: [inPredicate] };
  }

  return simplifyFieldPredicate(newfilter);
}

export function getFieldFilter(filter: FieldPredicate, field: string): string {
  // Match an appropriate clause in a top level and expression
  if (filter.kind === "and") {
    for (const fp of filter.value) {
      if (fp.kind === "like" && fp.value.expr.kind === 'field' && fp.value.expr.value === field) {
        let pattern = fp.value.pattern;
        if (pattern.startsWith("%")) {
          pattern = pattern.substr(1);
        }
        if (pattern.endsWith("%")) {
          pattern = pattern.substr(0, pattern.length - 1);
        }
        return pattern;
      }
    }
  }
  return "";
}

export function withFieldFilter(
  filter: FieldPredicate,
  field: string,
  pattern: string
): FieldPredicate {
  const likefp: FieldPredicate =
    pattern === ""
      ? { kind: "literal", value: true }
      : {
        kind: "like",
        value: makeExprLike({
          expr: { kind: 'field', value: field },
          pattern: "%" + pattern + "%",
        }),
      };

  // By default assume that we add a wrapping and clause
  let newfilter: FieldPredicate = { kind: "and", value: [filter, likefp] };

  if (filter.kind === "and") {
    // unless we have an existing and predicate, where we replace the appropriate clause
    const newands = filter.value.filter(
      fp =>
        !(fp.kind === "like" && fp.value.expr.kind === 'field' && fp.value.expr.value === field)
    );
    newands.push(likefp);
    newfilter = { kind: "and", value: newands };
  } else if (filter.kind === "literal") {
    // unless we have a literal, in which case we replace it with and predicate
    newfilter = { kind: "and", value: [likefp] };
  }

  return simplifyFieldPredicate(newfilter);
}

// View manipulation functions

export function getViewSort(view: TableView, field: string): SortDirection | null {
  const sortfield = view.sorting.find(sf => sf.field === field);
  if (!sortfield) {
    return null;
  }
  return sortfield.direction;
}

export function withViewSort(
  view: TableView,
  fieldname: string,
  direction: SortDirection
): TableView {
  const newview = { ...view };
  // Need to make a copy of the view def sort array to avoid changes being
  // made to the passed in props.
  const sortFields = Array.from(newview.sorting);
  // Do not allow any duplicate sort fields.
  const sortIndex = sortFields.findIndex(s => {
    return s.field === fieldname;
  });
  if (sortIndex !== -1) {
    const sortField: SortField = sortFields.splice(sortIndex, 1)[0];
    // Turn of sorting of the given field if the same sort direction is selected
    if (sortField.direction !== direction) {
      sortField.direction = direction;
      sortFields.push(sortField);
    }
  } else {
    sortFields.push({ field: fieldname, direction });
  }
  newview.sorting = sortFields;
  return newview;
}