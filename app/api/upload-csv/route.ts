import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

// Type for CSV row after parsing
interface CSVRow {
  'Team ID': string;
  'Team Name': string;
  'Candidate role': string;
  'Candidate\'s Name': string;
  'Candidate\'s Email': string;
  [key: string]: string; // For any other fields in the CSV
}

// Type for processed participant data
interface ParticipantData {
  team_id: string;
  team_name: string;
  candidate_role: string;
  candidate_name: string;
  candidate_email: string;
  participant_id: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');

    // Validate file exists and is a File object
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      );
    }

    // Validate file is a CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Parse CSV file
    const csvText = await file.text();
    const { data, errors } = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    // Check for parsing errors
    if (errors.length > 0) {
      console.error('CSV parsing errors:', errors);
      return NextResponse.json(
        { 
          error: 'Failed to parse CSV file', 
          details: errors 
        },
        { status: 400 }
      );
    }

    // Process the data and generate participant IDs
    const processedData = processParticipantData(data);

    // Insert data into Supabase
    const { data: insertedData, error } = await supabase
      .from('participants_data')
      .insert(processedData)
      .select('id');

    if (error) {
      console.error('Error inserting data:', error);
      return NextResponse.json(
        { 
          error: 'Failed to insert data into database',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      message: 'CSV processed successfully',
      rowsInserted: processedData.length,
      insertedIds: insertedData.map((row: { id: string }) => row.id)
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle all other HTTP methods
export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

/**
 * Process participant data from CSV rows and generate participant IDs
 * @param rows - Array of CSV rows
 * @returns Array of processed participant data
 */
function processParticipantData(rows: CSVRow[]): ParticipantData[] {
  // Group participants by Team ID
  const teamGroups = new Map<string, CSVRow[]>();
  
  rows.forEach(row => {
    const teamId = row['Team ID'];
    if (!teamGroups.has(teamId)) {
      teamGroups.set(teamId, []);
    }
    teamGroups.get(teamId)?.push(row);
  });

  // Assign team numbers and generate participant IDs
  const processedData: ParticipantData[] = [];
  let teamNumber = 1;

  // Process each team
  teamGroups.forEach((teamMembers, teamId) => {
    const paddedTeamNumber = String(teamNumber).padStart(3, '0');
    
    // Process each member in the team
    teamMembers.forEach((member, memberIndex) => {
      const memberNumber = String(memberIndex + 1).padStart(2, '0');
      const participantId = `HC${paddedTeamNumber}${memberNumber}`;
      
      processedData.push({
        team_id: teamId,
        team_name: member['Team Name'],
        candidate_role: member['Candidate role'],
        candidate_name: member['Candidate\'s Name'],
        candidate_email: member['Candidate\'s Email'],
        participant_id: participantId
      });
    });
    
    // Increment team number for the next team
    teamNumber++;
  });

  return processedData;
}
