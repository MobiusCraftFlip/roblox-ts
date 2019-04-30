import * as ts from "ts-morph";
import {
	compileBlock,
	compileBreakStatement,
	compileClassDeclaration,
	compileContinueStatement,
	compileDoStatement,
	compileEnumDeclaration,
	compileExportAssignment,
	compileExportDeclaration,
	compileExpressionStatement,
	compileForOfStatement,
	compileForStatement,
	compileFunctionDeclaration,
	compileIfStatement,
	compileImportDeclaration,
	compileImportEqualsDeclaration,
	compileNamespaceDeclaration,
	compileReturnStatement,
	compileSwitchStatement,
	compileThrowStatement,
	compileTryStatement,
	compileVariableStatement,
	compileWhileStatement,
} from ".";
import { CompilerState } from "../CompilerState";
import { CompilerError, CompilerErrorType } from "../errors/CompilerError";
import { isTypeStatement } from "../typeUtilities";

export function compileStatement(state: CompilerState, node: ts.Statement): string {
	/* istanbul ignore else  */
	if (isTypeStatement(node)) {
		return "";
	} else if (ts.TypeGuards.isBlock(node)) {
		return compileBlock(state, node);
	} else if (ts.TypeGuards.isImportDeclaration(node)) {
		return compileImportDeclaration(state, node);
	} else if (ts.TypeGuards.isImportEqualsDeclaration(node)) {
		return compileImportEqualsDeclaration(state, node);
	} else if (ts.TypeGuards.isExportDeclaration(node)) {
		return compileExportDeclaration(state, node);
	} else if (ts.TypeGuards.isFunctionDeclaration(node)) {
		return compileFunctionDeclaration(state, node);
	} else if (ts.TypeGuards.isClassDeclaration(node)) {
		return compileClassDeclaration(state, node);
	} else if (ts.TypeGuards.isNamespaceDeclaration(node)) {
		return compileNamespaceDeclaration(state, node);
	} else if (ts.TypeGuards.isDoStatement(node)) {
		return compileDoStatement(state, node);
	} else if (ts.TypeGuards.isIfStatement(node)) {
		return compileIfStatement(state, node);
	} else if (ts.TypeGuards.isBreakStatement(node)) {
		return compileBreakStatement(state, node);
	} else if (ts.TypeGuards.isExpressionStatement(node)) {
		return compileExpressionStatement(state, node);
	} else if (ts.TypeGuards.isContinueStatement(node)) {
		return compileContinueStatement(state, node);
	} else if (ts.TypeGuards.isForInStatement(node)) {
		throw new CompilerError("For..in loops are disallowed!", node, CompilerErrorType.ForInLoop);
	} else if (ts.TypeGuards.isForOfStatement(node)) {
		return compileForOfStatement(state, node);
	} else if (ts.TypeGuards.isForStatement(node)) {
		return compileForStatement(state, node);
	} else if (ts.TypeGuards.isReturnStatement(node)) {
		return compileReturnStatement(state, node);
	} else if (ts.TypeGuards.isThrowStatement(node)) {
		return compileThrowStatement(state, node);
	} else if (ts.TypeGuards.isVariableStatement(node)) {
		return compileVariableStatement(state, node);
	} else if (ts.TypeGuards.isWhileStatement(node)) {
		return compileWhileStatement(state, node);
	} else if (ts.TypeGuards.isEnumDeclaration(node)) {
		return compileEnumDeclaration(state, node);
	} else if (ts.TypeGuards.isExportAssignment(node)) {
		return compileExportAssignment(state, node);
	} else if (ts.TypeGuards.isSwitchStatement(node)) {
		return compileSwitchStatement(state, node);
	} else if (ts.TypeGuards.isTryStatement(node)) {
		return compileTryStatement(state, node);
	} else if (ts.TypeGuards.isLabeledStatement(node)) {
		throw new CompilerError("Labeled statements are not supported!", node, CompilerErrorType.NoLabeledStatement);
	}

	/* istanbul ignore next */
	if (
		ts.TypeGuards.isEmptyStatement(node) ||
		ts.TypeGuards.isTypeAliasDeclaration(node) ||
		ts.TypeGuards.isInterfaceDeclaration(node)
	) {
		return "";
	}

	/* istanbul ignore next */
	throw new CompilerError(`Bad statement! (${node.getKindName()})`, node, CompilerErrorType.BadStatement);
}

export function compileStatementedNode(state: CompilerState, node: ts.Node & ts.StatementedNode) {
	state.pushIdStack();
	state.exportStack.push(new Set<string>());
	let result = "";
	state.hoistStack.push(new Set<string>());
	for (const child of node.getStatements()) {
		result += compileStatement(state, child);
		if (child.getKind() === ts.SyntaxKind.ReturnStatement) {
			break;
		}
	}

	result = state.popHoistStack(result);

	const scopeExports = state.exportStack.pop();
	if (scopeExports && scopeExports.size > 0) {
		scopeExports.forEach(scopeExport => (result += state.indent + scopeExport));
	}
	state.popIdStack();
	return result;
}