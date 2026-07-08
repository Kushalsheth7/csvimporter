const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'MISSING_API_KEY',
});

const SYSTEM_PROMPT = `
You are an intelligent data extraction AI. You will be provided with an array of objects representing rows from a messy CSV.
Your job is to map these rows exactly into our structured CRM format. 

You MUST output ONLY valid JSON. The JSON should be an object containing a single key "records" which is an array of objects.

Each object in the array MUST have the following schema:
{
  "created_at": "string - Lead creation date (convertible via new Date() in JavaScript)",
  "name": "string - Lead name",
  "email": "string - Primary email address. If multiple emails exist, put the first one here.",
  "country_code": "string - Country code of the phone number (e.g., +91, +1)",
  "mobile_without_country_code": "string - Primary mobile number without country code. If multiple exist, put first here.",
  "company": "string - Company name",
  "city": "string - City",
  "state": "string - State",
  "country": "string - Country",
  "lead_owner": "string - Lead owner",
  "crm_status": "string - Lead status. MUST BE EXACTLY ONE OF: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE",
  "crm_note": "string - Remarks, follow-up notes, additional comments, and ANY extra emails or extra phone numbers if multiple exist.",
  "data_source": "string - Source. MUST BE EXACTLY ONE OF: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. Leave null if no match.",
  "possession_time": "string - Property possession time",
  "description": "string - Additional description"
}

Instructions:
1. Ensure the output strictly follows the provided schema exactly as written. Do not wrap in markdown \`\`\`json.
2. Maintain a 1-to-1 mapping: For every row provided in the input, produce exactly one corresponding record in the output array in the same order.
3. Allowed CRM Status Values (use ONLY ONE OF): GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE. If the input doesn't cleanly map to these, map it to the closest one or leave blank.
4. Allowed Data Source Values (use ONLY ONE OF): leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. If none match confidently, leave blank (null).
5. Date Format: 'created_at' must be a valid date string that can be parsed by new Date(created_at) in JS.
6. CRM Notes: Use 'crm_note' for Remarks, Follow-up notes, Additional comments.
7. Multiple Emails/Phones: If a row has multiple emails, use the first one for 'email' and append the remaining emails into 'crm_note'. If multiple mobile numbers exist, use the first for 'mobile_without_country_code' and append the remaining into 'crm_note'.
`;

async function processCSVBatch(rows, maxRetries = 3) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in the environment.');
  }

  const prompt = `Extract the CRM fields from the following CSV rows:\n\n${JSON.stringify(rows, null, 2)}`;

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        model: process.env.LLM_MODEL || 'llama3-8b-8192',
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const outputText = response.choices[0]?.message?.content || '{}';
      const jsonOutput = JSON.parse(outputText);
      
      // Return the records array
      return jsonOutput.records || [];
    } catch (error) {
      attempt++;
      console.error(`Error calling Groq API (Attempt ${attempt} of ${maxRetries}):`, error.message || error);
      
      if (attempt >= maxRetries) {
        throw new Error(`Failed to process batch after ${maxRetries} attempts. Last error: ${error.message || error}`);
      }
      
      // Exponential backoff: 2s, 4s, 8s...
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${delay}ms before retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = {
  processCSVBatch
};
