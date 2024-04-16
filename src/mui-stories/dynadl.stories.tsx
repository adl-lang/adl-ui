import { useEffect, useState } from 'react';
import * as adlrt from "@/adl-gen/runtime/adl";
import * as adlsys from "@/adl-gen/sys/types";
import * as AST from '@/adl-gen/runtime/sys/adlast';


import { ADL, RESOLVER } from "@/adl-gen/resolver";
import { createVEditor, genericVectorVEditor, CustomContext, Factory, VEditorCustomize } from "../model/veditor/adlfactory";
import { Column, cellContent } from "../model/adl-table";
import { RenderFn, VEditor } from '../mui/veditor';
import { typeExprsEqual } from '@/adl-gen/runtime/utils';
import * as adlex from '@/adl-gen/examples';
import * as dynast from "@/adl-gen/dynadl/ast";
import { UiFactory } from "../mui/factory";
import { Box, styled } from '@mui/material';
import { Validated } from '@/model/veditor/type';
import * as AS from '@/adl-gen/dynadl/appstate';
import { adlastFromDynast } from '@/dynadl/wyrey2adlast';
import { createJsonBinding } from '@/adl-gen/runtime/json';

export default {
  title: 'mui/DynADL',
  includeStories: /^[A-Z]/,    // Stories are exports with upper case names
};


interface DynADL {
  te: adlrt.ATypeExpr<unknown>,
  version: number,
  value: unknown,
}
export const Dictionary = () => {
  const veditor = createVEditor(AS.texprDictionary(), RESOLVER, new UiFactory());

  const initial = undefined;
  const [state, setState] = useState<unknown>(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const [vv, setVv] = useState<Validated<AS.Dictionary>>(() => veditor.valueFromState(state));
  const [dynTypeExpr, setDynTypeExpr] = useState<DynADL | undefined>(undefined);

  useEffect(() => {
    setVv(veditor.valueFromState(state));
  }, [state]);

  useEffect(() => {
    if (vv.isValid && vv.value.name != "") {

      const newDecls = adlastFromDynast("dynamic", vv.value.name, vv.value.fields);
      let decls: Record<string, AST.Decl> = {};
      const module = appSchema["dynamic"];
      if (module) {
        decls = { ...module.decls };
      }
      let version = 0;
      newDecls.forEach((decl, i) => {
        let version0 = 0;
        const declCurr = decls[decl.name];
        if (declCurr) {
          if (declCurr.version.kind === "just") {
            version0 = declCurr.version.value + 1;
          }
        }
        if (i == 0) {
          version = version0;
        }
        decl.version = { kind: "just", value: version0 };
        decls[decl.name] = decl;
      });

      const module1 = AST.makeModule({
        name: "dynamic",
        imports: [],
        annotations: [],
        decls: decls
      });
      console.log("module1", module1, version);

      const te: adlrt.ATypeExpr<unknown> = { value: { typeRef: { kind: "reference", value: { moduleName: "dynamic", name: vv.value.name } }, parameters: [] } };


      setDynTypeExpr((dynadl) => {
        if (dynadl === undefined) {
          appSchema["dynamic"] = module1;
          return { te, version, value: undefined };
        }
        const jb0 = createJsonBinding(previewDeclResolver(), dynadl.te);
        try {
          const jv0 = jb0.toJson(dynadl.value);
          appSchema["dynamic"] = module1;
          const jb1 = createJsonBinding(previewDeclResolver(), te);
          try {
            const value = jb1.fromJsonE(jv0);
            return { te, version, value };
          } catch (err) {
            console.log("incompatible", err);
            return { te, version, value: undefined };
          }
        } catch (err) {
          // should happen, removed once "unimplemented veditor" is fixed
          console.error(`shouldn't happen, removed once "unimplemented veditor" is fixed`, err);
          appSchema["dynamic"] = module1;
          return { te, version, value: undefined };
        }
      });
    }
  }, [vv]);

  const rprops = { disabled: false };
  const renderv = veditor.render(state, e => setState((s: unknown) => veditor.update(s, e)))(rprops);
  return (
    <div>
      {renderv.element()}
      <Box sx={{ height: "20px" }} />
      <hr />
      {vv.isValid
        ? <Valid>Typescript value:<br /><br />{JSON.stringify(vv.value)}</Valid>
        : <Errors>Errors:<br /><br />{vv.errors.join("\n")}</Errors>
      }
      {
        dynTypeExpr === undefined ? null :
          <RenderVEditorStory
            key={dynTypeExpr.version}
            veditor={createVEditor(dynTypeExpr.te, previewDeclResolver(), new UiFactory())}
            initial={dynTypeExpr.value}
            setValue={(value: unknown) => setDynTypeExpr(dte => ({ ...dte!, value }))}
          />
      }
    </div>
  );
};

interface RenderVEditorStoryProps<T> {
  veditor: VEditor<T>,
  disabled?: boolean,
  initial?: T,
  setValue: (val: T) => void,
}
function RenderVEditorStory<T>(props: RenderVEditorStoryProps<T>): JSX.Element {
  const { veditor, disabled, initial } = props;
  const [state, setState] = useState<unknown>(() => initial === undefined ? veditor.initialState : veditor.stateFromValue(initial));
  const vv = veditor.valueFromState(state);
  const rprops = { disabled: !!disabled };

  useEffect(() => {
    const v = veditor.valueFromState(state);
    if (v.isValid) {
      props.setValue(v.value);
    }
  }, [state]);

  const renderv = veditor.render(state, e => setState((s: unknown) => veditor.update(s, e)))(rprops);
  return (
    <div>
      {renderv.element()}
      <Box sx={{ height: "20px" }} />
      <hr />
      {vv.isValid
        ? <Valid>Typescript value:<br /><br />{JSON.stringify(vv.value)}</Valid>
        : <Errors>Errors:<br /><br />{vv.errors.join("\n")}</Errors>
      }
    </div>
  );
}


const Valid = styled('pre')({
  color: 'green'
});

const Errors = styled('pre')({
  color: '#b71c1c'
});


const staticResolver = declResolver(ADL);

const appSchema: { [key: string]: AST.Module; } = {};

export function previewDeclResolver(): adlrt.DeclResolver {
  function resolver(scopedName: AST.ScopedName): AST.ScopedDecl {
    const module = appSchema[scopedName.moduleName];
    const scopedDeclStatic = staticResolver(scopedName);
    if (!module && !scopedDeclStatic) {
      console.error("no module in appSchema", scopedName);
      throw new Error(`no module in appSchema ${scopedName.moduleName}::${scopedName.name}`);
    }
    if (!module && scopedDeclStatic) {
      return scopedDeclStatic;
    }
    const decl = module.decls[scopedName.name];
    if (!decl && scopedDeclStatic) {
      console.warn("using static decl", scopedName);
      return scopedDeclStatic;
    }
    return {
      moduleName: scopedName.moduleName,
      decl: decl,
    };
  }
  return resolver;
}

function declResolver(...astMaps: ({ [key: string]: AST.ScopedDecl; })[]) {
  const astMap: { [key: string]: AST.ScopedDecl; } = {};
  for (let map of astMaps) {
    for (let scopedName in map) {
      astMap[scopedName] = map[scopedName];
    }
  }

  function resolver(scopedName: AST.ScopedName): AST.ScopedDecl | null {
    const scopedNameStr = scopedName.moduleName + "." + scopedName.name;
    const result = astMap[scopedNameStr];
    if (result === undefined) {
      return null;
    }
    return result;
  }

  return resolver;
}