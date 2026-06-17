import { AsyncLocalStorage } from "async_hooks";
import { Connection } from "mongoose";

export const tenantContext = new AsyncLocalStorage<Connection>();
