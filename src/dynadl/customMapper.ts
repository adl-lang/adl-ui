import * as DAM from "@adl-lang/dynadl-model/ast";
import * as DAV from "@adl-lang/dynadl-model/appview";
import { RESOLVER as DAM_RESOLVER } from "@adl-lang/dynadl-model/resolver";
import { Factory, customizeVector } from '@adl-lang/basic-view/veditor';
import { assertNever } from "@adl-lang/utils/types";


export const customizeEditor = (factory: Factory) => customizeVector<DAM.Field, DAV.Field>(
    DAM_RESOLVER,
    DAM.texprField(), DAV.texprField(),
    (view) => view.field,
    (model) => DAV.makeField({
        name: model.name,
        label: model.form_label,
        arity: arity(model.fieldType),
        type_: model.fieldType.kind,
        details: details(model.fieldType),
        field: model,
    }),
    factory,
);


function arity(v: DAM.UITypeExpr): DAV.Arity {
    switch (v.kind) {
        case "record":
        case "oneOf":
        case "dynamicEnum":
        case "namedFragment":
        case "expression":
            return v.value.kind;
        case "primitive":
            return v.value.value.kind;
        case "unit_field":
            return v.value.kind;
        default:
            assertNever(v);
    }
}

function details(v: DAM.UITypeExpr): string {
    switch (v.kind) {
        case "record":
            return v.value.value.details.map(f => f.name).join(",");
        case "oneOf":
            return v.value.value.details.map(f => f.name).join("|");
        case "unit_field":
            return "unit";
        case "namedFragment":
            return v.value.value.details.moduleName + "::" + v.value.value.details.name;
        case "dynamicEnum":
            return "dynamicEnum";
        case "expression":
            return "expression";
        case "primitive":
            return v.value.kind;
    }
}
