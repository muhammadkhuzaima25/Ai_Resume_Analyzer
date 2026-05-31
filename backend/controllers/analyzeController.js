const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PDFParse } = require('pdf-parse');
const Analysis = require('../models/Analysis');
const https = require('https');

const MAX_KEYWORDS = 12;
const OPENROUTER_MODEL = 'meta-llama/llama-3-70b-instruct:free';
const BASE_URL = process.env.BASE_URL || 'https://resumatch-hub.vercel.app';

function buildPrompt(jobDescription, resumeText) {
  const wordCount = (resumeText || '').trim().split(/\s+/).filter(Boolean).length;
  const isShortText = wordCount < 30;
  const targetKeywords = extractKeywordsFromJD(jobDescription);
  const totalKeywords = targetKeywords.length;

  return `You are a strict, unbiased ATS Scanner. Analyze the provided resume text against the job description text.

${isShortText ? 'WARNING: The resume text below is very short (' + wordCount + ' words). PDF text extraction may have failed. Do NOT hallucinate or guess. Score based ONLY on visible text. If empty, return score 0 and state "Text could not be extracted properly."' : ''}

## STRICT INSTRUCTIONS — FOLLOW EXACTLY

The job description has ${totalKeywords} required skills/technologies. Your task is to check each one against the resume.

Step 1: List all ${totalKeywords} required keywords from the job description.
Step 2: For each keyword, check if it appears EXACTLY (case-insensitive substring match) in the resume text.
Step 3: Calculate score = (Matched Keywords / ${totalKeywords}) × 10. This is your ONLY score formula.
Step 4: If text extraction is empty or poor, return score 0 and state "Text could not be extracted properly."

## KEYWORD RULES (CRITICAL)
- If a keyword is NOT found verbatim in the resume text, it MUST go in "missingKeywords".
- Do NOT put matched keywords in "missingKeywords".
- Do NOT claim a keyword is present if it is not literally in the resume text.

## KEY STRENGTHS RULES (CRITICAL)
- "strengths" must list ONLY actual skills/qualifications found in the resume text that also match the job requirements.
- Each strength must be a real, verifiable skill from the resume (e.g., "JavaScript experience", "React.js project work").
- Do NOT invent or hallucinate strengths. If nothing matches, leave the array empty.

## RECOMMENDED REVISIONS RULES
- Each revision must be a SHORT, specific, actionable bullet (max 15 words).
- Example: "Add 'React.js' to your skills section" — not a paragraph.
- Example: "Quantify your experience with metrics."
- Example: "Add a summary section highlighting your top 3 skills."
- Exactly 3 short bullets required.

## CONSISTENCY RULES (CRITICAL)
- score < 5 → summary starts with "Low Match:" and describes what is missing.
- score >= 5 and < 8 → summary starts with "Moderate Match:".
- score >= 8 → summary starts with "Strong Match:".
- The summary MUST match the numeric score. Never say "strong alignment" for a score below 5.

## SECTION FEEDBACK RULES
- "skills": Be critical. State exactly which skills matched and which are missing. Mention counts.
- "experience": Be critical. If no experience section detected, say so. If experience is weak, say so.
- "education": Be critical. If no education info found, say so. Do not invent credentials.
- Do NOT give generic praise. Be honest.

## JSON OUTPUT RULES
Respond with ONLY a valid JSON object. No markdown, no code blocks, no explanations. Use ONLY standard ASCII double quotes.

The JSON must have this exact structure:
{"score": 4.0, "summary": "Low Match: Only 2 of ${totalKeywords} required keywords found in the resume.", "missingKeywords": ["keyword1", "keyword2"], "strengths": ["Actual skill from resume"], "recommendedRevisions": ["Add 'Keyword1' to your skills section.", "Quantify your React experience with metrics.", "Add a professional summary section."], "section_feedback": {"skills": "Skills feedback.", "experience": "Experience feedback.", "education": "Education feedback."}}

Job Description:
${jobDescription}

Resume Text:
${resumeText}`;
}

function buildSkillsPrompt(jobDescription, resumeText) {
  const isShortText = (resumeText || '').trim().split(/\s+/).length < 30;

  return `You are a strict ATS system analyzing Skills Alignment.

${isShortText ? 'WARNING: Resume text is very short. Do NOT hallucinate. Base analysis ONLY on visible text.' : ''}

Rules:
- List which specific JD skills appear in the resume. Count them.
- List which critical skills are missing.
- Be quantitative: "X of Y required skills found".
- Be CRITICAL and HONEST. Do NOT give generic praise.
- If no skills match, say so directly.
- If text is too short, state "Text too short for meaningful analysis."

Return ONLY valid JSON:
{"skills": "Honest, quantitative analysis of skills match. Include exact counts."}

Job Description:
${jobDescription}

Resume Text:
${resumeText}`;
}

