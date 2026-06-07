const code = `const bjDiamond = bitmap\`
2222222222221L0.
2222222222221L0.
\`;`;

const regex = /(bitmap|tune|map|palette)`([\s\S]*?)`/g;
let match;
while ((match = regex.exec(code)) !== null) {
	const kind = match[1];
	const fullMatch = match[0];
	const innerText = match[2];
	
	const from = match.index + kind.length + 1;
	const to = match.index + fullMatch.length - 1;
	
	console.log("Full match:", JSON.stringify(fullMatch));
	console.log("Inner text:", JSON.stringify(innerText));
	console.log("Indices:", from, "to", to);
	console.log("Sliced from code:", JSON.stringify(code.slice(from, to)));
	console.log("Matches?", code.slice(from, to) === innerText);
}
