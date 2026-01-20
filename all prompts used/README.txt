================================================================================
PAWSY - ALL PROMPTS USED
================================================================================

This folder contains copies of all prompts actively used in the Pawsy app.
These are for documentation/reference purposes only.

The actual prompts live in the source code at:
- src/services/api/gemini.js

================================================================================
FILES IN THIS FOLDER
================================================================================

1-CHAT-SYSTEM-PROMPT.txt
   - The main system prompt for all chat conversations
   - Defines Pawsy's personality, scope, dog profile usage, emergency protocols
   - Includes photo context section (when user analyzed a photo)
   - Includes at-home diagnostic tests guidance
   - ~280 lines, very comprehensive

2-PHOTO-ANALYSIS-SYSTEM-PROMPT.txt
   - System prompt for analyzing uploaded dog photos
   - Handles image validation (is it a dog?)
   - Breed verification (visual vs profile)
   - Image quality assessment
   - Health concern analysis
   - ~95 lines

3-CHAT-JSON-FORMAT-PROMPT.txt
   - Appended to every user message in chat
   - Tells AI to respond with structured JSON
   - Defines all response fields (urgency, symptoms, conditions, etc.)
   - Primary model version (more detailed)

4-FALLBACK-CHAT-JSON-FORMAT-PROMPT.txt
   - Same as above but shorter
   - Used when primary model fails and fallback is needed

5-WELCOME-MESSAGE.txt
   - Static greeting shown when starting new chat
   - Not sent to AI - displayed directly in UI

================================================================================
UNUSED/DEAD CODE (can be deleted)
================================================================================

src/services/prompts/chatPrompts.js
   - Contains buildSystemPrompt() and getWelcomeMessage()
   - NEVER imported or used anywhere in the codebase
   - Chat.jsx has its own local getWelcomeMessage()
   - gemini.js has its own buildChatSystemPrompt()
   - This file is completely dead code

================================================================================
