const NOTION_API_URL = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

/**
 * Notion APIにページ（メモ）を作成する
 */
export async function createNote(apiKey, databaseId, content) {
  const now = new Date();
  const title = formatDateTime(now);

  const response = await fetch(`${NOTION_API_URL}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: { content: title },
            },
          ],
        },
        Date: {
          date: { start: now.toISOString() },
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: { content },
              },
            ],
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Notion API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Notionデータベースから最近のメモ一覧を取得する
 */
export async function fetchNotes(apiKey, databaseId, pageSize = 20) {
  const response = await fetch(`${NOTION_API_URL}/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION,
    },
    body: JSON.stringify({
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: pageSize,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Notion API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results.map(parseNotePage);
}

/**
 * ページのブロック内容を取得する
 */
export async function fetchPageContent(apiKey, pageId) {
  const response = await fetch(`${NOTION_API_URL}/blocks/${pageId}/children`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Notion API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results
    .filter((block) => block.type === 'paragraph')
    .map((block) =>
      block.paragraph.rich_text.map((t) => t.plain_text).join('')
    )
    .join('\n');
}

function parseNotePage(page) {
  const titleProp = page.properties.Name;
  const dateProp = page.properties.Date;

  const title = titleProp?.title?.[0]?.plain_text || '(無題)';
  const date = dateProp?.date?.start || page.created_time;

  return {
    id: page.id,
    title,
    date,
  };
}

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}
