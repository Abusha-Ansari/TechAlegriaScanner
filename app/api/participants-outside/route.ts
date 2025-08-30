import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get the latest log entry for each participant to determine their current status
    const { data: latestLogs, error: logsError } = await supabase
      .from('participants_log')
      .select(`
        participant_id,
        is_inside,
        toggled_at,
        participants_data (
          participant_id,
          candidate_name,
          candidate_email,
          team_name,
          candidate_role,
          team_id
        )
      `)
      .order('participant_id, toggled_at', { ascending: false });

    if (logsError) {
      console.error('Error fetching participant logs:', logsError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch participant logs',
          details: logsError.message
        },
        { status: 500 }
      );
    }

    // Group by participant_id and get the most recent entry for each
    const participantStatusMap = new Map();
    
    if (latestLogs) {
      for (const log of latestLogs) {
        if (!participantStatusMap.has(log.participant_id)) {
          participantStatusMap.set(log.participant_id, log);
        }
      }
    }

    // Filter participants who are currently outside (is_inside = false)
    const outsideParticipants = Array.from(participantStatusMap.values())
      .filter(log => !log.is_inside && log.participants_data)
      .map(log => ({
        participant_id: log.participant_id,
        candidate_name: log.participants_data.candidate_name,
        candidate_email: log.participants_data.candidate_email,
        team_name: log.participants_data.team_name,
        candidate_role: log.participants_data.candidate_role,
        team_id: log.participants_data.team_id,
        last_seen: log.toggled_at,
        status: 'outside'
      }));

    return NextResponse.json({
      participants: outsideParticipants,
      total_count: outsideParticipants.length,
      scanned_outside: outsideParticipants.length,
      never_scanned: 0
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in participants-outside route:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handlers for rejecting non-GET methods with 405 Method Not Allowed
export async function POST() {
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
