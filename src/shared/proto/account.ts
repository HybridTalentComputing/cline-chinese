// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.5
//   protoc               v3.19.1
// source: account.proto

/* eslint-disable */
import { Empty, EmptyRequest, String } from "./common";

/** Service for account-related operations */
export type AccountServiceDefinition = typeof AccountServiceDefinition;
export const AccountServiceDefinition = {
  name: "AccountService",
  fullName: "clineChinese.AccountService",
  methods: {
    /**
     * Handles the user clicking the login link in the UI.
     * Generates a secure nonce for state validation, stores it in secrets,
     * and opens the authentication URL in the external browser.
     */
    accountLoginClicked: {
      name: "accountLoginClicked",
      requestType: EmptyRequest,
      requestStream: false,
      responseType: String,
      responseStream: false,
      options: {},
    },
    /**
     * Handles the user clicking the logout button in the UI.
     * Clears API keys and user state.
     */
    accountLogoutClicked: {
      name: "accountLogoutClicked",
      requestType: EmptyRequest,
      requestStream: false,
      responseType: Empty,
      responseStream: false,
      options: {},
    },
    /** Subscribe to auth callback events (when authentication tokens are received) */
    subscribeToAuthCallback: {
      name: "subscribeToAuthCallback",
      requestType: EmptyRequest,
      requestStream: false,
      responseType: String,
      responseStream: true,
      options: {},
    },
  },
} as const;