function buildExperiencePrompt(jobDescription, resumeText) {
  const isShortText = (resumeText || '').trim().split(/\s+/).length < 30;

  return `You are a strict ATS system analyzing Experience Alignment.

${isShortText ? 'WARNING: Resume text is very short. Do NOT hallucinate experience. Base ONLY on visible text.' : ''}

Rules:
- Check for job titles, years, role relevance, career progression.
- Be CRITICAL and HONEST. If experience section is missing, say so.
- Do NOT invent or infer experience that is not explicitly stated.
- If text is insufficient, state "Experience section not found in extracted text."

Return ONLY valid JSON:
{"experience": "Honest analysis of experience match. Mention what is present and what is missing."}

Job Description:
${jobDescription}

Resume Text:
${resumeText}`;
}

function buildEducationPrompt(jobDescription, resumeText) {
  const isShortText = (resumeText || '').trim().split(/\s+/).length < 30;

  return `You are a strict ATS system analyzing Education & Credentials alignment.

${isShortText ? 'WARNING: Resume text is very short. Do NOT hallucinate credentials. Base ONLY on visible text.' : ''}

Rules:
- Check for degrees, certifications, licenses in the resume text.
- Be CRITICAL and HONEST. If no education section, say so.
- Do NOT invent credentials or assume degrees.
- If text is insufficient, state "Education section not found."

Return ONLY valid JSON:
{"education": "Honest analysis of education match. Mention what is present and what is missing."}

Job Description:
${jobDescription}

Resume Text:
${resumeText}`;
}

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callOpenRouter(prompt) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const options = {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': BASE_URL,
        'X-Title': 'ResuMatch.ai'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.error) {
            reject(new Error(response.error.message || 'OpenRouter error'));
            return;
          }
          const choice = response.choices?.[0];
          const content = choice?.message?.content;
          const finishReason = choice?.finish_reason;
          if (!content || content.trim() === '') {
            console.error('[OpenRouter] Empty content — finish_reason:', finishReason, '| raw response snippet:', JSON.stringify(response).substring(0, 300));
            reject(new Error(`OpenRouter returned empty content (finish_reason: ${finishReason || 'unknown'})`));
            return;
          }
          resolve(content);
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function callWithFallback(prompt, source) {
  try {
    console.log(`[${source}] Primary provider: Google Gemini (gemini-1.5-flash) — sending request...`);
    const response = await callGemini(prompt);
    console.log(`[${source}] Gemini succeeded — response length:`, response?.length);
    return response;
  } catch (geminiError) {
    console.warn(`[${source}] Gemini FAILED — name: ${geminiError.name}, message: ${geminiError.message}`);
    console.warn(`[${source}] Switching to fallback provider: OpenRouter (${OPENROUTER_MODEL})`);

    try {
      console.log(`[${source}] Sending request to OpenRouter (${OPENROUTER_MODEL})...`);
      const response = await callOpenRouter(prompt);
      console.log(`[${source}] OpenRouter succeeded — response length:`, response?.length);
      return response;
    } catch (openRouterError) {
      console.warn(`[${source}] OpenRouter also FAILED — name: ${openRouterError.name}, message: ${openRouterError.message}`);
      return null;
    }
  }
}

function parseAIResponse(responseText) {
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.warn('Failed to parse AI response as JSON. Attempting cleanup...');
    let cleanResponse = responseText
      .trim()
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();
    try {
      return JSON.parse(cleanResponse);
    } catch (e2) {
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('AI returned invalid JSON format. Please try again.');
    }
  }
}

