// import * as AS from "@/adl-gen/dynadl/appstate"
import * as W from '@/adl-gen/dynadl/ast';
import * as AST from '@/adl-gen/runtime/sys/adlast';
import * as ST from '@/adl-gen/sys/types';
import { assertNever } from '@/utils/types';

export interface SetFields {
  flowId: string,
  nodeId: string,
  version: number;
  previewIdx: number;
  fields: Field[],
}
export interface Field {

}

export function adlastFromDynast(
  moduleName: string,
  name: string,
  wfields: W.Fields,
  ): AST.Decl[] {
  const fields: AST.Field[] = [];
  const decls: AST.Decl[] = [];
  wfields.forEach(wf => {
    const [typeExpr, newDecls] = typeExprFromField(moduleName, `${name}$${wf.name}`, wf.fieldType);
    if (typeExpr === null) {
      return;
    }
    decls.push(...newDecls);
    const adlf = AST.makeField({
      name: wf.name,
      serializedName: wf.name,
      default: getDefault(wf.fieldType),
      annotations: [],
      typeExpr: typeExpr,
    });
    fields.push(adlf);
  });
  const struct_ = AST.makeStruct({
    typeParams: [],
    fields: fields,
  });
  const decl = AST.makeDecl({
    name: name,
    version: ST.makeMaybe("nothing", null),
    annotations: [],
    type_: AST.makeDeclType("struct_", struct_),
  });
  return [decl, ...decls];
}

function getDefault(ft: W.UITypeExpr): ST.Maybe<({} | null)> {
  switch (ft.kind) {
    case "primitive": {
      const def = ft.value.value.value.default;
      if (def === null) {
        return ST.makeMaybe("nothing", null);
      }
      switch (def!.kind) {
        case "empty_array":
          return ST.makeMaybe<{}, "just">("just", []);
        case "default_value":
          return ST.makeMaybe<({} | null), "just">("just", def.value);
        case "zero_value": {
          if (ft.value.value.kind === "optional") {
            return ST.makeMaybe<({} | null), "just">("just", null);
          }
          if (ft.value.value.kind === "multiple") {
            return ST.makeMaybe<({} | null), "just">("just", []);
          }
          switch (ft.value.kind) {
            case "string_field":
            case "password_field":
            case "markdown_field":
            case "email_field":
            case "alphanumeric_field":
            case "multiline_field":
              return ST.makeMaybe<({} | null), "just">("just", "");
            case "not_empty_field":
              return ST.makeMaybe<({} | null), "just">("just", "");
            case "bool_field":
              return ST.makeMaybe<({} | null), "just">("just", false);
            case "signed_number_field":
            case "unsigned_number_field":
            case "double_number_field":
              return ST.makeMaybe<({} | null), "just">("just", 0);
            case "json_field":
            case "string_map_field":
              return ST.makeMaybe<({} | null), "just">("just", {});
            case "instant":
              return ST.makeMaybe<({} | null), "just">("just", 0);
            case "localDate":
              return ST.makeMaybe<({} | null), "just">("just", "1970-01-01");
            case "localTime":
              return ST.makeMaybe<({} | null), "just">("just", "00:00:00");
            case "localDateTime":
              return ST.makeMaybe<({} | null), "just">("just", "1970-01-01T00:00:00");
            case "dayOfWeek":
              return ST.makeMaybe<({} | null), "just">("just", "monday");
            case "duration":
              return ST.makeMaybe<({} | null), "just">("just", "P1D");
            case "timezone":
              return ST.makeMaybe<({} | null), "just">("just", "UTC+0");
            // case "bigDecimal":
            //   return ST.makeMaybe<({} | null), "just">("just", "0");
            default:
              assertNever(ft.value);
          }
          return ST.makeMaybe("nothing", null);
        }
        default:
          assertNever(def);
      }
      return ST.makeMaybe("nothing", null);
    }
    case "record": {
      // switch (ft.value.kind) {
      //   case "optional":
      //     return ST.makeMaybe<({} | null), "just">("just", null);
      //   case "multiple":
      //     return ST.makeMaybe<({} | null), "just">("just", []);
      //   case "required":
      //     // TODO create a valid record of defaults
      //     return ST.makeMaybe<({} | null), "just">("just", {});
      // }
      return ST.makeMaybe("nothing", null);
    }
    case "oneOf": {
      // switch (ft.value.kind) {
      //   case "optional":
      //     return ST.makeMaybe<({} | null), "just">("just", null);
      //   case "multiple":
      //     return ST.makeMaybe<({} | null), "just">("just", []);
      //   case "required":
      //     // TODO create a valid union of defaults
      //     return ST.makeMaybe<({} | null), "just">("just", {});
      // }
      return ST.makeMaybe("nothing", null);
    }
  }
  // TODO complete zero values
  return ST.makeMaybe("nothing", null);
}

