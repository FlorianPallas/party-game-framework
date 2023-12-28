import { TObject, Type } from "@sinclair/typebox";

const createResponseType =
  <C extends string>(code: C) =>
  <T extends TObject | undefined = undefined>(schema?: T) =>
    Type.Composite([
      Type.Object({
        code: Type.Literal(code),
      }),
      (schema ?? Type.Object({})) as T extends TObject ? T : TObject<{}>,
    ]);

const createResponse =
  <C extends string>(code: C) =>
  <T>(body?: T) => ({ code, ...((body ?? {}) as T) });

export const StreamResponseDef = {
  Custom: <C extends string, T extends TObject | undefined = undefined>(
    code: C,
    schema?: T
  ) => createResponseType(code)(schema),
  Ok: <T extends TObject | undefined = undefined>(schema?: T) =>
    createResponseType("ok")(schema),
};

export const StreamResponse = {
  Custom: <C extends string, T>(code: C, body?: T) => ({ code, ...body }),
  Ok: <T>(body?: T) => createResponse("ok")(body),
};