function buildMockFallback(jobDescription, resumeText) {
  const resumeLower = (resumeText || '').toLowerCase();
  const targetKeywords = extractKeywordsFromJD(jobDescription);

  const matchedKeywords = targetKeywords.filter(kw => resumeLower.includes(kw));
  const missingKeywords = targetKeywords.filter(kw => !resumeLower.includes(kw));

  const totalKeywords = targetKeywords.length;
  const keywordPct = totalKeywords > 0 ? matchedKeywords.length / totalKeywords : 0;
  const score = Math.round(keywordPct * 10 * 10) / 10;

  // --- Education analysis ---
  const eduKeywords = ['bachelor', 'master', 'phd', 'ph.d.', 'b.s.', 'm.s.', 'b.a.', 'm.a.', 'btech', 'mtech', 'bs', 'ba', 'ms', 'ma', 'mba', 'associate', 'diploma', 'degree', 'b.eng', 'm.eng', 'doctorate', 'certification', 'certified', 'cpa', 'pmp', 'aws', 'azure', 'gcp', 'comptia', 'ccna', 'ccnp', 'cissp'];
  const eduInResume = eduKeywords.filter(kw => resumeLower.includes(kw));

  // --- Experience analysis ---
  const expKeywords = ['senior', 'junior', 'lead', 'manager', 'director', 'head', 'chief', 'principal', 'staff', 'intern', 'internship', 'vp', 'vice president', 'cto', 'ceo', 'founder', 'year', 'years', 'experience', 'work history', 'professional experience', 'employment', 'career'];
  const expInResume = expKeywords.filter(kw => resumeLower.includes(kw));

  // --- Build summary ---
  const summary = score >= 8
    ? `Strong Match: ${matchedKeywords.length} of ${totalKeywords} required keywords found (${Math.round(keywordPct * 100)}%).`
    : score >= 5
      ? `Moderate Match: ${matchedKeywords.length} of ${totalKeywords} required keywords found (${Math.round(keywordPct * 100)}%). Some areas need improvement.`
      : `Low Match: Only ${matchedKeywords.length} of ${totalKeywords} required keywords found (${Math.round(keywordPct * 100)}%).`;

  // --- Build short bullet revisions ---
  const revisions = [];
  for (let i = 0; i < missingKeywords.length && revisions.length < 3; i++) {
    revisions.push(`Add '${missingKeywords[i]}' to your skills section.`);
  }
  if (revisions.length < 3 && eduInResume.length === 0) {
    revisions.push('Add your education and certifications.');
  }
  if (revisions.length < 3 && expInResume.length < 3) {
    revisions.push('Quantify your experience with metrics and numbers.');
  }
  while (revisions.length < 3) {
    revisions.push('Add a professional summary section highlighting your top skills.');
  }

  // --- Section-specific feedback (honest/critical) ---
  const skillsFeedback = matchedKeywords.length > 0
    ? `${matchedKeywords.length} of ${totalKeywords} required skills matched: ${matchedKeywords.join(', ')}. Missing: ${missingKeywords.length > 0 ? missingKeywords.join(', ') : 'none'}.`
    : `No required skills found in resume. Add: ${targetKeywords.join(', ')}.`;

  const experienceFeedback = expInResume.length > 0
    ? `Experience section detected (indicators: ${[...new Set(expInResume)].join(', ')}). Ensure bullet points include quantified achievements relevant to the target role.`
    : 'No clear experience section detected. Add a dedicated experience section with role titles, dates, and quantified achievements.';

  const educationFeedback = eduInResume.length > 0
    ? `Education credentials found: ${[...new Set(eduInResume)].join(', ')}.`
    : 'No formal education section detected. Add your degrees, certifications, and relevant academic projects.';

  return JSON.stringify({
    score,
    summary,
    missingKeywords: [...new Set(missingKeywords)],
    strengths: matchedKeywords.length > 0
      ? matchedKeywords.slice(0, 5).map(kw => `${kw} found in resume`)
      : [],
    recommendedRevisions: revisions.slice(0, 3),
    section_feedback: {
      skills: skillsFeedback,
      experience: experienceFeedback,
      education: educationFeedback,
    },
  });
}

function extractKeywordsFromJD(jobDescription) {
  const jdLower = (jobDescription || '').toLowerCase();
  const skillsMatch = jdLower.match(/(?:required\s+)?skills?\s*:\s*(.+)/);
  const skillsStr = skillsMatch ? skillsMatch[1] : jdLower;
  const rawItems = skillsStr.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  const cleaned = rawItems.map(s =>
    s.replace(/^(skill|required|knowledge of|experience with|proficient in|familiar with)\s*/i, '').trim()
  ).filter(Boolean);
  return cleaned.slice(0, MAX_KEYWORDS);
}

function getScoreBand(score) {
  if (score >= 8) return 'strong';
  if (score >= 5) return 'moderate';
  return 'low';
}

