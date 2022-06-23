// Identify the context for customization

import * as adlrt  from "../../adl-gen/runtime/adl";
import * as adlast from "../../adl-gen/sys/adlast";
import * as systypes from "../../adl-gen/sys/types";
import * as adltree from "../adl-tree";
import { createJsonBinding } from '../../adl-gen/runtime/json';

import {IVEditor, UVEditor, UpdateFn, Rendered} from "./type";
import {FieldFns} from "../fields/type";
import {scopedNamesEqual} from "../../adl-gen/runtime/utils";
import { adlPrimitiveFieldFns, maybeField, nullableField } from "../fields/adl";

/**
 * Construct a VEditor from a a specified ADL type
 */
export function createVEditor<T>(
  typeExpr: adlrt.ATypeExpr<T>,
  declResolver: adlrt.DeclResolver,
  factory: Factory
): IVEditor<T, unknown, unknown> {
  const adlTree = adltree.createAdlTree(typeExpr.value, declResolver);
  return createVEditor0(declResolver, nullContext, adlTree, factory) as IVEditor<
    T,
    unknown,
    unknown
  >;
}

export interface CustomContext {
  declResolver: adlrt.DeclResolver;
  scopedDecl: adlast.ScopedDecl | null;
  field: adlast.Field | null;
  typeExpr: adlast.TypeExpr;
}


export interface Factory {
  getCustomVEditor(ctx: CustomContext): UVEditor | null;
  getCustomField(ctx: CustomContext): FieldFns<unknown> | null;

  renderFieldEditor(props: FieldEditorProps): Rendered;
  renderStructEditor(props: StructEditorProps): Rendered;

  renderUnimplementedEditor(props: UnimplementedEditorProps): Rendered;
}

export interface FieldEditorProps {
  fieldfns: FieldFns<unknown>;
  disabled: boolean;
  state: string;
  onUpdate: UpdateFn<string>  
};

export interface StructEditorProps {
  fields: StructFieldProps<unknown,unknown,unknown>[];
  disabled: boolean;
}

export interface StructFieldProps<T,S,E> {
  name: string;
  label: string;
  veditor: IVEditor<T,S,E>;
  state: S;
  onUpdate: (e: E) => void;
}

export interface UnimplementedEditorProps {
  typeExpr: adlast.TypeExpr;
}

interface InternalContext {
  scopedDecl: adlast.ScopedDecl | null;
  field: adlast.Field | null;
}

const nullContext = { scopedDecl: null, field: null };

