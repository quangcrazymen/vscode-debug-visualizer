import { DataExtractionResult, isVisualizationData } from "@hediet/debug-visualizer-data-extraction";
import { FormattedMessage } from "../webviewContract";
import { json } from "express";

export interface ParseEvaluationResultContext {
	debugAdapterType: string;
}

export function parseEvaluationResultFromGenericDebugAdapter(
	resultText: string,
	context: ParseEvaluationResultContext
): { kind: "data"; result: DataExtractionResult } | { kind: "error"; message: FormattedMessage } {
	const jsonData = resultText.trim();
	const firstDoubleQuote: number = jsonData.search('"');
	let newjsonData = jsonData.slice(firstDoubleQuote);
	newjsonData = newjsonData.replaceAll('\\"', '"');

	let resultObj;
	try {
		try {
			let jsonData2;
			// Remove optionally enclosing characters.
			if (isEnclosedWith(newjsonData, '"') || isEnclosedWith(newjsonData, "'")) {
				// In case of JavaScript: `"{ "kind": { ... }, "text": "some\ntext" }"`
				jsonData2 = newjsonData.substr(1, newjsonData.length - 2);
			} else {
				// Just in case no quoting is done.
				jsonData2 = jsonData;
			}
			resultObj = parseJson(jsonData2, context);
		} catch (e) {
			// in case of C++: `"{ \"kind\": { ... }, \"text\": \"some\\ntext\" }"`
			const str = parseJson(newjsonData, context);
			// str is now `{ "kind": { ... }, "text": "some\ntext" }"`
			resultObj = parseJson(str, context);
			// result is now { kind: { ... }, text: "some\ntext" }
		}

		if (!isVisualizationData(resultObj)) {
			return {
				kind: "error",
				message: {
					kind: "list",
					items: [
						"Evaluation result does not match ExtractedData interface.",
						{
							kind: "inlineList",
							items: [
								"Evaluation result was:",
								{
									kind: "code",
									content: JSON.stringify(resultObj, undefined, 4),
								},
							],
						},
					],
				},
			};
		}
	} catch (e: any) {
		return {
			kind: "error",
			message: e.message,
		};
	}

	return {
		kind: "data",
		result: {
			availableExtractors: [],
			usedExtractor: {
				id: "generic" as any,
				name: "Generic",
				priority: 1,
			},
			data: resultObj,
		},
	};
}

function isEnclosedWith(str: string, char: string): boolean {
	return str.startsWith(char) && str.endsWith(char);
}

function parseJson(str: string, context: ParseEvaluationResultContext) {
	try {
		return JSON.parse(str);
	} catch (error: any) {
		throw new FormattedError({
			kind: "list",
			items: [
				"Could not parse evaluation result as JSON:",
				error.message,
				{
					kind: "inlineList",
					items: [
						"Evaluation result was:",
						{
							kind: "code",
							content: str,
						},
					],
				},
				`Used debug adapter: ${context.debugAdapterType}`,
			],
		});
	}
}

class FormattedError {
	constructor(public readonly message: FormattedMessage) {}
}
