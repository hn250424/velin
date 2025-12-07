import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto";
import TreeDto from "@shared/dto/TreeDto";

export const tabSessionPath = "/fake/path/tabSession.json";
export const treeSessionPath = "/fake/path/treeSession.json";
export const sideSessionPath = "/fake/path/sideSession.json";
export const settingsSessionPath = "/fake/path/settingsSession.json";
export const windowSessionPath = "/fake/path/windowSession.json";

const preFilePath = "preFilePath";
export const newFilePath = "newFilePath";
const preFileName = "preFileName";
const newFileName = "newFileName";
const preFileContent = "preFileContent";
const newFileContent = "newFileContent";

export const emptyFilePathTabEditorDto: TabEditorDto = {
	id: 0,
	isModified: true,
	filePath: "",
	fileName: preFileName,
	content: preFileContent,
	isBinary: false,
};

export const defaultTabEditorDto: TabEditorDto = {
	id: 0,
	isModified: true,
	filePath: preFilePath,
	fileName: preFileName,
	content: preFileContent,
	isBinary: false,
};

export const tabEidtorsDto: TabEditorsDto = {
	activatedId: 1,
	data: [
		{
			id: 0,
			isModified: false,
			filePath: "",
			fileName: "Untitled",
			content: "",
			isBinary: false,
		},
		{
			id: 1,
			isModified: false,
			filePath: `${preFilePath}_1`,
			fileName: `${preFileName}_1`,
			content: `${preFileContent}_1`,
			isBinary: false,
		},
		{
			id: 2,
			isModified: true,
			filePath: `${preFilePath}_2`,
			fileName: `${preFileName}_2`,
			content: `${preFileContent}_2`,
			isBinary: false,
		},
		{
			id: 3,
			isModified: true,
			filePath: "",
			fileName: `${preFileName}_3`,
			content: `${preFileContent}_3`,
			isBinary: false,
		},
	],
};

export const treeDto: TreeDto = {
	path: "D:\\node-workspace\\velin\\test_file",
	name: "test_file",
	indent: 0,
	directory: true,
	expanded: true,
	children: [
		{
			path: "D:\\node-workspace\\velin\\test_file\\dir333",
			name: "dir333",
			indent: 1,
			directory: true,
			expanded: true,
			children: [
				{
					path: "D:\\node-workspace\\velin\\test_file\\dir333\\deep",
					name: "deep",
					indent: 2,
					directory: true,
					expanded: true,
					children: [
						{
							path: "D:\\node-workspace\\velin\\test_file\\dir333\\deep\\14.md",
							name: "14.md",
							indent: 3,
							directory: false,
							expanded: false,
							children: null,
						},
					],
				},
				{
					path: "D:\\node-workspace\\velin\\test_file\\test139.md",
					name: "test139.md",
					indent: 1,
					directory: false,
					expanded: false,
					children: null,
				},
				{
					path: "D:\\node-workspace\\velin\\test_file\\test139-1.md",
					name: "test139-1.md",
					indent: 1,
					directory: false,
					expanded: false,
					children: null,
				},
				{
					path: "D:\\node-workspace\\velin\\test_file\\test139-3.md",
					name: "test139-3.md",
					indent: 1,
					directory: false,
					expanded: false,
					children: null,
				},
			],
		},
		{
			path: "D:\\node-workspace\\velin\\test_file\\test139.md",
			name: "test139.md",
			indent: 1,
			directory: false,
			expanded: false,
			children: null,
		},
		{
			path: "D:\\node-workspace\\velin\\test_file\\test139-1.md",
			name: "test139-1.md",
			indent: 1,
			directory: false,
			expanded: false,
			children: null,
		},
		{
			path: "D:\\node-workspace\\velin\\test_file\\test139-3.md",
			name: "test139-3.md",
			indent: 1,
			directory: false,
			expanded: false,
			children: null,
		},
	],
};