function createVEditor0(
  declResolver: adlrt.DeclResolver,
  ctx: InternalContext,
  adlTree: adltree.AdlTree,
  factory: Factory,
): IVEditor<unknown, unknown, unknown> {
  const customContext = {
    declResolver,
    scopedDecl: ctx.scopedDecl,
    field: ctx.field,
    typeExpr: adlTree.typeExpr
  };

  // Use a custom editor if available
  const customVEditor = factory.getCustomVEditor(customContext);
  if (customVEditor !== null) {
    return customVEditor;
  }
  const customField = factory.getCustomField(customContext);
  if (customField) {
    return fieldVEditor(factory, adlTree.typeExpr, customField);
  }

  // Otherwise construct a standard one

  const details = adlTree.details();
  switch (details.kind) {
    case "primitive":
      if (details.ptype === "Void") {
        return unimplementedVEditor(factory, adlTree.typeExpr);
      } else {
        const fldfns = createField(adlTree, customContext, factory);
        if (fldfns === null) {
          return unimplementedVEditor(factory, adlTree.typeExpr);
        }
        return fieldVEditor(factory, adlTree.typeExpr, fldfns);
      }

    case "struct": {
      const vfields = details.fields.map( f => ({
        field:f, 
        veditor:createVEditor0(declResolver, nullContext,  f.adlTree, factory),
      }));
      return structVEditor(factory, declResolver, vfields);
    }

    case "newtype":
      if (adlTree.typeExpr.typeRef.kind === 'reference' && scopedNamesEqual(systypes.snMap, adlTree.typeExpr.typeRef.value)) {
         return mapVEditor(declResolver, nullContext, factory, {value:adlTree.typeExpr.parameters[0]}, {value:adlTree.typeExpr.parameters[1]});
      }
      return createVEditor0(declResolver, nullContext, details.adlTree, factory);

    case "typedef":
      return createVEditor0(declResolver, nullContext, details.adlTree, factory);

    case "union": {
      // When T can be edited in a String field, we can use a string
      // field for Maybe<T> iff the empty string is not a valid value
      // of T.  So Maybe<Int> can be editied in a string field,
      // whereas Maybe<String> cannot.
      if (isMaybe(adlTree.typeExpr)) {
        const fldfns = createFieldForTParam0(adlTree, customContext, factory, declResolver);
        if (fldfns && fldfns.validate("") !== null) {
          return fieldVEditor(factory, adlTree.typeExpr, maybeField(fldfns));
        }
      }

      const vfields = details.fields.map( f => ({
        field:f, 
        veditor:createVEditor0(declResolver, nullContext,  f.adlTree, factory),
      }));
      return unimplementedVEditor(factory, adlTree.typeExpr);
    }

    case "nullable":
      const fieldfns = createFieldForTParam0(adlTree, customContext, factory, declResolver);
      if (fieldfns !== null  && fieldfns.validate("") !== null) {
        return fieldVEditor(factory, adlTree.typeExpr, nullableField(fieldfns));
      } else {
        const _underlyingVEditor = createVEditor0(declResolver,nullContext,  details.param, factory);
        return unimplementedVEditor(factory, adlTree.typeExpr);
      }

    case "vector": {
      const _underlyingVEditor = createVEditor0(declResolver,nullContext,  details.param, factory);
      return unimplementedVEditor(factory, adlTree.typeExpr);
    }

    case "stringmap":
      // An veditor over StringMap<T> is implemented in terms of
      // An veditor over sys.types.Map<String,T>
      type MapType = systypes.MapEntry<string,unknown>[];
      interface StringMapType {[key:string]: unknown}
      const valueType = adlTree.typeExpr.parameters[0];
      const underlyingVEditor = mapEntryVectorVEditor(declResolver, ctx, factory, adlrt.texprString(), {value:valueType});
      const stringMapFromMap = (m: MapType): StringMapType => {
        const result: StringMapType = {};
        for (const me of m) {
          result[me.key] = me.value;
        }
        return result;
      }
      const mapFromStringMap = (m: StringMapType): MapType => {
        return Object.keys(m).map( k => ({key:k, value:m[k]}));
      }
      return mappedVEditor(
        underlyingVEditor,
        mapFromStringMap,
        stringMapFromMap,
      );
  }
}

function fieldVEditor<T>(factory: Factory, _typeExpr: adlast.TypeExpr, fieldfns: FieldFns<T>): UVEditor {
  function validate(t: string): string[] {
    const err = fieldfns.validate(t);
    return err === null ? [] : [err];
  }

  const veditor: IVEditor<T,string,string> = {
    initialState: "",
    stateFromValue: fieldfns.toText,
    validate,
    valueFromState: fieldfns.fromText,
    update: (_s,e) => e,
    render: (state, disabled, onUpdate) => factory.renderFieldEditor({fieldfns, disabled, state, onUpdate}),
  };

  return veditor;
}

interface StructFieldStates {
  [key: string]: unknown;
}

interface StructState {
  fieldStates: StructFieldStates;
}

interface StructFieldEvent {
  kind: "field";
  field: string;
  fieldEvent: unknown;
}

type StructEvent = StructFieldEvent;

export type VField = {
  field: adltree.Field;
  veditor: UVEditor;
};


