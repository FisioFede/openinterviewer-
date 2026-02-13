# OpenInterviewer API Documentation

This document provides a comprehensive reference for the OpenInterviewer API endpoints.

## Base URL
All APIs are relative to the application base URL (e.g., `http://localhost:3000`).

## Authentication & Configuration

### `POST /api/auth`
Researcher login. Uses signed JWT session tokens for security.
- **Access**: Public
- **Body**: `{ password: string }`
- **Response**: `{ success: true }`
- **Error**: 401 if invalid password

### `GET /api/auth`
Check authentication status.
- **Access**: Public
- **Response**: `{ authenticated: boolean }`

### `DELETE /api/auth`
Logout researcher.
- **Access**: Public
- **Response**: `{ success: true }`

### `GET /api/config/status`
Check status of optional API keys.
- **Access**: Admin (Researcher)
- **Response**: `{ hasAnthropicKey: boolean, hasGeminiKey: boolean }`

## Demo Data

### `POST /api/demo/seed`
Seed the database with demo studies and interviews.
- **Access**: Admin
- **Response**: `{ success: true, message: string, data: { studiesSeeded: number, interviewsSeeded: number } }`

### `DELETE /api/demo/seed`
Clear all demo data from the database.
- **Access**: Admin
- **Response**: `{ success: true, message: string, data: { studiesDeleted: number, interviewsDeleted: number } }`

## Studies Management

### `GET /api/studies`
List all studies.
- **Access**: Admin
- **Response**: `{ studies: StoredStudy[] }`

### `POST /api/studies`
Create a new study.
- **Access**: Admin
- **Body**: `{ config: StudyConfig }`
- **Response**: `{ study: StoredStudy, message: string }`

### `GET /api/studies/[id]`
Get details of a specific study.
- **Access**: Admin
- **Response**: `{ study: StoredStudy }`

### `PUT /api/studies/[id]`
Update a study configuration.
- **Access**: Admin
- **Body**: `{ config: Partial<StudyConfig>, confirmed?: boolean }`
- **Note**: Modifying a study with existing interviews requires `confirmed: true`.
- **Response**: `{ study: StoredStudy, message: string }`

### `DELETE /api/studies/[id]`
Delete a study.
- **Access**: Admin
- **Response**: `{ message: string }`

### `GET /api/studies/[id]/links`
List generated participant links for a study.
- **Access**: Admin
- **Response**: `{ links: StoredLink[] }`

### `POST /api/studies/[id]/generate-followup`
Generate suggestions for a follow-up study based on synthesis results.
- **Access**: Admin
- **Body**: `{ synthesis: AggregateSynthesisResult }`
- **Response**: `{ followUpConfig: Partial<StudyConfig>, parentStudy: { id: string, name: string } }`

## Participant Links

### `POST /api/generate-link`
Generate a new participant link.
- **Access**: Admin
- **Body**: `{ studyConfig: StudyConfig }`
- **Response**: `{ token: string, url: string }`

### `GET /api/generate-link`
Verify and decode a participant token.
- **Access**: Public
- **Query Param**: `token` (string)
- **Response**: `{ valid: boolean, data: ParticipantToken }`

## Interview Process (Participant)

### `POST /api/greeting`
Get the initial greeting from the AI interviewer.
- **Access**: Participant Token
- **Body**: `{ studyConfig: StudyConfig }`
- **Response**: `{ greeting: string }`

### `POST /api/interview`
Generate the next AI response in an interview.
- **Access**: Participant Token
- **Body**: 
  ```json
  { 
    "history": "InterviewMessage[]",
    "studyConfig": "StudyConfig", 
    "participantProfile": "ParticipantProfile | null", 
    "questionProgress": "QuestionProgress", 
    "currentContext": "string"
  }
  ```
- **Response**: AI generated response (content, behavior suggestions, etc.)

### `POST /api/interviews/save`
Save a completed interview.
- **Access**: Participant Token or Admin
- **Body**: `Partial<StoredInterview>`
- **Response**: `{ success: true, id: string }`

## Analysis & Synthesis

### `GET /api/interviews`
List all interviews, optionally filtered by study.
- **Access**: Admin
- **Query Param**: `studyId` (optional)
- **Response**: `{ interviews: StoredInterview[] }`

### `GET /api/interviews/[id]`
Get a single interview by ID.
- **Access**: Admin
- **Response**: `{ interview: StoredInterview }`

### `GET /api/interviews/export`
Export all interviews as a ZIP file containing JSON and Markdown transcripts.
- **Access**: Admin
- **Response**: ZIP file download

### `POST /api/synthesis`
Generate synthesis/analysis for a single interview.
- **Access**: Participant Token or Admin
- **Body**: 
  ```json
  { 
    "history": "InterviewMessage[]",
    "studyConfig": "StudyConfig", 
    "behaviorData": "BehaviorData",
    "participantProfile": "ParticipantProfile | null" 
  }
  ```
- **Response**: `{ synthesis: SynthesisResult }`

### `POST /api/synthesis/aggregate`
Generate aggregate insights across multiple interviews in a study.
- **Access**: Admin
- **Body**: `{ studyId: string }`
- **Response**: `{ synthesis: AggregateSynthesisResult }`
