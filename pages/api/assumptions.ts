import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'gif', 'webp'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', raw: 'Method not allowed' });
  }

  const { imageBase64 } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not set', raw: 'OpenAI API key not set' });
  }
  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided', raw: 'No image provided' });
  }

  // Check image format
  const match = imageBase64.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/i);
  if (!match || !SUPPORTED_FORMATS.includes(match[1].toLowerCase())) {
    return res.status(400).json({ error: 'Unsupported image format. Please upload a jpeg, png, gif, or webp image.', raw: 'Unsupported image format.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a master barber. Based on this photo, make your best guess for each of the following:\n- Gender (male or female only; do not answer 'unknown')\n- Hair type (straight, wavy, curly, coily)\n- Hair length for the top, sides, and back separately (provide a value for each: short, medium, or long; if an area is not visible, make your best guess)\n- Face shape (oval, round, square, heart, diamond)\n- Hair color (e.g., black, brown, blonde, red, gray, white, or a combination; do not answer 'unknown')\n\nYou must always provide your best guess for each field, even if you are unsure. Never answer 'unknown'. Always return your answer as a JSON object with these keys: gender, hairType, hairLengthTop, hairLengthSides, hairLengthBack, faceShape, hairColor, and a short description (as 'description'). Do not include any other text outside the JSON object.`
              },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'OpenAI API error', raw: errorText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No content in OpenAI response' });
    }

    try {
      // The response from GPT might be wrapped in ```json ... ```, so we need to extract it.
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      const parsedContent = JSON.parse(jsonString);
      return res.status(200).json(parsedContent);
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI:", content);
      return res.status(500).json({ error: 'Failed to parse AI response. Raw output logged.', raw: content });
    }

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from OpenAI', raw: String(error) });
  }
}