function structVEditor(
  factory: Factory,
  declResolver: adlrt.DeclResolver,
  fields: VField[],
): IVEditor<unknown, StructState, StructEvent> {

  const fieldDetails = fields.map(f => {
    const field = f.field;
    const veditor = f.veditor;
    const jsonBinding = createJsonBinding<unknown>(declResolver, { value: field.adlTree.typeExpr });

    return {
      name: field.astField.name,
      default: field.astField.default,
      jsonBinding,
      label: fieldLabel(field.astField.name),
      veditor,
    };
  });

  const veditorsByName : Record<string,UVEditor>  = {};
  const initialState : StructState = { fieldStates: {} };

  // It's unclear what the initialState for an empty struct
  // editor should be... either every field empty, or
  // with default values filled in for those fields that have
  // defaults specified. the flag below set's this behaviour, though
  // we may want to change initialState to be a function that takes
  // this as a parameter.
  const USE_DEFAULTS_FOR_STRUCT_FIELDS = true;

  for (const fd of fieldDetails) {
    veditorsByName[fd.name] = fd.veditor;
    if (USE_DEFAULTS_FOR_STRUCT_FIELDS && fd.default.kind === "just") {
      initialState.fieldStates[fd.name] = fd.veditor.stateFromValue(
        fd.jsonBinding.fromJsonE(fd.default.value)
      );
    } else {
      initialState.fieldStates[fd.name] = fd.veditor.initialState;
    }
  }

  function stateFromValue(value: Record<string,unknown>) {
    const state: StructState = {
      fieldStates: {},
    };
    for (const fd of fieldDetails) {
      state.fieldStates[fd.name] = fd.veditor.stateFromValue(value[fd.name]);
    }
    return state;
  }

  function validate(state: StructState) {
    let errors: string[] = [];
    for (const fd of fieldDetails) {
      errors = errors.concat(fd.veditor.validate(state.fieldStates[fd.name]).map(err => fd.name + ": " + err));
    }
    return errors;
  }

  function valueFromState(state: StructState) {
    const value: Record<string,unknown> = {};
    for (const fd of fieldDetails) {
      value[fd.name] = fd.veditor.valueFromState(state.fieldStates[fd.name]);
    }
    return value;
  }

  function update(state: StructState, event: StructEvent): StructState {
    if (event.kind === "field") {
      const newFieldStates = {
        ...state.fieldStates
      };
      const newfs = veditorsByName[event.field].update(
        state.fieldStates[event.field],
        event.fieldEvent
      );
      newFieldStates[event.field] = newfs;
      const newState =  {
        fieldStates: newFieldStates,
      };
      return newState;
    } else {
      return state;
    }
  }

  function render(
    state: StructState,
    disabled: boolean,
    onUpdate: UpdateFn<StructEvent>
  ): Rendered {
    const fields: StructFieldProps<unknown,unknown,unknown>[] =  fieldDetails.map(fd => ({
      ...fd,
      state: state.fieldStates[fd.name],
      onUpdate: event => {
        onUpdate({ kind: "field", field: fd.name, fieldEvent: event });
      }
     }));
    return factory.renderStructEditor({fields, disabled});
  }

  return {
    initialState,
    stateFromValue,
    validate,
    valueFromState,
    update,
    render
  };
}

// Convert snake/camel case to human readable spaced name
export function fieldLabel(name: string): string {
  return (
    name
      // insert a space before all caps
      .replace(/([A-Z])/g, " $1")
      // uppercase the first character
      .replace(/^./, function(str) {
        return str.toUpperCase();
      })
      // replace _ with space
      .replace(/_/g, " ")
  );
}

function unimplementedVEditor(factory: Factory, typeExpr: adlast.TypeExpr): UVEditor {
    return {
      initialState: null,
      stateFromValue: () => null,
      validate: () => [],
      valueFromState: () => null,
      update: () => {},
      render: () => factory.renderUnimplementedEditor({typeExpr}),
    };
  }

