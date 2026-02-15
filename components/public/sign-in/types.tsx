export type OAuthState =
    { credential: string; error: null }   // success
  | { credential: null; error: string };  // error