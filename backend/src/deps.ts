// TODO Using an old version to get around some bugs... can probably eventually go back to latest?
// 7.4.0 has an issue where someone tweaked range.ts such that some constructor does not call super first
// Everything else after 6.5.1 gives me crap about core.serialize (core = Deno) not being a function??? What?
// I can't find much info about anybody else hitting these so I must be doing something wrong somewhere
export { Application, Router } from 'https://deno.land/x/oak@v6.5.1/mod.ts';
export type { RouterContext, Context } from 'https://deno.land/x/oak@v6.5.1/mod.ts';

export { config } from "https://deno.land/x/dotenv/mod.ts";