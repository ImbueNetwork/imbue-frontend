import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { prompt, max_tokens } = req.body;

    try {
      const openaiResponse = await axios({
        method: 'post',
        url: 'https://api.openai.com/v1/completions',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: "gpt-3.5-turbo-instruct",
          prompt: prompt,
          max_tokens: max_tokens
        }
      });
      return res.status(200).json({ text: openaiResponse.data.choices[0].text });
    } catch (error) {
      console.error('OpenAI API error:', error.response ? error.response.data : error);
      return res.status(500).json({ message: "Error calling the OpenAI API" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
