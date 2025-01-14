import luau from "@roblox-ts/luau-ast";
import { IdentifierMacro, MacroList } from "TSTransformer/macros/types";

export const IDENTIFIER_MACROS: MacroList<IdentifierMacro> = {
	PKG_VERSION: state => luau.string(state.data.pkgVersion ?? "0.0.0"),
	Promise: (state, node) => state.TS(node, "Promise"),
};