function typeExprFromField(moduleName: string, name: string, wf: W.UITypeExpr): [AST.TypeExpr | null, AST.Decl[]] {
  const typeRef = typeRefFromField(wf, moduleName, name);
  if (typeRef === null) {
    return [null, []];
  }
  switch (wf.kind) {
    case "primitive": {
      switch (wf.value.kind) {
        case "string_map_field": {
          const [te, newDecls] = typeExprFromField(moduleName, name, wf.value.value.value.details);
          if (te === null) {
            // console.warn("stringmap param not implemented");
            return [null, []];
          }
          return [AST.makeTypeExpr({
            parameters: [te],
            typeRef: typeRef,
          }), newDecls];
        }
        default: {
          return makeTypeRef(wf.value.value.kind, typeRef);
        }
      }
    }
    case "unit_field":
      return makeTypeRef(wf.value.kind, typeRef);
    case "record": {
      const fields: AST.Field[] = [];
      const [typeExpr, decls] = makeTypeRef(wf.value.kind, typeRef);
      wf.value.value.details.forEach(wf => {
        const [typeExpr, newDecls] = typeExprFromField(moduleName, `${name}$${wf.name}`, wf.fieldType);
        if (typeExpr === null) {
          return;
        }
        decls.push(...newDecls);
        const adlf = AST.makeField({
          name: wf.name,
          serializedName: wf.name,
          default: getDefault(wf.fieldType),
          annotations: [],
          typeExpr: typeExpr,
        });
        fields.push(adlf);
      });
      const decl = AST.makeDecl({
        name: name,
        version: ST.makeMaybe("nothing", null),
        annotations: [],
        type_: AST.makeDeclType("struct_", AST.makeStruct({
          typeParams: [],
          fields: fields,
        })),
      });
      return [typeExpr, [decl, ...decls]];
    }
    case "oneOf": {
      const fields: AST.Field[] = [];
      const [typeExpr, decls] = makeTypeRef(wf.value.kind, typeRef);
      wf.value.value.details.forEach(wf => {
        const [typeExpr, newDecls] = typeExprFromField(moduleName, `${name}$${wf.name}`, wf.fieldType);
        if (typeExpr === null) {
          return;
        }
        decls.push(...newDecls);
        const adlf = AST.makeField({
          name: wf.name,
          serializedName: wf.name,
          default: getDefault(wf.fieldType),
          annotations: [],
          typeExpr: typeExpr,
        });
        fields.push(adlf);
      });
      const decl = AST.makeDecl({
        name: name,
        version: ST.makeMaybe("nothing", null),
        annotations: [],
        type_: AST.makeDeclType("union_", AST.makeStruct({
          typeParams: [],
          fields: fields,
        })),
      });
      return [typeExpr, [decl, ...decls]];
    }
    // case "dynamicEnum":
    case "namedFragment":
    // case "expression":
      return [null, []];
  }
}

