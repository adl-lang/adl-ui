/* @generated from adl module examples */

import * as ADL from './runtime/adl';

export interface Person {
  name: string;
  age: number;
}

export function makePerson(
  input: {
    name: string,
    age: number,
  }
): Person {
  return {
    name: input.name,
    age: input.age,
  };
}

const Person_AST : ADL.ScopedDecl =
  {"moduleName":"examples","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"name","default":{"kind":"nothing"},"name":"name","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"age","default":{"kind":"nothing"},"name":"age","typeExpr":{"typeRef":{"kind":"primitive","value":"Word8"},"parameters":[]}}]}},"name":"Person","version":{"kind":"nothing"}}};

export const snPerson: ADL.ScopedName = {moduleName:"examples", name:"Person"};

export function texprPerson(): ADL.ATypeExpr<Person> {
  return {value : {typeRef : {kind: "reference", value : snPerson}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "examples.Person" : Person_AST
};