function buildConsistentSummary(score, matchedCount, totalKeywords) {
  const band = getScoreBand(score);
  const pct = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;
  if (band === 'low') {
    return `Low Match: Only ${matchedCount} of ${totalKeywords} required keywords found (${pct}%). Your resume needs significant improvements to match this role.`;
  }
  if (band === 'moderate') {
    return `Moderate Match: ${matchedCount} of ${totalKeywords} required keywords found (${pct}%). Some areas need improvement.`;
  }
  return `Strong Match: ${matchedCount} of ${totalKeywords} required keywords found (${pct}%). Your resume aligns well with this role.`;
}

async function analyzeWithAI(jobDescription, resumeText) {
  // --- Step 1: Main overall analysis with fallback chain ---
  const mainPrompt = buildPrompt(jobDescription, resumeText);
  let analysisResult = null;

  const mainResponse = await callWithFallback(mainPrompt, 'Main');
  if (mainResponse) {
    try {
      analysisResult = parseAIResponse(mainResponse);
    } catch (e) {
      console.warn('[AI] Main response parse failed:', e.message);
    }
  }

  if (!analysisResult) {
    console.warn('[AI] Main AI analysis unavailable — using keyword-based mock fallback for base structure');
    analysisResult = JSON.parse(buildMockFallback(jobDescription, resumeText));
  }

  // --- Step 2: Per-section fallback for Skills, Experience, Education ---
  const sectionBuilders = {
    skills: buildSkillsPrompt,
    experience: buildExperiencePrompt,
    education: buildEducationPrompt,
  };
  const sectionLabels = { skills: 'Skills', experience: 'Experience', education: 'Education' };

  for (const [key, builder] of Object.entries(sectionBuilders)) {
    const current = analysisResult.section_feedback?.[key];
    const isPlaceholder = !current || typeof current !== 'string' || current.trim() === '' || current.includes('not available');

    if (isPlaceholder) {
      console.log(`[AI] Section "${key}" feedback is placeholder or missing — attempting targeted AI analysis`);
      const sectionPrompt = builder(jobDescription, resumeText);
      const sectionResponse = await callWithFallback(sectionPrompt, sectionLabels[key]);

      if (sectionResponse) {
        try {
          const parsed = parseAIResponse(sectionResponse);
          if (parsed && typeof parsed[key] === 'string' && parsed[key].trim() !== '') {
            if (!analysisResult.section_feedback) analysisResult.section_feedback = {};
            analysisResult.section_feedback[key] = parsed[key];
            console.log(`[AI] Section "${key}" feedback updated via targeted AI analysis`);
            continue;
          }
        } catch (e) {
          console.warn(`[AI] Section "${key}" targeted AI parse failed:`, e.message);
        }
      }
      console.warn(`[AI] Section "${key}" targeted AI analysis failed — keeping existing fallback feedback`);
    }
  }

  // --- Step 3: Server-side keyword count from raw text (ground truth) ---
  const resumeLower = (resumeText || '').toLowerCase();
  const targetKeywords = extractKeywordsFromJD(jobDescription);
  const matchedCount = targetKeywords.filter(kw => resumeLower.includes(kw)).length;
  const keywordPct = targetKeywords.length > 0 ? matchedCount / targetKeywords.length : 0;

  console.log(`[AI] Ground truth keyword match: ${matchedCount}/${targetKeywords.length} (${(keywordPct * 100).toFixed(0)}%)`);

  // --- Step 4: Force missingKeywords from ground truth ---
  const groundTruthMissing = targetKeywords.filter(kw => !resumeLower.includes(kw));
  analysisResult.missingKeywords = [...new Set(groundTruthMissing)];

  // --- Step 5: Set score based ONLY on keyword match ratio ---
  // Formula: (Matched Skills / Total Required Skills) * 10
  const computedScore = Math.round(keywordPct * 10 * 10) / 10;
  const finalScore = Math.max(0, Math.min(10, computedScore));

  if (analysisResult.score !== finalScore) {
    console.warn(`[AI] Score override: AI gave ${analysisResult.score}, ground truth keyword match ${matchedCount}/${targetKeywords.length} → overriding to ${finalScore}`);
  }
  analysisResult.score = finalScore;

  // --- Step 6: Force summary to match score band ---
  analysisResult.summary = buildConsistentSummary(finalScore, matchedCount, targetKeywords.length);

  // --- Step 7: Build strengths from ACTUAL matched resume skills ---
  const actualMatchedSkills = targetKeywords.filter(kw => resumeLower.includes(kw));
  const strengths = actualMatchedSkills.length > 0
    ? actualMatchedSkills.slice(0, 5).map(kw => `${kw} found in resume`)
    : [];
  analysisResult.strengths = strengths;

  // --- Step 8: Build short bullet recommended revisions from missing keywords ---
  const revisionBullets = [];
  for (let i = 0; i < groundTruthMissing.length && revisionBullets.length < 3; i++) {
    revisionBullets.push(`Add '${groundTruthMissing[i]}' to your skills section.`);
  }
  if (revisionBullets.length < 3) {
    const hasExpSection = /(experience|work|employment|career)/i.test(resumeText);
    if (!hasExpSection) revisionBullets.push('Add a dedicated experience section with role titles and dates.');
  }
  if (revisionBullets.length < 3) {
    const hasEduSection = /(education|degree|bachelor|master|phd|university|college)/i.test(resumeText);
    if (!hasEduSection) revisionBullets.push('Add your education and certifications section.');
  }
  while (revisionBullets.length < 3) {
    revisionBullets.push('Quantify your achievements with specific metrics.');
  }
  analysisResult.recommendedRevisions = revisionBullets.slice(0, 3);

  // --- Step 9: Guarantee identical JSON structure ---
  analysisResult.section_feedback = {
    skills: (analysisResult.section_feedback && typeof analysisResult.section_feedback.skills === 'string')
      ? analysisResult.section_feedback.skills : 'Skills alignment analysis not available.',
    experience: (analysisResult.section_feedback && typeof analysisResult.section_feedback.experience === 'string')
      ? analysisResult.section_feedback.experience : 'Experience alignment analysis not available.',
    education: (analysisResult.section_feedback && typeof analysisResult.section_feedback.education === 'string')
      ? analysisResult.section_feedback.education : 'Education & credentials analysis not available.',
  };

  return JSON.stringify(analysisResult);
}

