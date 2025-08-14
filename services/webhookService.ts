
const WEBHOOK_URL = 'https://primary-production-76569.up.railway.app/webhook/cleazyclean';

/**
 * Cleans the bot response, which may be HTML or markdown, to a formatted
 * plain text string that preserves line breaks for display. It handles
 * responses wrapped in iframes, converts basic HTML formatting into
 * newlines, and removes markdown asterisks.
 * @param text The raw text response from the bot.
 * @returns The cleaned, user-visible text with newlines.
 */
function cleanBotResponse(text: string): string {
  const trimmedText = text.trim();
  let htmlToParse = text;

  // If the response is wrapped in an iframe, extract and decode the srcdoc content.
  if (trimmedText.startsWith('<iframe') && trimmedText.endsWith('</iframe>')) {
    const match = trimmedText.match(/srcdoc="([\s\S]*?)"/);
    if (match && match[1]) {
      // The content of srcdoc is an HTML-encoded string.
      // We use a textarea to decode it into a raw HTML string.
      const decoder = document.createElement('textarea');
      decoder.innerHTML = match[1];
      htmlToParse = decoder.value;
    }
  }

  try {
    // Use a temporary DOM element to safely parse the HTML.
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlToParse;

    // Replace <br> tags with newline characters.
    tempDiv.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    // Ensure paragraphs are separated by a blank line.
    tempDiv.querySelectorAll('p').forEach(p => p.append('\n\n'));
    // Ensure list items are on new lines.
    tempDiv.querySelectorAll('li').forEach(li => li.append('\n'));

    let cleanedText = tempDiv.textContent || "";
    
    // Normalize multiple newlines to a maximum of two and trim whitespace.
    cleanedText = cleanedText.replace(/(\n\s*){3,}/g, '\n\n').trim();

    // Remove markdown-style asterisks for bolding and lists.
    return cleanedText.replace(/\*/g, '');
  } catch (e) {
    console.error("Error parsing bot response HTML:", e);
    // As a fallback, just strip all tags to prevent errors and remove asterisks.
    const decoder = document.createElement('textarea');
    decoder.innerHTML = text;
    return decoder.value.replace(/\*/g, '');
  }
}


export async function getBotResponse(userMessage: string): Promise<string> {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: userMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not retrieve error message body');
      console.error('Webhook response not OK:', response.status, response.statusText, errorText);
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const responseText = await response.text();
    if (!responseText) {
      console.warn('Received an empty response from server.');
      return 'Desculpe, recebi uma resposta vazia do servidor.';
    }
    
    let botText = responseText; // Default to the full response text

    try {
      // Try to parse as JSON, as this is the most likely format from n8n
      const data = JSON.parse(responseText);

      // n8n can return an array of items, we usually care about the first one.
      const item = Array.isArray(data) ? data[0] : data;

      // In n8n, the output of a node is often nested in a 'json' property.
      const content = item.json || item;
      
      let foundText: string | null = null;
      // Look for the answer in common properties.
      if (content && typeof content.myField === 'string') {
        foundText = content.myField;
      } else if (content && typeof content.text === 'string') {
        foundText = content.text;
      } else if (content && typeof content.message === 'string') {
        foundText = content.message;
      } else if (content && typeof content.answer === 'string') {
        foundText = content.answer;
      } else if (content && typeof content.reply === 'string') {
        foundText = content.reply;
      } else if (typeof content === 'string') {
        // If the content itself is a string
        foundText = content;
      }
      
      if (foundText !== null) {
        botText = foundText;
      } else {
        // As a fallback for debugging, stringify the received object.
        console.warn('Could not find a known text property in webhook response. Displaying raw JSON.', content);
        botText = JSON.stringify(content, null, 2);
      }

    } catch (e) {
      // If JSON parsing fails, it's likely a plain text response.
      // botText is already set to responseText, so we do nothing here.
    }
    
    // Clean the final determined text (whether from JSON or plain text)
    return cleanBotResponse(botText);

  } catch (error) {
    console.error('Error calling webhook:', error);
    // This will be caught by the App component and show a generic error message.
    throw error;
  }
}
