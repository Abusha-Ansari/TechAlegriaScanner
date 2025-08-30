import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { participant_id } = body;

    // Validate participant_id
    if (!participant_id || typeof participant_id !== 'string') {
      return NextResponse.json(
        { error: 'participant_id is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate participant exists in participants_data
    const { data: participant, error: participantError } = await supabase
      .from('participants_data')
      .select('participant_id, candidate_name')
      .eq('participant_id', participant_id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { 
          error: 'Participant not found',
          details: participantError?.message || 'No participant found with the provided ID'
        },
        { status: 404 }
      );
    }

    // Fetch the latest log for this participant to determine current state
    const { data: latestLog, error: logError } = await supabase
      .from('participants_log')
      .select('is_inside, toggled_at')
      .eq('participant_id', participant_id)
      .order('toggled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Handle error fetching logs (but not "no rows found")
    if (logError && !logError.message.includes('No rows found')) {
      console.error('Error fetching participant logs:', logError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch participant logs',
          details: logError.message
        },
        { status: 500 }
      );
    }

    // Determine new state
    let newState: boolean;
    if (!latestLog) {
      // First scan - default to outside (false) as participant is entering premises
      newState = false;
    } else {
      // Toggle the last known state
      newState = !latestLog.is_inside;
    }

    // Insert new log entry with toggled state
    const { data: newLog, error: insertError } = await supabase
      .from('participants_log')
      .insert({
        participant_id,
        is_inside: newState,
        // toggled_at will be automatically set by the database
      })
      .select('toggled_at')
      .single();

    if (insertError) {
      console.error('Error inserting participant log:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to log participant state',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        participant_id,
        participant_name: participant.candidate_name,
        new_state: newState,
        toggled_at: newLog.toggled_at,
        status_text: newState ? 'inside' : 'outside'
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in logs route:', error);
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
