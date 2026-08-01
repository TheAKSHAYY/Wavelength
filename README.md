# Wavelength Dashboard

## Setup

1. Install dependencies:

```bash
npm install
```

2. Add your OpenAI API key in `.env`:

```env
OPENAI_API_KEY=your_real_api_key_here
OPENAI_MODEL=gpt-5
PORT=4180
```

3. Build the app:

```bash
npm run build
```

4. Start the app with the backend API:

```bash
npm start
```

Open:

```text
http://127.0.0.1:4180
```

If no API key is set, the app still works with local fallback data.
