/* @generated from adl module examples */

import * as ADL from './runtime/adl';

export interface Person {
  name: Name;
  role: string;
  age: number;
}

export function makePerson(
  input: {
    name: Name,
    role: string,
    age: number,
  }
): Person {
  return {
    name: input.name,
    role: input.role,
    age: input.age,
  };
}

const Person_AST : ADL.ScopedDecl =
  {"moduleName":"examples","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"name","default":{"kind":"nothing"},"name":"name","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"examples","name":"Name"}},"parameters":[]}},{"annotations":[],"serializedName":"role","default":{"kind":"nothing"},"name":"role","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"age","default":{"kind":"nothing"},"name":"age","typeExpr":{"typeRef":{"kind":"primitive","value":"Word8"},"parameters":[]}}]}},"name":"Person","version":{"kind":"nothing"}}};

export const snPerson: ADL.ScopedName = {moduleName:"examples", name:"Person"};

export function texprPerson(): ADL.ATypeExpr<Person> {
  return {value : {typeRef : {kind: "reference", value : snPerson}, parameters : []}};
}

export interface Name {
  first: string;
  last: string;
}

export function makeName(
  input: {
    first: string,
    last: string,
  }
): Name {
  return {
    first: input.first,
    last: input.last,
  };
}

const Name_AST : ADL.ScopedDecl =
  {"moduleName":"examples","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"first","default":{"kind":"nothing"},"name":"first","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}},{"annotations":[],"serializedName":"last","default":{"kind":"nothing"},"name":"last","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}]}},"name":"Name","version":{"kind":"nothing"}}};

export const snName: ADL.ScopedName = {moduleName:"examples", name:"Name"};

export function texprName(): ADL.ATypeExpr<Name> {
  return {value : {typeRef : {kind: "reference", value : snName}, parameters : []}};
}

export interface Hierarchy {
  leader: Person;
  underlings: Hierarchy[];
}

export function makeHierarchy(
  input: {
    leader: Person,
    underlings: Hierarchy[],
  }
): Hierarchy {
  return {
    leader: input.leader,
    underlings: input.underlings,
  };
}

const Hierarchy_AST : ADL.ScopedDecl =
  {"moduleName":"examples","decl":{"annotations":[],"type_":{"kind":"struct_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"leader","default":{"kind":"nothing"},"name":"leader","typeExpr":{"typeRef":{"kind":"reference","value":{"moduleName":"examples","name":"Person"}},"parameters":[]}},{"annotations":[],"serializedName":"underlings","default":{"kind":"nothing"},"name":"underlings","typeExpr":{"typeRef":{"kind":"primitive","value":"Vector"},"parameters":[{"typeRef":{"kind":"reference","value":{"moduleName":"examples","name":"Hierarchy"}},"parameters":[]}]}}]}},"name":"Hierarchy","version":{"kind":"nothing"}}};

export const snHierarchy: ADL.ScopedName = {moduleName:"examples", name:"Hierarchy"};

export function texprHierarchy(): ADL.ATypeExpr<Hierarchy> {
  return {value : {typeRef : {kind: "reference", value : snHierarchy}, parameters : []}};
}

export interface Gender_Female {
  kind: 'female';
}
export interface Gender_Male {
  kind: 'male';
}
export interface Gender_Other {
  kind: 'other';
  value: string;
}

export type Gender = Gender_Female | Gender_Male | Gender_Other;

export interface GenderOpts {
  female: null;
  male: null;
  other: string;
}

export function makeGender<K extends keyof GenderOpts>(kind: K, value: GenderOpts[K]) { return {kind, value}; }

const Gender_AST : ADL.ScopedDecl =
  {"moduleName":"examples","decl":{"annotations":[],"type_":{"kind":"union_","value":{"typeParams":[],"fields":[{"annotations":[],"serializedName":"female","default":{"kind":"nothing"},"name":"female","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}},{"annotations":[],"serializedName":"male","default":{"kind":"nothing"},"name":"male","typeExpr":{"typeRef":{"kind":"primitive","value":"Void"},"parameters":[]}},{"annotations":[],"serializedName":"other","default":{"kind":"nothing"},"name":"other","typeExpr":{"typeRef":{"kind":"primitive","value":"String"},"parameters":[]}}]}},"name":"Gender","version":{"kind":"nothing"}}};

export const snGender: ADL.ScopedName = {moduleName:"examples", name:"Gender"};

export function texprGender(): ADL.ATypeExpr<Gender> {
  return {value : {typeRef : {kind: "reference", value : snGender}, parameters : []}};
}

export const _AST_MAP: { [key: string]: ADL.ScopedDecl } = {
  "examples.Person" : Person_AST,
  "examples.Name" : Name_AST,
  "examples.Hierarchy" : Hierarchy_AST,
  "examples.Gender" : Gender_AST
};