function makeTypeRef(kind: keyof W.ValueOpts, typeRef: AST.TypeRef): [AST.TypeExpr | null, AST.Decl[]] {
  switch (kind) {
    case "required": {
      return [AST.makeTypeExpr({
        parameters: [],
        typeRef: typeRef,
      }), []];
    }
    case "optional": {
      return [AST.makeTypeExpr({
        parameters: [AST.makeTypeExpr({
          parameters: [],
          typeRef: typeRef,
        })],
        typeRef: AST.makeTypeRef("primitive", "Nullable"),
      }), []];
    }
    case "multiple": {
      return [AST.makeTypeExpr({
        parameters: [AST.makeTypeExpr({
          parameters: [],
          typeRef: typeRef,
        })],
        typeRef: AST.makeTypeRef("primitive", "Vector"),
      }), []];
    }
    default:
      assertNever(kind);
      return [null, []];
  }
}

function typeRefFromField(wf: W.UITypeExpr, moduleName: string, declName: string): AST.TypeRef | null {
  switch (wf.kind) {
    case "primitive": {
      switch (wf.value.kind) {
        case "string_field":
          return AST.makeTypeRef("primitive", "String");
        case "password_field":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.strings",
            name: "Password",
          }));
        case "markdown_field":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.strings",
            name: "StringMD",
          }));

        case "email_field":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.strings",
            name: "EmailAddress",
          }));
        case "alphanumeric_field":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.strings",
            name: "StringANH",
          }));
        case "multiline_field":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.strings",
            name: "StringML",
          }));
        case "not_empty_field":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.strings",
            name: "StringNE",
          }));
        case "bool_field":
          return AST.makeTypeRef("primitive", "Bool");
        case "signed_number_field":
          switch (wf.value.value.value.details.size) {
            case "size8":
              return AST.makeTypeRef("primitive", "Int8");
            case "size16":
              return AST.makeTypeRef("primitive", "Int16");
            case "size32":
              return AST.makeTypeRef("primitive", "Int32");
            case "size64":
              return AST.makeTypeRef("primitive", "Int64");
            default:
              assertNever(wf.value.value.value.details.size);
              return null;
          }
        case "unsigned_number_field":
          switch (wf.value.value.value.details.size) {
            case "size8":
              return AST.makeTypeRef("primitive", "Word8");
            case "size16":
              return AST.makeTypeRef("primitive", "Word16");
            case "size32":
              return AST.makeTypeRef("primitive", "Word32");
            case "size64":
              return AST.makeTypeRef("primitive", "Word64");
            default:
              assertNever(wf.value.value.value.details.size);
              return null;
          }
        case "double_number_field":
          return AST.makeTypeRef("primitive", "Double");
        case "json_field":
          return AST.makeTypeRef("primitive", "Json");
        //case "byte_vector_field":
        case "string_map_field":
          return AST.makeTypeRef("primitive", "StringMap");
        case "instant":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.time",
            name: "Instant",
          }));
        case "localDate":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.time",
            name: "LocalDate",
          }));
        case "localTime":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.time",
            name: "LocalTime",
          }));
        case "localDateTime":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.time",
            name: "LocalDateTime",
          }));
        case "dayOfWeek":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.time",
            name: "DayOfWeek",
          }));
        case "duration":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.time",
            name: "Duration",
          }));
        case "timezone":
          return AST.makeTypeRef("reference", AST.makeScopedName({
            moduleName: "common.time",
            name: "Timezone",
          }));
        //case "geographyGeoJson":
        //case "geometryWKT":
        // case "bigDecimal":
        //   return AST.makeTypeRef("reference", AST.makeScopedName({
        //     moduleName: "common",
        //     name: "BigDecimal",
        //   }));
        default:
          assertNever(wf.value);
          return null;
      }
    }
    case "record":
      return AST.makeTypeRef("reference", AST.makeScopedName({
        moduleName: moduleName,
        name: declName,
      }));
    case "oneOf":
      return AST.makeTypeRef("reference", AST.makeScopedName({
        moduleName: moduleName,
        name: declName,
      }));
    case "unit_field":
      return AST.makeTypeRef("primitive", "Void");
    // case "dynamicEnum":
    case "namedFragment":
    // case "expression":
      return null;
  }
}
