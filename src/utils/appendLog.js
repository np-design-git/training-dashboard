const TABLE_ROW_RE = /^\|\s*\d{2}\.\d{2}\.\d{4}\s*\|/;
const SESSION_BLOCK_RE = /(?:^|\n)---\n([\s\S]*?)\n---(?:\n|$)/g;

function normalizeSessionBlock(content) {
  const trimmed = content.trim().replace(/^---\n?/, '').replace(/\n?---$/, '').trim();
  return `---\n${trimmed}\n---`;
}

function extractSessionBlocks(text) {
  const blocks = [];
  const re = new RegExp(SESSION_BLOCK_RE.source, 'g');
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match[1].includes('DATE:')) {
      blocks.push(normalizeSessionBlock(match[1]));
    }
  }
  if (blocks.length === 0 && text.includes('DATE:')) {
    blocks.push(normalizeSessionBlock(text));
  }
  return blocks;
}

export function parsePastedLog(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Nothing to add — paste a session entry and/or key lifts table row');
  }

  const tableRows = [];
  const nonTableLines = [];

  for (const line of trimmed.split('\n')) {
    const row = line.trim();
    if (TABLE_ROW_RE.test(row)) {
      tableRows.push(row);
    } else {
      nonTableLines.push(line);
    }
  }

  const sessionBlocks = extractSessionBlocks(nonTableLines.join('\n').trim());

  if (tableRows.length === 0 && sessionBlocks.length === 0) {
    throw new Error('No session entry or key lifts table row detected');
  }

  return { tableRows, sessionBlocks };
}

function insertTableRows(markdown, tableRows) {
  const headerIdx = markdown.indexOf('## KEY LIFTS TABLE');
  if (headerIdx === -1) throw new Error('KEY LIFTS TABLE section not found');

  const entriesIdx = markdown.indexOf('## ENTRIES');
  const sectionEnd = entriesIdx > headerIdx ? entriesIdx : markdown.length;
  const section = markdown.slice(headerIdx, sectionEnd);

  const sepMatch = section.match(/\n(\|[- :|]+\|)\n/);
  if (!sepMatch) throw new Error('Table separator row not found');

  const insertPos = headerIdx + section.indexOf(sepMatch[0]) + sepMatch[0].length;
  const rowsText = tableRows.map((row) => `\n${row}`).join('') + '\n';

  return markdown.slice(0, insertPos) + rowsText + markdown.slice(insertPos);
}

function insertSessionBlocks(markdown, sessionBlocks) {
  const header = '## ENTRIES — NEWEST FIRST';
  const headerIdx = markdown.indexOf(header);
  if (headerIdx === -1) throw new Error('ENTRIES section not found');

  const afterHeader = headerIdx + header.length;
  const rest = markdown.slice(afterHeader);
  const sessionStart = rest.search(/\n---\n(?=DATE:)/);

  let insertPos;
  if (sessionStart !== -1) {
    insertPos = afterHeader + sessionStart + 1;
  } else {
    insertPos = afterHeader + (rest.match(/^\s*/)?.[0].length ?? 0);
  }

  const blocksText = sessionBlocks.map((block) => `\n${block}`).join('\n') + '\n';
  return markdown.slice(0, insertPos) + blocksText + markdown.slice(insertPos);
}

export function appendToLog(markdown, { tableRows, sessionBlocks }) {
  let result = markdown;

  if (tableRows.length > 0) {
    result = insertTableRows(result, tableRows);
  }
  if (sessionBlocks.length > 0) {
    result = insertSessionBlocks(result, sessionBlocks);
  }

  return result;
}
