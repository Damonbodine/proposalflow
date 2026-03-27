/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as ai from "../ai.js";
import type * as auditLogs from "../auditLogs.js";
import type * as contacts from "../contacts.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as meetings from "../meetings.js";
import type * as notifications from "../notifications.js";
import type * as proposalLineItems from "../proposalLineItems.js";
import type * as proposalTemplates from "../proposalTemplates.js";
import type * as proposals from "../proposals.js";
import type * as reminders from "../reminders.js";
import type * as seed from "../seed.js";
import type * as userSettings from "../userSettings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  ai: typeof ai;
  auditLogs: typeof auditLogs;
  contacts: typeof contacts;
  crons: typeof crons;
  dashboard: typeof dashboard;
  http: typeof http;
  meetings: typeof meetings;
  notifications: typeof notifications;
  proposalLineItems: typeof proposalLineItems;
  proposalTemplates: typeof proposalTemplates;
  proposals: typeof proposals;
  reminders: typeof reminders;
  seed: typeof seed;
  userSettings: typeof userSettings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