const analyzeResume = async (req, res) => {
  const { jobTitle, requiredSkills } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a resume PDF file' });
  }

  if (!jobTitle || jobTitle.trim() === '') {
    return res.status(400).json({ message: 'Please provide a target job title' });
  }

  if (!requiredSkills || requiredSkills.trim() === '') {
    return res.status(400).json({ message: 'Please provide required skills' });
  }

  const jobDescription = `Job Title: ${jobTitle.trim()}. Required Skills: ${requiredSkills.trim()}`;

  try {
    // 1. Extract text from PDF buffer
    const pdfBuffer = req.file.buffer;
    const fileSizeKb = (pdfBuffer.length / 1024).toFixed(1);
    const uint8Array = new Uint8Array(pdfBuffer);
    const parser = new PDFParse({ data: uint8Array });
    const pdfData = await parser.getText();
    const resumeText = pdfData.text || '';

    const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;
    console.log(`[analyzeResume] PDF size: ${fileSizeKb}KB | extracted ${wordCount} words`);

    if (!resumeText.trim()) {
      return res.status(400).json({ message: 'Could not extract any text from the PDF. The file may be scanned/image-based (no selectable text). Please upload a text-based PDF.' });
    }

    if (wordCount < 30) {
      console.warn(`[analyzeResume] WARNING: Only ${wordCount} words extracted — PDF may be corrupted, scanned, or image-only. Proceeding with caution.`);
    }

    // 2. Call AI with auto-fallback across all sections
    const responseText = await analyzeWithAI(jobDescription, resumeText);
    const analysisResult = JSON.parse(responseText);

    // 3. Validate required fields
    const { score, summary, missingKeywords, strengths, recommendedRevisions, section_feedback } = analysisResult;
    
    if (typeof score !== 'number' || !summary) {
      throw new Error('AI response did not contain expected fields');
    }

    // 4. Save to MongoDB
    const analysis = await Analysis.create({
      userId: req.user.id,
      score,
      summary,
      missingKeywords: Array.isArray(missingKeywords) ? missingKeywords : [],
      strengths: Array.isArray(strengths) ? strengths : [],
      recommendedRevisions: Array.isArray(recommendedRevisions) ? recommendedRevisions : [],
      section_feedback,
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error during analysis:', error);
    
    // Check for API configuration errors
    if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ message: 'No AI API key configured. Please set GEMINI_API_KEY or OPENROUTER_API_KEY in .env' });
    }
    
    res.status(500).json({ message: 'Error processing resume analysis: ' + error.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .maxTimeMS(5000);
    return res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    return res.json([]);
  }
};

const deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    await Analysis.deleteOne({ _id: req.params.id });
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting analysis: ' + error.message });
  }
};

module.exports = {
  analyzeResume,
  getHistory,
  deleteAnalysis,
};