#!/bin/bash
# retrogravity.sh - Script to reproduce changes
# This script is not executable by default.
cat << 'FILE_CONTENT' > src/types.ts
$(cat src/types.ts)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/components/StudySetup.tsx
$(cat src/components/StudySetup.tsx)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/components/StudySetup.tsx
$(cat src/components/StudySetup.tsx)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/lib/prompts/interview.ts
$(cat src/lib/prompts/interview.ts)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/components/InterviewChat.tsx
$(cat src/components/InterviewChat.tsx)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/components/StudySetup.tsx
$(cat src/components/StudySetup.tsx)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/app/api/greeting/route.ts
$(cat src/app/api/greeting/route.ts)
FILE_CONTENT
cat src/app/api/interview/route.ts | cat << 'EOF' >> retrogravity.sh
cat << 'FILE_CONTENT' > src/app/api/interview/route.ts
$(cat src/app/api/interview/route.ts)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/services/storageService.ts
$(cat src/services/storageService.ts)
FILE_CONTENT
cat src/components/InterviewChat.tsx | cat << 'EOF' >> retrogravity.sh
cat << 'FILE_CONTENT' > src/components/InterviewChat.tsx
$(cat src/components/InterviewChat.tsx)
FILE_CONTENT
cat << 'FILE_CONTENT' > src/components/InterviewChat.tsx
$(cat src/components/InterviewChat.tsx)
FILE_CONTENT
