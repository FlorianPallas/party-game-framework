import { Static, TSchema, Type } from "@sinclair/typebox";

export const ProtocolHeader = Type.Object({
  id: Type.String(),
  version: Type.String(),
});
export type ProtocolHeader = Static<typeof ProtocolHeader>;

export type ActionDef<
  TRequest extends TSchema = TSchema,
  TResponse extends TSchema = TSchema,
> = {
  request: TRequest;
  response: TResponse;
};

export type EventDef<TBody extends TSchema = TSchema> = {
  body: TBody;
};

export type Protocol<
  TActions extends {
    [type: string]: ActionDef;
  } = { [type: string]: ActionDef },
  TEvents extends {
    [type: string]: EventDef;
  } = { [type: string]: EventDef },
> = {
  header: ProtocolHeader;
  actions: TActions;
  events: TEvents;
};

export const createProtocol = <
  TActions extends { [id: string]: ActionDef },
  TEvents extends { [id: string]: EventDef },
>(
  protocol: Protocol<TActions, TEvents>
) => protocol;
