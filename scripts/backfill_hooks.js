import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parsers for command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;

console.log(`🚀 Starting Backfill Hooks Script (Dry Run: ${dryRun}, Limit: ${limit})`);

// 1. Read .env.local file to retrieve credentials
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.error(`❌ Error: .env.local file not found at ${envPath}`);
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            env[key] = val;
        }
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];
const openaiKey = env['OPENAI_API_KEY'];

if (!supabaseUrl || !supabaseKey || !openaiKey) {
    console.error('❌ Error: Missing credentials in .env.local.');
    console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? 'Present' : 'Missing'}`);
    console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseKey ? 'Present' : 'Missing'}`);
    console.log(`OPENAI_API_KEY: ${openaiKey ? 'Present' : 'Missing'}`);
    process.exit(1);
}

// 2. Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Fetch missing messages
async function run() {
    const { data: messages, error } = await supabase
        .from('push_messages')
        .select('id, title, body, is_ad')
        .is('marketing_hook', null)
        .not('body', 'is', null)
        .order('posted_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('❌ Error fetching messages from Supabase:', error);
        process.exit(1);
    }

    console.log(`🔍 Found ${messages.length} messages without marketing hooks.`);

    if (messages.length === 0) {
        console.log('✅ Nothing to process.');
        return;
    }

    // 4. Process each message via OpenAI
    let processed = 0;
    let succeeded = 0;

    for (const msg of messages) {
        processed++;
        console.log(`[${processed}/${messages.length}] Analyzing Msg ID: ${msg.id} | Title: "${msg.title || '(No Title)'}"`);

        try {
            const prompt = `You are an AI assistant specialized in analyzing push notifications.
Analyze the push notification's title and body, and output a JSON object containing:
- "marketing_hook": A short, catchy phrase representing the core hook/value proposition (max 15 characters, e.g. "10% 할인 쿠폰", "주말 무료배송", "마지막 한정판매"). If there is no clear marketing hook (e.g. a system / transaction notice), provide a short summary like "배송 안내", "로그인 안내".
- "hook_type": Must be exactly one of: 'price', 'urgency', 'personal', 'curiosity', 'newness', 'social_proof', 'benefit', 'content', 'event', 'community', 'other'.
- "hook_trigger": Must be exactly one of: 'scarcity', 'greed', 'personalization', 'curiosity', 'social_proof', 'novelty', 'none'.

Notification - Title: "${msg.title || ''}", Body: "${msg.body || ''}"`;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openaiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    response_format: { type: "json_object" },
                    messages: [
                        {
                            role: "system",
                            content: "You output JSON strictly matching schema specifications."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI HTTP Error: ${response.status} - ${await response.text()}`);
            }

            const responseData = await response.json();
            const contentText = responseData.choices?.[0]?.message?.content;
            if (!contentText) {
                throw new Error('No content returned in OpenAI response choices.');
            }

            const analysis = JSON.parse(contentText);
            const { marketing_hook, hook_type, hook_trigger } = analysis;

            // Validate enums to prevent database constraint failures
            const VALID_HOOK_TYPES = ['price', 'urgency', 'personal', 'curiosity', 'newness', 'social_proof', 'benefit', 'content', 'event', 'community', 'other'];
            const VALID_HOOK_TRIGGERS = ['scarcity', 'greed', 'personalization', 'curiosity', 'social_proof', 'novelty', 'none'];

            const finalHook = (marketing_hook || '').slice(0, 15);
            const finalType = VALID_HOOK_TYPES.includes(hook_type) ? hook_type : 'other';
            const finalTrigger = VALID_HOOK_TRIGGERS.includes(hook_trigger) ? hook_trigger : 'none';

            console.log(`   ✨ Calculated: Hook: "${finalHook}", Type: "${finalType}", Trigger: "${finalTrigger}"`);

            if (!dryRun) {
                const { error: updateError } = await supabase
                    .from('push_messages')
                    .update({
                        marketing_hook: finalHook,
                        hook_type: finalType,
                        hook_trigger: finalTrigger,
                        hook_analyzed_at: new Date().toISOString()
                    })
                    .eq('id', msg.id);

                if (updateError) {
                    throw updateError;
                }
                console.log(`   ✅ DB Update successful.`);
            } else {
                console.log(`   ⚠️ [Dry Run] DB Update skipped.`);
            }

            succeeded++;
        } catch (e) {
            console.error(`   ❌ Error processing Msg ID ${msg.id}:`, e.message || e);
        }

        // Add a tiny delay to not bombard the APIs
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`🎉 Operations finished. Succeeded: ${succeeded}/${processed}`);
}

run().catch(console.error);