// Create an editor over a Vector<Pair<K,V>>. This won't be required after
// we update sys.types.Map to have that type
function mapVEditor<K,V>(declResolver: adlrt.DeclResolver, ctx: InternalContext, factory: Factory, ktype: adlrt.ATypeExpr<K>, vtype: adlrt.ATypeExpr<V>): IVEditor<systypes.Pair<K,V>[], unknown, unknown> {
  const map1 = (m: systypes.Pair<K,V>[]): systypes.MapEntry<K,V>[] => {
    return m.map( p => ({key:p.v1, value:p.v2}) );
  }
  const map2 = (m: systypes.MapEntry<K,V>[]): systypes.Pair<K,V>[] => {
    return m.map( me => ({v1:me.key, v2:me.value}) );
  }
  return mappedVEditor(
    mapEntryVectorVEditor(declResolver, ctx, factory, ktype, vtype),
    map1,
    map2,
  );
}

// Create an editor over a Vector<MapEntry<K,V>>. This won't be required after
// we update sys.types.Map to have that type
function mapEntryVectorVEditor<K,V>(declResolver: adlrt.DeclResolver, ctx: InternalContext, factory: Factory, ktype: adlrt.ATypeExpr<K>, vtype: adlrt.ATypeExpr<V>): IVEditor<systypes.MapEntry<K,V>[], unknown, unknown> {
  type MapType = systypes.MapEntry<K,V>[];
  const mapTypeExpr : adlrt.ATypeExpr<MapType> = adlrt.texprVector(systypes.texprMapEntry(ktype,vtype));
  const mapAdlTree = adltree.createAdlTree(mapTypeExpr.value, declResolver);
  return createVEditor0(declResolver, ctx, mapAdlTree, factory) as IVEditor<MapType,unknown,unknown>;
}

function createFieldForTParam0(
  adlTree: adltree.AdlTree,
  ctx: CustomContext,
  factory: Factory,
  declResolver: adlrt.DeclResolver
): FieldFns<unknown> | null {
  const adlTree1 = adltree.createAdlTree(adlTree.typeExpr.parameters[0], declResolver);
  const ctx1 = {
    declResolver,
    scopedDecl: ctx.scopedDecl,
    field: ctx.field,
    typeExpr: adlTree.typeExpr.parameters[0]
  };
  return createField(adlTree1, ctx1, factory);
}

function createField(
  adlTree: adltree.AdlTree,
  ctx: CustomContext,
  factory: Factory
): FieldFns<unknown> | null {
  let fieldfns = createField1(adlTree, ctx, factory);
  if (fieldfns === null) {
    // Try resolving through any typedefs or newtypes
    const adlTree2 = adltree.resolve(adlTree, true, true);
    fieldfns = createField1(adlTree2, ctx, factory);
  }
  return fieldfns;
}

function createField1(
  adlTree: adltree.AdlTree,
  ctx: CustomContext,
  factory: Factory
): FieldFns<unknown> | null {
  if (factory) {
    const customField = factory.getCustomField(ctx);
    if (customField) {
      return customField;
    }
  }
  const details = adlTree.details();
  if (details.kind === "primitive") {
    const fieldfns = adlPrimitiveFieldFns(details.ptype);
    if (fieldfns !== null) {
      return fieldfns;
    }
  }
  return null;
}

/// Map a value editor from type A to a corresponding value
/// editor over type B.
export function mappedVEditor<A,B,S,E>(
  veditor: IVEditor<A,S,E>,
  aFromB: (b:B) => A,
  bFromA: (a:A) => B
  ) : IVEditor<B,S,E> {
  return {
    initialState: veditor.initialState,
    stateFromValue: (b:B) => veditor.stateFromValue(aFromB(b)),
    validate: veditor.validate,
    valueFromState: (s:S) => bFromA(veditor.valueFromState(s)),
    update: veditor.update,
    render: veditor.render,
  };
}

function sEnum(fields: adltree.Field[]): boolean {
  for (const f of fields) {
    const isVoid =
      f.astField.typeExpr.typeRef.kind === "primitive" &&
      f.astField.typeExpr.typeRef.value === "Void";
    if (!isVoid) {
      return false;
    }
  }
  return true;
}

function isMaybe(typeExpr: adlast.TypeExpr): boolean {
  if (typeExpr.typeRef.kind === "reference") {
    return (
      typeExpr.typeRef.value.moduleName === "sys.types" && typeExpr.typeRef.value.name === "Maybe"
    );
  }
  return false;
}