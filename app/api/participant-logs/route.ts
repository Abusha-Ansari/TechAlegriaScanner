import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all participant logs with participant details
    const { data: logs, error: logsError } = await supabase
      .from('participants_log')
      .select(`
        id,
        participant_id,
        is_inside,
        toggled_at,
        participants_data (
          candidate_name,
          candidate_email,
          team_name,
          candidate_role
        )
      `)
      .order('toggled_at', { ascending: false });

    // Handle database error
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

    // Return success response with all logs
    return NextResponse.json({
      logs: logs || [],
      total_count: logs?.length || 0
    }, { status: 200 });

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in participant-logs route:', error);
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
